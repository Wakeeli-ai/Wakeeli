"""
Live conversation rule validator and active response gate.

Runs after every bot response. Critical rules trigger regeneration (max 2 retries).
Observation-only rules are logged but never block.

Enforcement patterns are configurable at the top of this file.
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
# CONFIGURABLE ENFORCEMENT RULES
# Add new rules here. Each entry maps rule_name to:
#   patterns : list of regex strings to match against the response
#   soft     : True = warn only (no retry). False = block and retry.
# ---------------------------------------------------------------------------

ENFORCEMENT_RULES: dict = {

    # Rule 1: Never reveal empty search results
    "NEVER_REVEAL_EMPTY_RESULTS": {
        "soft": False,
        "patterns": [
            r"no match",
            r"no exact match",
            r"nothing found",
            r"could not find",
            r"no listings",
            r"no properties",
            r"no results",
            r"don.t have.*match",
            r"unfortunately.*find",
        ],
    },

    # Rule 2: Never say looking/searching in present tense
    "NEVER_SAY_LOOKING_SEARCHING": {
        "soft": False,
        "patterns": [
            r"looking now",
            r"searching now",
            r"let me look",
            r"let me search",
            r"let me check",
            r"want me to look",
            r"want me to take a look",
            r"let me find",
            r"I.ll look",
            r"I.ll search",
        ],
    },

    # Rule 3: Never recommend a specific listing
    "NEVER_RECOMMEND_LISTING": {
        "soft": False,
        "patterns": [
            r"probably the closest",
            r"I think you.?d like",
            r"I recommend",
            r"my recommendation",
            r"best option.*is",
            r"I.?d suggest",
            r"perfect for you",
        ],
    },

    # Rule 4: Never acknowledge a returning lead
    "NEVER_SAY_WELCOME_BACK": {
        "soft": False,
        "patterns": [
            r"welcome back",
            r"good to see you again",
            r"glad you.?re back",
        ],
    },

    # Rule 5: Never reveal bot identity
    "NEVER_REVEAL_BOT_IDENTITY": {
        "soft": False,
        "patterns": [
            r"I am a bot",
            r"I am an AI",
            r"I.m a bot",
            r"I.m an AI",
            r"artificial intelligence",
            r"automated",
        ],
    },

    # Rule 6: Never speak LBP conversion out loud
    "NEVER_SPEAK_LBP_CONVERSION": {
        "soft": False,
        "patterns": [
            r"that.?s about \$",
            r"around \$.*month",
            r"approximately \$",
            r"equivalent to \$",
            r"roughly \$",
        ],
    },

    # Rule 7: Never ask permission to search
    "NEVER_ASK_PERMISSION_TO_SEARCH": {
        "soft": False,
        "patterns": [
            r"want me to",
            r"shall I",
            r"should I look",
            r"would you like me to search",
            r"would you like me to look",
        ],
    },

    # Rule 8: Property type confirmation (soft warning only)
    # Checked via custom logic below, not patterns.
    "PROPERTY_TYPE_CONFIRMATION": {
        "soft": True,
        "patterns": [],
    },

    # Rule 9: Never mention competing agencies
    "NEVER_MENTION_OTHER_AGENCIES": {
        "soft": False,
        "patterns": [
            r"other agenc",
            r"competitor",
            r"rival",
            r"another agenc",
            r"different agenc",
        ],
    },

    # Rule 10: Never discuss price negotiation (human agent's job)
    "NEVER_DISCUSS_PRICE_NEGOTIATION": {
        "soft": False,
        "patterns": [
            r"negoti",
            r"lower the price",
            r"reduce the price",
            r"discount",
            r"flexible on price",
            r"come down on",
        ],
    },

    # Rule 11: Never confirm real-time property availability
    "NEVER_CONFIRM_AVAILABILITY": {
        "soft": False,
        "patterns": [
            r"still available",
            r"is available",
            r"available right now",
            r"currently available",
            r"confirmed available",
        ],
    },

    # Rule 12: Never give legal advice
    "NEVER_GIVE_LEGAL_ADVICE": {
        "soft": False,
        "patterns": [
            r"legally",
            r"contract clause",
            r"your rights",
            r"law requires",
            r"legally binding",
            r"consult a lawyer",
        ],
    },

    # Rule 13: Never share phone numbers (handoff flow handles contact sharing)
    "NEVER_SHARE_PHONE_NUMBERS": {
        "soft": False,
        "patterns": [
            r"\+961",
            r"\b01-",
            r"\b03-",
            r"\b70-",
            r"\b71-",
            r"\b76-",
            r"\b78-",
            r"\b79-",
            r"\b81-",
            r"\b\d{8}\b",
        ],
    },
}


# ---------------------------------------------------------------------------
# Compile patterns at module load time (fast path at runtime)
# ---------------------------------------------------------------------------

_COMPILED_ENFORCEMENT: dict[str, list[re.Pattern]] = {}
for _rname, _rcfg in ENFORCEMENT_RULES.items():
    _COMPILED_ENFORCEMENT[_rname] = [
        re.compile(p, re.IGNORECASE | re.DOTALL)
        for p in _rcfg.get("patterns", [])
    ]

# Helpers for the PROPERTY_TYPE_CONFIRMATION soft check
_PRICE_PRESENCE = re.compile(r"\$[\d,]+", re.IGNORECASE)
_BEDROOM_PRESENCE = re.compile(r"\b(\d+)\s*bed(room)?s?\b|\bstudio\b", re.IGNORECASE)
_AREA_PRESENCE = re.compile(
    r"\b(Beirut|Hamra|Achrafieh|Verdun|Rabieh|Zalka|Jounieh|Dbayeh|"
    r"Jal el Dib|Antelias|Mtayleb|Broumana|Baabda|Hazmieh|Sin el Fil|"
    r"Dekwaneh|Mansourieh|Beit Mery|Bikfaya|Batroun|Tripoli|Saida|"
    r"Tyre|Jbeil|Byblos|Kesrouan|Metn|Jdeideh|Fanar|Bourj Hammoud|"
    r"Dora|Nahr|Corniche|Downtown|Gemmayzeh|Mar Mikhael|Badaro|"
    r"Sassine|Sodeco|Tabaris)\b",
    re.IGNORECASE,
)
_TYPE_PRESENCE = re.compile(
    r"\b(apartment|studio|villa|house|duplex|penthouse|flat|unit)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Existing compiled patterns (used by validate_response below)
# ---------------------------------------------------------------------------

_FORMAL_LANGUAGE_PATTERN = re.compile(
    r"\b(henceforth|aforementioned|pursuant|herewith)\b|"
    r"kindly be advised|please note that|I would like to inform you",
    re.IGNORECASE,
)

_NAME_ASK_PATTERN = re.compile(
    r"(your name|what'?s your name|who am i speaking with|may i know your name|"
    r"can i get your name|what do i call you|your full name|mind sharing your name|"
    r"ismi|shu ismak|shu ismik)",
    re.IGNORECASE,
)
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
_BUY_RENT_EXPLICIT = re.compile(
    r"\b(buy|buying|purchase|purchased|for sale|want to buy|looking to buy|"
    r"rent|renting|for rent|want to rent|looking to rent|"
    r"ishtari|ista2jar|bade ista2jar|bade ishtari|"
    r"\u0627\u0633\u062a\u0623\u062c\u0631|\u0627\u0634\u062a\u0631\u064a)\b",
    re.IGNORECASE,
)
_REAL_ESTATE_REDIRECT = re.compile(
    r"\b(real estate|property|properties|apartment|house|villa|listing|listings|"
    r"buy|rent|beirut|lebanon|location|area)\b",
    re.IGNORECASE,
)
_LISTING_UUID_PATTERN = re.compile(
    r"\b([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})\b",
    re.IGNORECASE,
)

# Language enforcement patterns
_ARABIZI_MARKER = re.compile(
    r"\w*[2357]\w*|"
    r"\b(shu|bas|marhaba|kifak|tamem|baddi|wein|shi|eza|khaline|hayde|"
    r"esta2jer|she2a|mafrouch|hayalla|bshufa|hawela|ktir|ghale|nabesh|"
    r"ista2jar|ishtari|ajar|3endik|kteer|kbir|sgir|yalla|halla2|boukra|"
    r"la2|na3am|ahla|mneh|tayyeb|3am|haydik|hadik|bfadel|habet)\b",
    re.IGNORECASE,
)
_ARABIC_SCRIPT = re.compile(r"[\u0600-\u06FF]")
_FRENCH_MARKER = re.compile(
    r"\b(le|la|les|de|du|et|est|pas|pour|je|tu|il|vous|nous|ils|une|avec|"
    r"dans|sur|par|qui|que|au|aux|en|se|ne|plus|bien|merci|bonjour|oui|non|"
    r"appartement|chambre|louer|acheter|quartier|villa|disponible|cherche|"
    r"recherche|votre|notre|mon|ton|son|leur|comment|quand|quel|quelle|"
    r"prix|budget|pieces|etage|tres|voici|bien|sur)\b",
    re.IGNORECASE,
)
_WRONG_DIALECT = re.compile(
    r"\b(ijjar|shaqqa|ghurfe|hawalik|dawwer)\b",
    re.IGNORECASE,
)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _count_question_marks(text: str) -> int:
    return text.count("?")


def _count_question_sentences(text: str) -> int:
    normalised = text.replace("|||", " ")
    sentences = re.split(r"(?<=[.!?])\s+", normalised)
    return sum(1 for s in sentences if s.strip().endswith("?"))


def _qualifying_field_count(session_state: dict) -> int:
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
# Active enforcement gate
# ---------------------------------------------------------------------------

def enforce_rules(response_text: str) -> dict:
    """
    Check a response against all critical enforcement rules using string
    matching and regex only. No LLM calls. Synchronous and fast.

    Parameters
    ----------
    response_text : str
        The full bot response text (parts joined with space).

    Returns
    -------
    dict with keys:
        passed        : bool  - True when no blocking violations found
        violations    : list  - rule names that triggered a block
        details       : list  - human-readable detail per violation/warning
        soft_warnings : list  - rule names that triggered soft warnings only
        cleaned_text  : None  - reserved for future use
    """
    violations: list[str] = []
    details: list[str] = []
    soft_warnings: list[str] = []

    for rule_name, rule_cfg in ENFORCEMENT_RULES.items():
        is_soft = rule_cfg.get("soft", False)
        compiled_patterns = _COMPILED_ENFORCEMENT.get(rule_name, [])

        # Special logic: PROPERTY_TYPE_CONFIRMATION has no regex patterns
        if rule_name == "PROPERTY_TYPE_CONFIRMATION":
            has_listing_data = (
                _PRICE_PRESENCE.search(response_text)
                or _BEDROOM_PRESENCE.search(response_text)
            )
            if has_listing_data:
                missing = []
                if not _AREA_PRESENCE.search(response_text):
                    missing.append("area name")
                if not _TYPE_PRESENCE.search(response_text):
                    missing.append("property type")
                if missing:
                    soft_warnings.append(rule_name)
                    details.append(
                        f"{rule_name}: listing data present but missing "
                        f"{' and '.join(missing)}"
                    )
            continue

        # Standard pattern matching
        for pattern in compiled_patterns:
            if pattern.search(response_text):
                detail_str = f"{rule_name}: matched '{pattern.pattern}'"
                if is_soft:
                    if rule_name not in soft_warnings:
                        soft_warnings.append(rule_name)
                        details.append(detail_str)
                else:
                    if rule_name not in violations:
                        violations.append(rule_name)
                        details.append(detail_str)
                break  # one match per rule is sufficient

    return {
        "passed": len(violations) == 0,
        "violations": violations,
        "details": details,
        "soft_warnings": soft_warnings,
        "cleaned_text": None,
    }


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
) -> dict:
    """
    Validate a bot response against conversation framework rules.

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
    dict with keys:
        should_retry  : bool  - True when at least one blocking violation was found
        violations    : list  - blocking violation dicts that trigger a retry
        observations  : list  - non-blocking observation dicts (logged only)

    Each violation/observation dict: {"rule": str, "detail": str, "severity": str}

    Blocking rules (trigger retry): QUESTION_COUNT, NO_ASSUMPTIONS, LISTING_ACCURACY
    Observe-only rules (logged only): BUY_RENT_ORDER, NAME_TIMING, OFF_TOPIC_HANDLING,
                                      MAX_QUESTIONS, FLEXIBLE_BUDGET, SIMPLE_ENGLISH,
                                      LISTING_INTRO
    """
    blocking_violations: list[dict] = []
    observation_violations: list[dict] = []
    prop_info = session_state.get("property_info", {})

    def _record(rule: str, detail: str, severity: str, *, blocking: bool) -> None:
        entry = {"rule": rule, "detail": detail, "severity": severity}
        if blocking:
            blocking_violations.append(entry)
        else:
            observation_violations.append(entry)

    # Rule 1: QUESTION COUNT (blocking -- 3 or more question marks triggers retry)
    qmark_count = _count_question_marks(bot_response)
    if qmark_count > 2:
        _record(
            "QUESTION_COUNT",
            f"Bot response contains {qmark_count} question marks, max is 2",
            "high",
            blocking=True,
        )

    # Rule 2: BUY/RENT ORDER (observe-only)
    listing_type = prop_info.get("listing_type")
    if not listing_type:
        asked_other = (
            _LOCATION_ASK_PATTERN.search(bot_response)
            or _BUDGET_ASK_PATTERN.search(bot_response)
            or _BEDROOMS_ASK_PATTERN.search(bot_response)
        )
        if asked_other:
            _record(
                "BUY_RENT_ORDER",
                "Bot asked about location/budget/bedrooms before buy/rent intent was established",
                "medium",
                blocking=False,
            )

    # Rule 3: NAME TIMING (observe-only)
    if _NAME_ASK_PATTERN.search(bot_response):
        field_count = _qualifying_field_count(session_state)
        if field_count < 2:
            _record(
                "NAME_TIMING",
                (
                    f"Name asked too early: only {field_count} qualifying "
                    f"field(s) collected (need at least 2)"
                ),
                "medium",
                blocking=False,
            )

    # Rule 4: NO ASSUMPTIONS (blocking -- listing_type inferred without explicit user signal)
    if prev_property_info is not None:
        prev_lt = prev_property_info.get("listing_type")
        curr_lt = prop_info.get("listing_type")
        if not prev_lt and curr_lt:
            if not _BUY_RENT_EXPLICIT.search(user_message):
                _record(
                    "NO_ASSUMPTIONS",
                    (
                        f"listing_type set to '{curr_lt}' without an explicit "
                        f"buy/rent statement from the user"
                    ),
                    "high",
                    blocking=True,
                )

    # Rule 5: OFF_TOPIC HANDLING (observe-only)
    if classification == "OFF_TOPIC":
        if not _REAL_ESTATE_REDIRECT.search(bot_response):
            _record(
                "OFF_TOPIC_HANDLING",
                (
                    "Bot responded to an off-topic message without redirecting "
                    "back to real estate"
                ),
                "medium",
                blocking=False,
            )

    # Rule 6: MAX 2 QUESTION SENTENCES (observe-only)
    q_sentence_count = _count_question_sentences(bot_response)
    if q_sentence_count > 2:
        _record(
            "MAX_QUESTIONS",
            f"Bot asked {q_sentence_count} distinct question sentences, max is 2",
            "high",
            blocking=False,
        )

    # Rule 7: LISTING ACCURACY (blocking -- referenced UUID not found in DB)
    if db is not None:
        listing_ids = _LISTING_UUID_PATTERN.findall(bot_response)
        if listing_ids:
            try:
                from app.models import Listing
                for lid in listing_ids:
                    exists = db.query(Listing).filter(Listing.id == lid).first()
                    if not exists:
                        _record(
                            "LISTING_ACCURACY",
                            (
                                f"Listing ID '{lid}' referenced in bot response "
                                f"does not exist in the database"
                            ),
                            "high",
                            blocking=True,
                        )
            except Exception as e:
                print(f"[validator] listing accuracy check failed: {e}")

    # Rule 8: FLEXIBLE_BUDGET (observe-only)
    # Log if bot re-asks about budget after it has already been asked twice
    budget_ask_count = session_state.get("budget_ask_count", 0)
    if budget_ask_count >= 2 and _BUDGET_ASK_PATTERN.search(bot_response):
        _record(
            "FLEXIBLE_BUDGET",
            (
                f"Bot re-asked about budget after budget_ask_count={budget_ask_count} "
                f"(budget collection should be skipped at this point)"
            ),
            "high",
            blocking=False,
        )

    # Rule 9: SIMPLE_ENGLISH (observe-only)
    # Log overly formal language that sounds robotic or corporate
    _formal_match = _FORMAL_LANGUAGE_PATTERN.search(bot_response)
    if _formal_match:
        _record(
            "SIMPLE_ENGLISH",
            f"Bot used overly formal language: matched '{_formal_match.group()}'",
            "medium",
            blocking=False,
        )

    # Rule 10: LISTING_INTRO (observe-only)
    # Log premature listing reveal before the handoff sequence is ready
    if session_state is not None and session_state.get("listings_shown") is False:
        if _PRICE_PRESENCE.search(bot_response) or _BEDROOM_PRESENCE.search(bot_response):
            _record(
                "LISTING_INTRO",
                (
                    "Bot revealed listing data (price or bedroom count) before "
                    "listings_shown flag was set"
                ),
                "medium",
                blocking=False,
            )

    # Rule 11: LANGUAGE_MATCH (blocking)
    # If the session has a detected language, the response must be in that language.
    # A response in pure English when Arabizi/Arabic/French is expected triggers retry.
    detected_lang = (session_state.get("detected_language") or "").lower()
    if detected_lang == "arabizi":
        if not _ARABIZI_MARKER.search(bot_response):
            _record(
                "LANGUAGE_MATCH",
                (
                    "Session language is 'arabizi' but response contains no Arabizi "
                    "markers. Bot must respond in Franco-Arab Metn/Beirut dialect."
                ),
                "high",
                blocking=True,
            )
    elif detected_lang == "arabic":
        if not _ARABIC_SCRIPT.search(bot_response):
            _record(
                "LANGUAGE_MATCH",
                (
                    "Session language is 'arabic' but response contains no Arabic "
                    "script characters. Bot must respond in Lebanese Arabic."
                ),
                "high",
                blocking=True,
            )
    elif detected_lang == "french":
        if not _FRENCH_MARKER.search(bot_response):
            _record(
                "LANGUAGE_MATCH",
                (
                    "Session language is 'french' but response contains no French "
                    "words. Bot must respond entirely in French."
                ),
                "high",
                blocking=True,
            )

    # Rule 12: WRONG_DIALECT (blocking)
    # When in Arabizi mode, forbidden non-Metn words trigger retry.
    if detected_lang == "arabizi":
        wrong_match = _WRONG_DIALECT.search(bot_response)
        if wrong_match:
            _record(
                "WRONG_DIALECT",
                (
                    f"Arabizi response contains forbidden generic-Levantine word "
                    f"'{wrong_match.group()}'. Use Metn/Beirut vocabulary only: "
                    f"esta2jer, she2a, gherfet nom, mafrouch, hawela."
                ),
                "high",
                blocking=True,
            )

    return {
        "should_retry": len(blocking_violations) > 0,
        "violations": blocking_violations,
        "observations": observation_violations,
    }


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


def log_enforcement(
    enforcement_result: dict,
    conversation_id,
    user_message: str,
    bot_response: str,
    attempt: int,
) -> None:
    """
    Write enforcement gate results to violations.log.
    Logs both blocking violations and soft warnings.
    No-op if the result is clean.
    """
    has_violations = not enforcement_result.get("passed", True)
    has_warnings = bool(enforcement_result.get("soft_warnings"))
    if not has_violations and not has_warnings:
        return

    entry = {
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "type": "enforcement",
        "conversation_id": conversation_id,
        "attempt": attempt,
        "user_message": user_message[:500],
        "bot_response": bot_response[:500],
        "enforcement_violations": enforcement_result.get("violations", []),
        "soft_warnings": enforcement_result.get("soft_warnings", []),
        "details": enforcement_result.get("details", []),
    }
    _violation_logger.warning(json.dumps(entry, ensure_ascii=False))

    for detail in enforcement_result.get("details", []):
        tag = "BLOCK" if has_violations else "WARN"
        print(
            f"[ENFORCE][{tag}] "
            f"conv={conversation_id} attempt={attempt}: {detail}"
        )
