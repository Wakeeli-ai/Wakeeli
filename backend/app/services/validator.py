"""
Live conversation rule validator.

Runs after every bot response to check that the framework rules were followed.
Violations are logged to backend/logs/violations.log.
The response is NEVER blocked; this is observation-only.
"""

import re
import os
import json
import logging
from datetime import datetime
from typing import Optional

# ---------------------------------------------------------------------------
# Log setup
# ---------------------------------------------------------------------------

_LOG_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "logs")
)
_LOG_FILE = os.path.join(_LOG_DIR, "violations.log")

os.makedirs(_LOG_DIR, exist_ok=True)

_violation_logger = logging.getLogger("wakeeli.violations")
_violation_logger.setLevel(logging.WARNING)
_violation_logger.propagate = False
if not _violation_logger.handlers:
    _fh = logging.FileHandler(_LOG_FILE, encoding="utf-8")
    _fh.setFormatter(logging.Formatter("%(message)s"))
    _violation_logger.addHandler(_fh)


# ---------------------------------------------------------------------------
# Compiled patterns
# ---------------------------------------------------------------------------

# Detect name-asking phrases in bot response
_NAME_ASK_PATTERN = re.compile(
    r"(your name|what'?s your name|who am i speaking with|may i know your name|"
    r"can i get your name|what do i call you|your full name|mind sharing your name|"
    r"ismi|shu ismak|shu ismik)",
    re.IGNORECASE,
)

# Detect location / budget / bedrooms being asked in bot response
_LOCATION_ASK_PATTERN = re.compile(
    r"\b(location|where|which area|which neighborhood|which district|which city|"
    r"which region|wein|wein btrid|wein betrid)\b",
    re.IGNORECASE,
)
_BUDGET_ASK_PATTERN = re.compile(
    r"\b(budget|price range|how much|afford|monthly budget|range|cost)\b",
    re.IGNORECASE,
)
_BEDROOMS_ASK_PATTERN = re.compile(
    r"\b(bedroom|bedrooms|how many bed|bed count|ghurfa|ghuraf|odde|odd)\b",
    re.IGNORECASE,
)

# Explicit buy/rent statement from user
_BUY_RENT_EXPLICIT = re.compile(
    r"\b(buy|buying|purchase|purchased|for sale|want to buy|looking to buy|"
    r"rent|renting|for rent|want to rent|looking to rent|"
    r"ishtari|ista2jar|bade ista2jar|bade ishtari|"
    r"\u0627\u0633\u062a\u0623\u062c\u0631|\u0627\u0634\u062a\u0631\u064a)\b",
    re.IGNORECASE,
)

# Real estate redirect in bot response (required after OFF_TOPIC classification)
_REAL_ESTATE_REDIRECT = re.compile(
    r"\b(real estate|property|properties|apartment|house|villa|listing|listings|"
    r"buy|rent|beirut|lebanon|location|area)\b",
    re.IGNORECASE,
)

