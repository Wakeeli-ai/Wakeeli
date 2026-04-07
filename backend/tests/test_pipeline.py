"""
Automated test suite for the Wakeeli AI pipeline.

Tests cover:
  A. Greeting detection and response
  B. Buy/rent intent detection
  C. Question count limit (<= 2 per response)
  D. Question priority ordering
  E. Off-topic redirect (no handoff event created)
  G. Name gate timing and extraction
  H. Multi-info messages (all fields in one shot)
  I. Handoff vs auto mode for booking interest

Run:
    cd /home/claw/claudeclaw/workspace/Wakeeli/backend
    python -m pytest tests/test_pipeline.py -v
"""
import sys
import os

# Make sure app package is importable when running from the backend dir.
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from unittest.mock import patch, MagicMock

from tests.conftest import make_extract_result, make_llm_response
from app.services.agent import process_user_message, get_session
from app.models import Event, Conversation, Message


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _reply_text(parts):
    """Join reply parts into a single lower-cased string for assertions."""
    return " ".join(parts).lower()


def _count_questions(parts):
    """Count question marks across all reply parts."""
    return sum(p.count("?") for p in parts)


def _run(db, conv_id, user_message, extract_result, llm_reply="How can I help you?", **kwargs):
    """
    Call process_user_message with mocked extract_entities and LLM.

    Returns (reply_parts, session).
    """
    with patch("app.services.agent.extract_entities", return_value=extract_result), \
         patch("app.services.agent.client") as mock_client, \
         patch("app.services.token_tracker.log_usage"), \
         patch("app.services.token_tracker._log_to_db"):
        mock_client.messages.create.return_value = make_llm_response(llm_reply)
        parts = process_user_message(db, conv_id, user_message, **kwargs)
    session = get_session(conv_id)
    return parts, session


# ===========================================================================
# A. GREETING TESTS
# These use the hardcoded greeting path (no LLM call needed).
# ===========================================================================

class TestGreetings:
    """A. bare greeting -> return greeting, ask how to help (no qualification Qs)."""

    def _run_greeting(self, db, conv_id, msg):
        extract = make_extract_result(classification="B", bare_greeting=True)
        # bare_greeting path never calls the LLM, so mock_client is safety only
        parts, session = _run(db, conv_id, msg, extract)
        return parts

    def test_hi(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "hi")
        text = _reply_text(parts)
        assert len(parts) >= 1
        assert "hello" in text or "help" in text or "ahla" in text or "marhaba" in text or "hi" in text, \
            f"Expected greeting in: {parts}"

    def test_hello(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "hello")
        text = _reply_text(parts)
        assert len(parts) >= 1
        assert "hello" in text or "help" in text, f"Expected greeting in: {parts}"

    def test_hey_there(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "hey there")
        text = _reply_text(parts)
        assert len(parts) >= 1
        assert "hello" in text or "help" in text or "hey" in text, \
            f"Expected greeting in: {parts}"

    def test_marhaba(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "marhaba")
        assert len(parts) >= 1
        text = _reply_text(parts)
        # Arabic greeting triggers Arabic response
        assert len(text) > 0, f"Expected non-empty response: {parts}"

    def test_greeting_does_not_ask_qualification_questions(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "hi")
        text = _reply_text(parts)
        # Must NOT ask for budget / bedrooms / listing type in a bare greeting response
        bad_phrases = ["budget", "bedroom", "rent or buy", "buy or rent", "how many"]
        for phrase in bad_phrases:
            assert phrase not in text, \
                f"Bare greeting response must not ask '{phrase}': {parts}"

    def test_greeting_does_not_ask_name(self, db, conv_id):
        parts = self._run_greeting(db, conv_id, "hi")
        text = _reply_text(parts)
        assert "your name" not in text and "what's your name" not in text, \
            f"Bare greeting must not ask for name: {parts}"


# ===========================================================================
# B. BUY / RENT DETECTION (checked via session state)
# ===========================================================================

