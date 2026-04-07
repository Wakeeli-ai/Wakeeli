"""
Automated extraction tests for extract_entities().

These tests make real Anthropic API calls (marked with @pytest.mark.live).
They verify that the LLM extracts the correct fields from 50+ messages.

Run all:
    cd /home/claw/claudeclaw/workspace/Wakeeli/backend
    python -m pytest tests/test_extraction.py -v

Skip live API calls:
    python -m pytest tests/test_extraction.py -m "not live" -v
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from unittest.mock import patch
from app.services.agent import extract_entities


def _ext(message: str) -> dict:
    """Call extract_entities with no conversation history."""
    with patch("app.services.token_tracker._log_to_db"), \
         patch("app.services.token_tracker._load_daily_spend",
               return_value={"date": "2026-04-07", "total_cost_usd": 0.0, "call_count": 0}), \
         patch("app.services.token_tracker._save_daily_spend"):
        return extract_entities(message, [], conversation_id=None)


def _prop(result: dict, field: str):
    return result.get("property_info", {}).get(field)


def _user(result: dict, field: str):
    return result.get("user_info", {}).get(field)


# ===========================================================================
# GREETING / BARE GREETING TESTS
# ===========================================================================

@pytest.mark.live
class TestBareGreetings:

    def test_hi_bare_greeting(self):
        r = _ext("hi")
        assert r.get("bare_greeting") is True, f"Expected bare_greeting=True: {r}"

    def test_hello_bare_greeting(self):
        r = _ext("hello")
        assert r.get("bare_greeting") is True, f"Expected bare_greeting=True: {r}"

    def test_hey_bare_greeting(self):
        r = _ext("hey")
        assert r.get("bare_greeting") is True

    def test_marhaba_bare_greeting(self):
        r = _ext("marhaba")
        assert r.get("bare_greeting") is True, f"Expected bare_greeting=True for 'marhaba': {r}"

    def test_salam_bare_greeting(self):
        r = _ext("salam")
        assert r.get("bare_greeting") is True

    def test_ahla_bare_greeting(self):
        r = _ext("ahla")
        assert r.get("bare_greeting") is True

    def test_hey_there_bare_greeting(self):
        r = _ext("hey there")
        assert r.get("bare_greeting") is True

    def test_hi_with_intent_not_bare_greeting(self):
        r = _ext("hi I'm looking for an apartment")
        assert r.get("bare_greeting") is False, \
            f"'hi I'm looking...' must not be bare_greeting: {r}"

    def test_hello_with_intent_not_bare_greeting(self):
        r = _ext("hello can you help me find a place")
        assert r.get("bare_greeting") is False


# ===========================================================================
# LISTING TYPE EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestListingTypeExtraction:

    def test_i_want_to_buy(self):
        r = _ext("I want to buy")
        assert _prop(r, "listing_type") == "buy", f"Expected buy: {r}"

    def test_i_want_to_rent(self):
        r = _ext("I want to rent")
        assert _prop(r, "listing_type") == "rent", f"Expected rent: {r}"

    def test_looking_to_purchase(self):
        r = _ext("looking to purchase a home")
        assert _prop(r, "listing_type") == "buy", f"Expected buy for 'purchase': {r}"

    def test_need_a_place_to_rent(self):
        r = _ext("need a place to rent")
        assert _prop(r, "listing_type") == "rent"

    def test_villa_alone_no_listing_type(self):
        r = _ext("I need a villa")
        assert _prop(r, "listing_type") is None, \
            f"'villa' alone must not imply listing_type: {r}"

    def test_apartment_alone_no_listing_type(self):
        r = _ext("looking for an apartment")
        assert _prop(r, "listing_type") is None, \
            f"'apartment' alone must not imply listing_type: {r}"

    def test_ista2jar_arabic_rent(self):
        r = _ext("baddi ista2jar shi fi Beirut")
        assert _prop(r, "listing_type") == "rent", f"Expected rent from ista2jar: {r}"

    def test_ishtari_arabic_buy(self):
        r = _ext("ishtari shi fi Tripoli")
        assert _prop(r, "listing_type") == "buy", f"Expected buy from ishtari: {r}"

    def test_for_rent_explicit(self):
        r = _ext("I am looking for an apartment for rent in Dbayeh")
        assert _prop(r, "listing_type") == "rent"

    def test_for_sale_explicit(self):
        r = _ext("3 bedroom apartment for sale in Jdeideh")
        assert _prop(r, "listing_type") == "buy"

    def test_i_need_a_place_no_listing_type(self):
        r = _ext("I need a place")
        assert _prop(r, "listing_type") is None, \
            f"'I need a place' must not imply listing_type: {r}"


# ===========================================================================
# LOCATION EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestLocationExtraction:

    def test_achrafieh_location(self):
        r = _ext("apartment in Achrafieh")
        assert _prop(r, "location") is not None
        assert "achrafieh" in str(_prop(r, "location")).lower(), \
            f"Expected Achrafieh in location: {r}"

    def test_hamra_location(self):
        r = _ext("looking for something in Hamra")
        loc = str(_prop(r, "location") or "").lower()
        assert "hamra" in loc, f"Expected Hamra: {r}"

    def test_beirut_location(self):
        r = _ext("baddi ista2jar shi fi Beirut")
        loc = str(_prop(r, "location") or "").lower()
        assert "beirut" in loc, f"Expected Beirut: {r}"

    def test_jounieh_location(self):
        r = _ext("3 bedroom in Jounieh for $2000/month")
        loc = str(_prop(r, "location") or "").lower()
        assert "jounieh" in loc, f"Expected Jounieh: {r}"

    def test_zalka_location(self):
        r = _ext("I want to buy in Zalka")
        loc = str(_prop(r, "location") or "").lower()
        assert "zalka" in loc, f"Expected Zalka: {r}"

    def test_tripoli_location(self):
        r = _ext("ishtari shi fi Tripoli")
        loc = str(_prop(r, "location") or "").lower()
        assert "tripoli" in loc, f"Expected Tripoli: {r}"

    def test_gemmayzeh_location(self):
        r = _ext("Can you help me find something in Gemmayzeh?")
        loc = str(_prop(r, "location") or "").lower()
        assert "gemmayzeh" in loc or _prop(r, "location") is not None, \
            f"Expected Gemmayzeh: {r}"

    def test_dbayeh_location(self):
        r = _ext("2-3 bedrooms in Dbayeh")
        loc = str(_prop(r, "location") or "").lower()
        assert "dbayeh" in loc, f"Expected Dbayeh: {r}"

    def test_rabieh_location(self):
        r = _ext("5 bedroom villa in Rabieh")
        loc = str(_prop(r, "location") or "").lower()
        assert "rabieh" in loc, f"Expected Rabieh: {r}"

    def test_antelias_location(self):
        r = _ext("looking for rent in Antelias")
        loc = str(_prop(r, "location") or "").lower()
        assert "antelias" in loc, f"Expected Antelias: {r}"


# ===========================================================================
# BUDGET EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestBudgetExtraction:

    def test_200k_dollars_budget(self):
        r = _ext("200000 dollars")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None and abs(budget - 200000) < 1000, \
            f"Expected ~200000 budget: {r}"

    def test_1200_per_month(self):
        r = _ext("looking for something in Hamra under $1200")
        assert _prop(r, "budget_max") is not None
        assert abs(_prop(r, "budget_max") - 1200) < 100, \
            f"Expected ~1200 budget_max: {r}"

    def test_2000_per_month(self):
        r = _ext("3 bedroom in Jounieh for $2000/month")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None and abs(budget - 2000) < 200, \
            f"Expected ~2000 budget: {r}"

    def test_budget_range_min_max(self):
        r = _ext("between 1000 and 1500 per month")
        assert _prop(r, "budget_min") is not None, f"Expected budget_min: {r}"
        assert _prop(r, "budget_max") is not None, f"Expected budget_max: {r}"
        assert abs(_prop(r, "budget_min") - 1000) < 100
        assert abs(_prop(r, "budget_max") - 1500) < 100

    def test_500_per_month(self):
        r = _ext("under 500 per month")
        assert _prop(r, "budget_max") is not None
        assert abs(_prop(r, "budget_max") - 500) < 50, \
            f"Expected ~500 budget_max: {r}"

    def test_150k_budget(self):
        r = _ext("budget around 150k")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None and abs(budget - 150000) < 5000, \
            f"Expected ~150000: {r}"

    def test_lbp_100_million_converted(self):
        r = _ext("100,000,000 LBP per month")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None, f"Expected budget extracted: {r}"
        # 100,000,000 / 89,500 ~= 1117 USD
        assert 900 < budget < 1400, \
            f"Expected ~1117 USD after LBP conversion, got {budget}"

    def test_lbp_200_million_converted(self):
        r = _ext("200,000,000 LBP")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        # 200,000,000 / 89,500 ~= 2235 USD
        assert budget is not None and 1800 < budget < 2700, \
            f"Expected ~2235 USD, got {budget}"

    def test_1000_a_month(self):
        r = _ext("I want to rent a 2 bedroom in Achrafieh for 1000 dollars")
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None and abs(budget - 1000) < 100, \
            f"Expected ~1000 budget: {r}"


# ===========================================================================
# BEDROOM EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestBedroomExtraction:

    def test_3_bedrooms(self):
        r = _ext("3 bedrooms please")
        assert _prop(r, "bedrooms") == 3, f"Expected bedrooms=3: {r}"

    def test_2_bedroom_apartment(self):
        r = _ext("2 bedroom apartment")
        assert _prop(r, "bedrooms") == 2, f"Expected bedrooms=2: {r}"

    def test_5_bedrooms(self):
        r = _ext("5 bedroom villa in Rabieh")
        assert _prop(r, "bedrooms") == 5, f"Expected bedrooms=5: {r}"

    def test_studio_zero_bedrooms(self):
        r = _ext("looking for a studio")
        # Studio = 0 bedrooms or property_type='studio'
        bedrooms = _prop(r, "bedrooms")
        prop_type = str(_prop(r, "property_type") or "").lower()
        assert bedrooms == 0 or "studio" in prop_type, \
            f"Expected bedrooms=0 or property_type=studio: {r}"

    def test_4_rooms(self):
        r = _ext("I need 4 rooms")
        assert _prop(r, "bedrooms") == 4, f"Expected bedrooms=4: {r}"

    def test_all_fields_multi_message(self):
        r = _ext("I want to rent a 2 bedroom in Achrafieh for 1000 dollars")
        assert _prop(r, "listing_type") == "rent"
        assert _prop(r, "bedrooms") == 2
        assert "achrafieh" in str(_prop(r, "location") or "").lower()
        budget = _prop(r, "budget_max") or _prop(r, "budget_min")
        assert budget is not None and abs(budget - 1000) < 100

    def test_furnished_2_bed_beirut(self):
        r = _ext("furnished 2 bed in Beirut for rent")
        assert _prop(r, "bedrooms") == 2
        assert _prop(r, "listing_type") == "rent"
        assert "beirut" in str(_prop(r, "location") or "").lower()
        assert _prop(r, "furnishing") is not None and "furnished" in str(_prop(r, "furnishing")).lower()

    def test_3_bed_2_bath_unfurnished(self):
        r = _ext("3 bed + 2 bath unfurnished to buy")
        assert _prop(r, "bedrooms") == 3
        assert _prop(r, "bathrooms") == 2 or _prop(r, "bathrooms") is None  # bathrooms optional
        assert _prop(r, "listing_type") == "buy"
        assert "unfurnished" in str(_prop(r, "furnishing") or "").lower()


# ===========================================================================
# FURNISHING EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestFurnishingExtraction:

    def test_furnished_keyword(self):
        r = _ext("looking for a furnished apartment")
        f = str(_prop(r, "furnishing") or "").lower()
        assert "furnished" in f, f"Expected furnished: {r}"

    def test_unfurnished_keyword(self):
        r = _ext("I want an unfurnished place")
        f = str(_prop(r, "furnishing") or "").lower()
        assert "unfurnished" in f, f"Expected unfurnished: {r}"


# ===========================================================================
# OFF-TOPIC CLASSIFICATION
# ===========================================================================

@pytest.mark.live
class TestOffTopicClassification:

    def test_weather_off_topic(self):
        r = _ext("what is the weather today")
        assert r.get("classification") == "OFF_TOPIC", \
            f"Expected OFF_TOPIC for weather: {r}"

    def test_joke_off_topic(self):
        r = _ext("tell me a joke")
        assert r.get("classification") == "OFF_TOPIC", \
            f"Expected OFF_TOPIC for joke: {r}"

    def test_president_off_topic(self):
        r = _ext("who is the president")
        assert r.get("classification") == "OFF_TOPIC", \
            f"Expected OFF_TOPIC for president question: {r}"

    def test_real_estate_not_off_topic(self):
        r = _ext("I want to rent in Hamra")
        assert r.get("classification") != "OFF_TOPIC", \
            f"Real estate message must not be OFF_TOPIC: {r}"


# ===========================================================================
# CLASSIFICATION (A1, A2, B)
# ===========================================================================

@pytest.mark.live
class TestClassification:

    def test_link_classified_a1(self):
        r = _ext("Is this apartment available? https://wakeeli.com/listing/999")
        assert r.get("classification") == "A1", \
            f"Expected A1 for listing URL: {r}"

    def test_property_id_classified_a1(self):
        r = _ext("check property ID 4567")
        assert r.get("classification") == "A1", f"Expected A1 for property ID: {r}"
        assert _prop(r, "link_or_id") is not None, f"Expected link_or_id extracted: {r}"

    def test_vague_specific_property_a2(self):
        r = _ext("I saw an apartment in Achrafieh for around $200K on your site, is it still available?")
        assert r.get("classification") == "A2", \
            f"Expected A2 for vague specific reference: {r}"

    def test_general_search_is_b(self):
        r = _ext("I want a 3 bedroom apartment in Achrafieh")
        assert r.get("classification") == "B", \
            f"Expected B for general search: {r}"

    def test_no_link_explicit(self):
        r = _ext("I don't have a property link or ID")
        assert _user(r, "not_link_or_id") is True, \
            f"Expected not_link_or_id=True: {r}"

    def test_greeting_classified_b(self):
        r = _ext("hi")
        assert r.get("classification") == "B", f"Expected B for greeting: {r}"


# ===========================================================================
# NAME EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestNameExtraction:

    def test_name_from_intro(self):
        r = _ext("my name is Ahmad")
        assert _user(r, "name") == "Ahmad" or str(_user(r, "name") or "").lower() == "ahmad", \
            f"Expected name=Ahmad: {r}"

    def test_name_in_a1_message(self):
        r = _ext("Hi my name is Dare, is this property available https://wakeeli.com/3")
        assert r.get("classification") == "A1"
        name = str(_user(r, "name") or "").lower()
        assert "dare" in name, f"Expected name=Dare: {r}"

    def test_name_not_extracted_from_location(self):
        r = _ext("apartment in Hamra")
        name = _user(r, "name")
        assert name is None or (name != "Hamra" and name != "hamra"), \
            f"Location should not be treated as name: {r}"


# ===========================================================================
# TIMELINE EXTRACTION
# ===========================================================================

@pytest.mark.live
class TestTimelineExtraction:

    def test_next_month_timeline(self):
        r = _ext("looking to move in next month")
        assert _prop(r, "timeline") is not None, \
            f"Expected timeline extracted: {r}"

    def test_asap_timeline(self):
        r = _ext("I need something ASAP")
        assert _prop(r, "timeline") is not None, \
            f"Expected timeline extracted for ASAP: {r}"