# Listing UUID pattern (used in listing accuracy check)
_LISTING_UUID_PATTERN = re.compile(
    r"\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _count_question_marks(text: str) -> int:
    """Count raw question mark characters in text."""
    return text.count("?")


def _count_question_sentences(text: str) -> int:
    """
    Count distinct sentences that end with a question mark.
    Splits on whitespace between sentence-terminating punctuation.
    """
    # Normalise multi-part responses that use ||| as separator
    normalised = text.replace("|||", " ")
    sentences = re.split(r"(?<=[.!?])\s+", normalised)
    return sum(1 for s in sentences if s.strip().endswith("?"))


def _qualifying_field_count(session_state: dict) -> int:
    """
    Count how many property-qualifying fields have been collected,
    excluding the user's name (since that is what NAME_TIMING checks against).
    """
    prop = session_state.get("property_info", {})
    has_budget = bool(prop.get("budget_min") or prop.get("budget_max"))
    fields = [
        prop.get("listing_type"),
        prop.get("location"),
        has_budget or None,
        prop.get("bedrooms"),
        prop.get("property_type"),
        prop.get("furnishing"),
        prop.get("timeline"),
    ]
    return sum(1 for f in fields if f)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def validate_response(
    session_state: dict,
    bot_response: str,
    user_message: str,
    classification: str,
    history: list,
    prev_property_info: Optional[dict] = None,
    db=None,
) -> list[dict]:
    """
    Validate a bot response against the conversation framework rules.

    Parameters
    ----------
    session_state       : dict from session.getter()
    bot_response        : the full bot reply (parts joined with space)
    user_message        : the raw user input that triggered this reply
    classification      : intent classification string (A1 / A2 / B / OFF_TOPIC)
    history             : list of recent message dicts [{"role":..., "content":...}]
    prev_property_info  : property_info snapshot from BEFORE this turn's update
    db                  : SQLAlchemy session (optional, for listing accuracy check)

    Returns
    -------
    List of violation dicts. Empty list means all rules passed.
    Each dict: {"rule": str, "detail": str, "severity": str}
    """
    violations = []
    prop_info = session_state.get("property_info", {})

    # ------------------------------------------------------------------
    # Rule 1: QUESTION COUNT (raw question mark count)
    # ------------------------------------------------------------------
    qmark_count = _count_question_marks(bot_response)
    if qmark_count > 2:
        violations.append({
            "rule": "QUESTION_COUNT",
            "detail": f"Bot response contains {qmark_count} question marks, max is 2",
            "severity": "high",
        })

    # ------------------------------------------------------------------
    # Rule 2: BUY/RENT ORDER
    # listing_type must be established before asking about location/budget/bedrooms
    # ------------------------------------------------------------------
    listing_type = prop_info.get("listing_type")
    if not listing_type:
        asked_other = (
            _LOCATION_ASK_PATTERN.search(bot_response)
            or _BUDGET_ASK_PATTERN.search(bot_response)
            or _BEDROOMS_ASK_PATTERN.search(bot_response)
        )
        if asked_other:
            violations.append({
                "rule": "BUY_RENT_ORDER",
                "detail": "Bot asked about location/budget/bedrooms before buy/rent intent was established",
                "severity": "medium",
            })

    # ------------------------------------------------------------------
    # Rule 3: NAME TIMING
    # Name should not be asked until at least 2 qualifying fields are collected
    # ------------------------------------------------------------------
    if _NAME_ASK_PATTERN.search(bot_response):
        field_count = _qualifying_field_count(session_state)
        if field_count < 2:
            violations.append({
                "rule": "NAME_TIMING",
                "detail": (
                    f"Name asked too early: only {field_count} qualifying "
                    f"field(s) collected (need at least 2)"
                ),
                "severity": "medium",
            })

    # ------------------------------------------------------------------
    # Rule 4: NO ASSUMPTIONS
    # listing_type must not be inferred without an explicit user statement
    # ------------------------------------------------------------------
    if prev_property_info is not None:
        prev_lt = prev_property_info.get("listing_type")
        curr_lt = prop_info.get("listing_type")
        if not prev_lt and curr_lt:
            if not _BUY_RENT_EXPLICIT.search(user_message):
                violations.append({
                    "rule": "NO_ASSUMPTIONS",
                    "detail": (
                        f"listing_type set to '{curr_lt}' without an explicit "
                        f"buy/rent statement from the user"
                    ),
                    "severity": "high",
                })

    # ------------------------------------------------------------------
    # Rule 5: OFF_TOPIC HANDLING
    # When classification is OFF_TOPIC, bot must redirect to real estate
    # ------------------------------------------------------------------
    if classification == "OFF_TOPIC":
        if not _REAL_ESTATE_REDIRECT.search(bot_response):
            violations.append({
                "rule": "OFF_TOPIC_HANDLING",
                "detail": (
                    "Bot responded to an off-topic message without redirecting "
                    "back to real estate"
                ),
                "severity": "medium",
            })

    # ------------------------------------------------------------------
    # Rule 6: MAX 2 QUESTIONS (sentence-level check, complements rule 1)
    # ------------------------------------------------------------------
    q_sentence_count = _count_question_sentences(bot_response)
    if q_sentence_count > 2:
        violations.append({
            "rule": "MAX_QUESTIONS",
            "detail": (
                f"Bot asked {q_sentence_count} distinct question sentences, max is 2"
            ),
            "severity": "high",
        })

    # ------------------------------------------------------------------
    # Rule 7: LISTING ACCURACY
    # Any listing UUID in the bot response must exist in the database
    # ------------------------------------------------------------------
    if db is not None:
        listing_ids = _LISTING_UUID_PATTERN.findall(bot_response)
        if listing_ids:
            try:
                from app.models import Listing  # local import to avoid circular deps
                for lid in listing_ids:
                    exists = db.query(Listing).filter(Listing.id == lid).first()
                    if not exists:
                        violations.append({
                            "rule": "LISTING_ACCURACY",
                            "detail": (
                                f"Listing ID '{lid}' referenced in bot response "
                                f"does not exist in the database"
                            ),
                            "severity": "high",
                        })
            except Exception as e:
                print(f"[validator] listing accuracy check failed: {e}")

    return violations


def log_violations(
    violations: list[dict],
    conversation_id,
    user_message: str,
    bot_response: str,
) -> None:
    """
    Write a structured JSON entry to violations.log.
    Also prints a short summary to stdout for each violation.
    No-op if violations list is empty.
    """
    if not violations:
        return

    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "conversation_id": conversation_id,
        "user_message": user_message[:500],
        "bot_response": bot_response[:500],
        "violations": violations,
    }
    _violation_logger.warning(json.dumps(entry, ensure_ascii=False))

    for v in violations:
        severity_tag = v.get("severity", "medium").upper()
        print(
            f"[VIOLATION][{severity_tag}] "
            f"conv={conversation_id} "
            f"rule={v['rule']}: {v['detail']}"
        )