class TestBuyRentDetection:
    """B. listing_type must be correctly stored in session state."""

    def test_generic_apartment_inquiry_no_listing_type(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type=None, location="Beirut")
        _, session = _run(db, conv_id, "looking for an apartment", extract)
        assert session.property_info.get("listing_type") is None, \
            "Generic apartment inquiry must not set listing_type"

    def test_i_want_to_buy(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="buy")
        _, session = _run(db, conv_id, "I want to buy", extract)
        assert session.property_info.get("listing_type") == "buy", \
            f"Expected listing_type='buy', got {session.property_info.get('listing_type')}"

    def test_i_want_to_rent(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="rent")
        _, session = _run(db, conv_id, "I want to rent", extract)
        assert session.property_info.get("listing_type") == "rent", \
            f"Expected listing_type='rent', got {session.property_info.get('listing_type')}"

    def test_looking_to_purchase(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="buy")
        _, session = _run(db, conv_id, "looking to purchase a home", extract)
        assert session.property_info.get("listing_type") == "buy"

    def test_need_a_place_to_rent(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="rent")
        _, session = _run(db, conv_id, "need a place to rent", extract)
        assert session.property_info.get("listing_type") == "rent"

    def test_villa_does_not_imply_buy(self, db, conv_id):
        # "I need a villa" - villa alone does not imply buy
        extract = make_extract_result(classification="B", listing_type=None)
        _, session = _run(db, conv_id, "I need a villa", extract)
        assert session.property_info.get("listing_type") is None, \
            "Villa keyword alone must not set listing_type"

    def test_asking_buy_or_rent_when_listing_type_unknown(self, db, conv_id):
        """When listing_type is null, the bot action should lead to asking buy/rent."""
        extract = make_extract_result(classification="B", listing_type=None, location="Beirut",
                                       budget_max=1200)
        # LLM mock returns a question about rent/buy
        parts, session = _run(
            db, conv_id,
            "looking for an apartment",
            extract,
            llm_reply="Is this for rent or to buy?"
        )
        text = _reply_text(parts)
        # The action should be more_info_needed with buy/rent question
        assert session.property_info.get("listing_type") is None
        # Reply must ask rent or buy (either from hardcoded path or LLM instruction)
        assert ("rent" in text or "buy" in text), \
            f"Expected rent/buy question in: {parts}"


# ===========================================================================
# C. QUESTION LIMIT (<= 2 question marks per response)
# ===========================================================================

class TestQuestionLimit:
    """C. Any bot response must contain at most 2 question marks."""

    def _assert_q_limit(self, db, conv_id, user_message, extract, llm_reply):
        parts, _ = _run(db, conv_id, user_message, extract, llm_reply)
        count = _count_questions(parts)
        assert count <= 2, \
            f"Response has {count} question marks (max 2). Parts: {parts}"

    def test_initial_message_question_limit(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="rent", location="Beirut")
        # LLM returns 2 questions
        self._assert_q_limit(
            db, conv_id,
            "I want to rent in Beirut",
            extract,
            "Sure, to help you find options, what's your budget range and how many bedrooms?"
        )

    def test_no_listing_type_question_limit(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type=None)
        self._assert_q_limit(
            db, conv_id,
            "looking for an apartment",
            extract,
            "Is this for rent or to buy?"
        )

    def test_all_info_missing_question_limit(self, db, conv_id):
        extract = make_extract_result(classification="B", listing_type="buy")
        self._assert_q_limit(
            db, conv_id,
            "I want to buy",
            extract,
            "Sure, what's your budget and where are you looking?"
        )

    def test_off_topic_question_limit(self, db, conv_id):
        extract = make_extract_result(classification="OFF_TOPIC")
        parts, _ = _run(db, conv_id, "what is the weather", extract)
        count = _count_questions(parts)
        assert count <= 2, f"OFF_TOPIC response has {count} questions: {parts}"

    def test_greeting_question_limit(self, db, conv_id):
        extract = make_extract_result(classification="B", bare_greeting=True)
        parts, _ = _run(db, conv_id, "hello", extract)
        count = _count_questions(parts)
        assert count <= 2, f"Greeting response has {count} questions: {parts}"


# ===========================================================================
# D. QUESTION ORDER (listing_type > location > budget > bedrooms > furnished)
# ===========================================================================

class TestQuestionOrder:
    """D. The pipeline must ask fields in priority order."""

    def test_listing_type_asked_before_location_when_unknown(self, db, conv_id):
        """If listing_type is null and location is null, buy/rent must come first."""
        extract = make_extract_result(classification="B", listing_type=None, location=None)
        parts, session = _run(
            db, conv_id,
            "I need a place",
            extract,
            llm_reply="Is this for rent or to buy?"
        )
        assert session.property_info.get("listing_type") is None, \
            "listing_type should still be null (no extraction)"
        # Action should be more_info_needed -> stage 5
        assert session.stage == 5

    def test_location_asked_when_listing_type_known(self, db, conv_id):
        """Once listing_type is known, the bot should ask for location next."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location=None,
            budget_max=None,
        )
        parts, session = _run(
            db, conv_id,
            "I want to rent",
            extract,
            llm_reply="What area are you looking in?"
        )
        text = _reply_text(parts)
        assert session.property_info.get("listing_type") == "rent"
        # Should still need location/budget -> stage 5 (more_info_needed)
        assert session.stage == 5, f"Expected stage 5, got {session.stage}"

    def test_budget_asked_after_location_known(self, db, conv_id):
        """Once listing_type + location are known, budget should be next question."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location="Achrafieh",
            budget_max=None,
        )
        parts, session = _run(
            db, conv_id,
            "I want to rent in Achrafieh",
            extract,
            llm_reply="What's your budget range?"
        )
        assert session.property_info.get("location") == "Achrafieh"
        # Still missing budget -> stage 5
        assert session.stage == 5

    def test_stage_3_when_all_required_fields_present(self, db, conv_id):
        """Once listing_type + location + budget + name all known, stage should move to 3."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location="Hamra",
            budget_max=1200,
            name="Ahmad",  # name required to reach stage 3 (not stage 5)
        )
        parts, session = _run(
            db, conv_id,
            "I want to rent in Hamra for $1200",
            extract,
            llm_reply="On it! Here you go."
        )
        # All required fields + name present -> should be stage 3 (process_property_request)
        assert session.stage == 3, f"Expected stage 3, got {session.stage}"


# ===========================================================================
# E. OFF-TOPIC TESTS
# ===========================================================================

class TestOffTopic:
    """E. Off-topic messages must redirect to real estate, never create a handoff Event."""

    def _run_off_topic(self, db, conv_id, user_message):
        extract = make_extract_result(classification="OFF_TOPIC")
        parts, session = _run(db, conv_id, user_message, extract)
        return parts, session

    def test_weather_no_handoff_event(self, db, conv_id):
        self._run_off_topic(db, conv_id, "what is the weather")
        events = db.query(Event).all()
        assert len(events) == 0, f"Expected no handoff events, found {len(events)}"

    def test_joke_no_handoff_event(self, db, conv_id):
        self._run_off_topic(db, conv_id, "tell me a joke")
        events = db.query(Event).all()
        assert len(events) == 0, f"Expected no handoff events, found {len(events)}"

    def test_president_no_handoff_event(self, db, conv_id):
        self._run_off_topic(db, conv_id, "who is the president")
        events = db.query(Event).all()
        assert len(events) == 0, f"Expected no handoff events, found {len(events)}"

    def test_weather_redirects_to_real_estate(self, db, conv_id):
        parts, _ = self._run_off_topic(db, conv_id, "what is the weather")
        text = _reply_text(parts)
        # Must mention real estate, buy, or rent
        assert any(kw in text for kw in ["real estate", "buy", "rent", "property", "inquir"]), \
            f"Expected real estate redirect in: {parts}"

    def test_joke_redirects_to_real_estate(self, db, conv_id):
        parts, _ = self._run_off_topic(db, conv_id, "tell me a joke")
        text = _reply_text(parts)
        assert any(kw in text for kw in ["real estate", "buy", "rent", "property", "inquir"]), \
            f"Expected real estate redirect in: {parts}"

    def test_off_topic_no_agent_assignment(self, db, conv_id):
        """No agent should be found/assigned for off-topic messages."""
        parts, session = self._run_off_topic(db, conv_id, "what is the weather")
        assert not session.handed_off, \
            "Session must not be marked handed_off for off-topic"

    def test_off_topic_reply_is_single_message(self, db, conv_id):
        """OFF_TOPIC redirect is a single hardcoded message."""
        parts, _ = self._run_off_topic(db, conv_id, "tell me a joke")
        assert len(parts) == 1, \
            f"Expected single redirect message, got {len(parts)}: {parts}"


# ===========================================================================
# G. NAME GATE TESTS
# ===========================================================================

class TestNameGate:
    """G. Name collection timing, limits, and extraction."""

    def test_name_not_asked_on_first_bare_greeting(self, db, conv_id):
        """Name must NOT be asked when user sends a bare greeting."""
        extract = make_extract_result(classification="B", bare_greeting=True)
        parts, _ = _run(db, conv_id, "hi", extract)
        text = _reply_text(parts)
        assert "your name" not in text and "full name" not in text, \
            f"Name must not be asked on bare greeting: {parts}"

    def test_name_asked_after_some_qualifying_info(self, db, conv_id):
        """Name should be asked after at least one qualifying field is known."""
        # Simulate a user who already sent listing_type + location
        extract1 = make_extract_result(
            classification="B", listing_type="rent", location="Beirut"
        )
        _run(db, conv_id, "I want to rent in Beirut", extract1,
             llm_reply="Sure, what's your budget? ||| What's your full name btw?")

        session = get_session(conv_id)
        # After first non-greeting turn name_ask_count should be 0 or 1
        assert session.name_ask_count <= 1

    def test_name_asked_at_most_twice(self, db, conv_id):
        """Name must never be asked more than 2 times total."""
        # Turn 1: listing_type + location -> asks for budget + name
        extract1 = make_extract_result(
            classification="B", listing_type="rent", location="Beirut"
        )
        _run(db, conv_id, "I want to rent in Beirut", extract1,
             llm_reply="What's your budget? ||| What's your full name btw?")

        # Turn 2: still no name provided
        extract2 = make_extract_result(
            classification="B", listing_type="rent", location="Beirut", budget_max=1000
        )
        _run(db, conv_id, "budget is $1000", extract2,
             llm_reply="Got it! And your name?")

        # Turn 3: still no name - must not ask again (count >= 2)
        extract3 = make_extract_result(
            classification="B", listing_type="rent", location="Beirut", budget_max=1000
        )
        parts3, session = _run(
            db, conv_id, "something else", extract3,
            llm_reply="Checking options for you."
        )
        assert session.name_ask_count <= 2, \
            f"Name was asked {session.name_ask_count} times (max 2)"

    def test_name_extraction_from_short_message_after_ask(self, db, conv_id):
        """When the bot asked for name and user sends a short non-property message, extract as name."""
        # Turn 1: ask for name
        extract1 = make_extract_result(
            classification="B", listing_type="rent", location="Beirut", budget_max=1000
        )
        _run(db, conv_id, "I want to rent in Beirut for $1000", extract1,
             llm_reply="Sure! And your name?")
        session = get_session(conv_id)
        # Manually mark name as asked (as the LLM instruction would do)
        session.name_asked = True

        # Turn 2: user sends their name - extractor returns no name (simulates haiku miss)
        extract2 = make_extract_result(classification="B", name=None)
        _run(db, conv_id, "Ahmad", extract2, llm_reply="Nice to meet you Ahmad!")
        session2 = get_session(conv_id)
        assert session2.user_info.get("name") == "Ahmad", \
            f"Expected name='Ahmad', got {session2.user_info.get('name')}"

    def test_name_gate_disambiguation_location_equals_stored(self, db, conv_id):
        """If the only extracted field is a location matching the stored location, treat as name."""
        # Seed the session with Hamra as location
        session = get_session(conv_id)
        session.property_info["location"] = "Hamra"
        session.name_asked = True
        session.greeted = True

        # Extractor identifies 'Hamra' as location (matches stored) but NO name
        extract = make_extract_result(
            classification="B",
            location="Hamra",  # same as stored
            name=None
        )
        _run(db, conv_id, "Hamra", extract, llm_reply="Nice to meet you!")
        session2 = get_session(conv_id)
        # The disambiguation logic should have treated 'Hamra' as a name
        assert session2.user_info.get("name") == "Hamra", \
            f"Expected 'Hamra' to be treated as name, got {session2.user_info.get('name')}"

    def test_lebanese_name_extraction(self, db, conv_id):
        """Lebanese names like 'Mariam' or 'Karim' are extracted correctly."""
        session = get_session(conv_id)
        session.name_asked = True
        session.greeted = True

        extract = make_extract_result(classification="B", name="Mariam")
        _run(db, conv_id, "Mariam", extract, llm_reply="Nice to meet you, Mariam!")
        session2 = get_session(conv_id)
        assert session2.user_info.get("name") == "Mariam"


# ===========================================================================
# H. MULTI-INFO MESSAGES
# ===========================================================================

class TestMultiInfoMessages:
    """H. When all fields arrive in one message, skip straight to listings."""

    def test_all_fields_in_one_message(self, db, conv_id):
        """I want to rent a 2 bedroom in Achrafieh for $1000 -> all fields extracted."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location="Achrafieh",
            budget_max=1000,
            bedrooms=2,
        )
        parts, session = _run(
            db, conv_id,
            "I want to rent a 2 bedroom in Achrafieh for 1000 dollars",
            extract,
            llm_reply="Here you go ||| Option 2 is probably the closest."
        )
        assert session.property_info.get("listing_type") == "rent"
        assert session.property_info.get("location") == "Achrafieh"
        assert session.property_info.get("budget_max") == 1000
        assert session.property_info.get("bedrooms") == 2

    def test_stage_3_when_all_required_fields_provided(self, db, conv_id):
        extract = make_extract_result(
            classification="B",
            listing_type="buy",
            location="Zalka",
            budget_max=250000,
            name="Leila",  # name required to skip stage 5 and reach stage 3
        )
        parts, session = _run(
            db, conv_id,
            "I want to buy in Zalka under $250k",
            extract,
            llm_reply="On it!"
        )
        assert session.stage == 3, f"Expected stage 3, got {session.stage}"

    def test_no_extra_questions_when_all_fields_known(self, db, conv_id):
        """When all required fields are known, the bot should NOT ask more questions."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location="Hamra",
            budget_max=800,
            bedrooms=1,
        )
        parts, session = _run(
            db, conv_id,
            "looking to rent a 1 bedroom in Hamra for max 800 a month",
            extract,
            llm_reply="On it!"
        )
        text = _reply_text(parts)
        # Should NOT ask for listing_type, location, or budget again
        bad_asks = ["rent or buy", "buy or rent", "what area", "where are you looking",
                    "what's your budget", "budget range"]
        for phrase in bad_asks:
            assert phrase not in text, \
                f"Should not re-ask '{phrase}' when all fields known. Parts: {parts}"


# ===========================================================================
# I. HANDOFF vs AUTO MODE
# ===========================================================================

class TestHandoffMode:
    """I. In handoff mode, booking interest triggers agent route; auto proceeds."""

    def _seed_listings_shown(self, conv_id):
        """Put the session into a state where listings were already shown."""
        session = get_session(conv_id)
        session.listings_shown = True
        session.greeted = True
        session.property_info["listing_type"] = "rent"
        session.property_info["location"] = "Achrafieh"
        session.property_info["budget_max"] = 1200

    def test_handoff_mode_booking_interest_routes_to_agent(self, db, conv_id):
        self._seed_listings_shown(conv_id)
        extract = make_extract_result(
            classification="B", listing_type="rent", location="Achrafieh", budget_max=1200
        )
        parts, session = _run(
            db, conv_id,
            "I like option 2, let's book a visit",
            extract,
            llm_reply="Let me connect you with one of our agents.",
            demo_mode="handoff"
        )
        # In handoff mode, booking interest should route to agent
        assert session.handed_off or "agent" in _reply_text(parts), \
            f"Expected agent routing in handoff mode. Parts: {parts}"

    def test_auto_mode_booking_interest_proceeds_to_booking(self, db, conv_id):
        self._seed_listings_shown(conv_id)
        extract = make_extract_result(
            classification="B", listing_type="rent", location="Achrafieh", budget_max=1200
        )
        parts, session = _run(
            db, conv_id,
            "I like option 2, let's book a visit",
            extract,
            llm_reply="Sure, we can book a visit. Does Wednesday work?",
            demo_mode="auto"
        )
        text = _reply_text(parts)
        # In auto mode, should NOT immediately hand off
        # (session.handed_off should be False unless routing conditions triggered it)
        # Check that response mentions booking or day, NOT just "connecting to agent"
        assert not (session.handed_off and "agent" in text and "wednesday" not in text), \
            f"Auto mode should handle booking itself. Parts: {parts}"

    def test_handoff_event_not_created_for_null_conversation(self, db, conv_id):
        """Bug 3 regression: handoff_or_finish must not create Event when conversation is None."""
        from app.services.agent import generate_reply

        # Build a session with non-OFF_TOPIC classification so the Event-creation
        # branch would be reached (if Bug 3 were still present).
        session = get_session(conv_id)
        session.classification = "B"
        session.property_info["listing_type"] = "rent"
        session.property_info["location"] = "Beirut"
        session.property_info["budget_max"] = 900
        session.user_info["name"] = "Leila"

        # Call generate_reply directly with action="handoff_or_finish" and conversation=None
        with patch("app.services.agent.client") as mock_client, \
             patch("app.services.token_tracker.log_usage"), \
             patch("app.services.token_tracker._log_to_db"):
            mock_client.messages.create.return_value = make_llm_response(
                "I'll connect you with an agent."
            )
            generate_reply("handoff_or_finish", "ready to book", db, None, conv_id, session)

        # conversation is None -> Bug 3 fix must prevent Event creation
        events = db.query(Event).all()
        assert len(events) == 0, \
            f"Bug 3 regression: Event created even with conversation=None. Events: {events}"


# ===========================================================================
# BUDGET ASK COUNT REGRESSION
# ===========================================================================

class TestBudgetAskCount:
    """Bug 2 regression: budget_ask_count only increments when budget is sole ask."""

    def test_budget_count_not_incremented_when_bundled_with_location(self, db, conv_id):
        """When budget is asked together with location, count must NOT increment."""
        # User knows listing_type but neither location nor budget
        extract = make_extract_result(classification="B", listing_type="rent")
        _, session = _run(
            db, conv_id,
            "I want to rent",
            extract,
            llm_reply="Sure, what's your preferred location and budget range?"
        )
        # location + budget both missing -> they are bundled -> count stays at 0
        assert session.budget_ask_count == 0, \
            f"budget_ask_count should be 0 when bundled with location, got {session.budget_ask_count}"

    def test_budget_count_increments_when_sole_ask(self, db, conv_id):
        """When budget is the ONLY missing field (bedrooms + furnishing known), count must increment."""
        extract = make_extract_result(
            classification="B",
            listing_type="rent",
            location="Achrafieh",
            bedrooms=2,
            furnishing="furnished",  # all optional fields provided -> budget is sole missing
        )
        _, session = _run(
            db, conv_id,
            "I want to rent in Achrafieh, 2 bedrooms furnished",
            extract,
            llm_reply="What's your budget range?"
        )
        # Only budget is missing -> count should be 1
        assert session.budget_ask_count == 1, \
            f"budget_ask_count should be 1 when budget is sole ask, got {session.budget_ask_count}"

    def test_budget_refusal_routes_to_agent_after_2_dedicated_asks(self, db, conv_id):
        """After 2 dedicated budget asks with no answer, route to agent."""
        # Simulate previous state: location known, budget asked twice already
        session = get_session(conv_id)
        session.property_info["listing_type"] = "rent"
        session.property_info["location"] = "Hamra"
        session.budget_ask_count = 2
        session.greeted = True

        extract = make_extract_result(
            classification="B", listing_type="rent", location="Hamra"
        )
        parts, session2 = _run(
            db, conv_id,
            "not sure about budget",
            extract,
            llm_reply="Let me connect you with an agent."
        )
        # Should have routed to agent (handed_off or reply mentions agent)
        text = _reply_text(parts)
        assert session2.handed_off or "agent" in text, \
            f"Expected agent route after 2 budget refusals. Parts: {parts}"
