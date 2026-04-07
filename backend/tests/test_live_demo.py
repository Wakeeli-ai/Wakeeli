#!/usr/bin/env python3
"""
Live demo endpoint tests against the Railway deployment.

Tests POST /api/demo/chat on https://wakeeli-ai.up.railway.app
Each scenario creates its own session_id so tests are fully isolated.

Run:
    python3 /home/claw/claudeclaw/workspace/Wakeeli/backend/tests/test_live_demo.py

Results saved to:
    /home/claw/claudeclaw/workspace/Wakeeli/backend/tests/live_test_results.txt
"""

import uuid
import time
import json
import requests
from datetime import datetime
from typing import List, Optional, Callable, Tuple

RAILWAY_URL = "https://wakeeli-ai.up.railway.app"
DEMO_ENDPOINT = f"{RAILWAY_URL}/api/demo/chat"
RESULTS_FILE = "/home/claw/claudeclaw/workspace/Wakeeli/backend/tests/live_test_results.txt"

REQUEST_TIMEOUT = 45
TURN_DELAY = 0.4


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

def new_session() -> str:
    return str(uuid.uuid4())


def send(message: str, session_id: str, mode: str = "auto") -> dict:
    """POST to the demo endpoint. Returns parsed JSON or error dict."""
    try:
        resp = requests.post(
            DEMO_ENDPOINT,
            json={"message": message, "mode": mode, "session_id": session_id},
            timeout=REQUEST_TIMEOUT,
        )
        resp.raise_for_status()
        return resp.json()
    except requests.exceptions.Timeout:
        return {"error": "timeout", "messages": []}
    except Exception as exc:
        return {"error": str(exc), "messages": []}


def extract_text(resp: dict) -> str:
    """Join all message strings from a response into one lowercased string."""
    parts = resp.get("messages", [])
    if not parts:
        return ""
    return " ".join(str(p) for p in parts).lower()


def raw_text(resp: dict) -> str:
    """Same as extract_text but preserves case."""
    parts = resp.get("messages", [])
    return " ".join(str(p) for p in parts)


def count_questions(resp: dict) -> int:
    return raw_text(resp).count("?")


def contains(text: str, *keywords) -> bool:
    t = text.lower()
    return any(k.lower() in t for k in keywords)


# ---------------------------------------------------------------------------
# Result container
# ---------------------------------------------------------------------------

class ScenarioResult:
    def __init__(self, name: str):
        self.name = name
        self.turns: List[Tuple[str, str]] = []   # (sent, received_raw)
        self.passed = False
        self.reason = ""
        self.violations: List[str] = []

    def add_turn(self, sent: str, received: str):
        self.turns.append((sent, received))

    def add_violation(self, v: str):
        self.violations.append(v)

    def finalize(self):
        if self.violations:
            self.passed = False
            self.reason = f"{len(self.violations)} violation(s)"
        else:
            self.passed = True
            self.reason = "All checks passed"


# ---------------------------------------------------------------------------
# Core runner
# ---------------------------------------------------------------------------

CheckFn = Callable[[dict, int, ScenarioResult], None]


def run(name: str, turns: List[Tuple[str, Optional[CheckFn]]], mode: str = "auto") -> ScenarioResult:
    """
    Run a multi-turn scenario.

    turns: list of (message, check_fn)
           check_fn(response_dict, turn_number, result) -> None
           check_fn may call result.add_violation()
           Pass None for check_fn to skip checks on that turn.
    """
    result = ScenarioResult(name)
    sid = new_session()

    for i, (message, check_fn) in enumerate(turns):
        resp = send(message, sid, mode=mode)
        received = raw_text(resp)
        result.add_turn(message, received[:300] + "..." if len(received) > 300 else received)

        if resp.get("error") and not resp.get("messages"):
            result.add_violation(f"Turn {i+1}: request failed ({resp['error']})")
            break

        # Global check: at most 2 question marks per response
        q = count_questions(resp)
        if q > 2:
            result.add_violation(f"Turn {i+1}: {q} question marks (max 2 allowed)")

        if check_fn:
            check_fn(resp, i + 1, result)

        if i < len(turns) - 1:
            time.sleep(TURN_DELAY)

    result.finalize()
    return result


# ---------------------------------------------------------------------------
# Scenario-specific check functions
# ---------------------------------------------------------------------------

def check_not_empty(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response")


def check_has_keyword(resp, turn, result, *keywords):
    if not contains(extract_text(resp), *keywords):
        result.add_violation(
            f"Turn {turn}: expected one of {list(keywords)} in response"
        )


def check_no_keyword(resp, turn, result, *keywords):
    t = extract_text(resp)
    for k in keywords:
        if k.lower() in t:
            result.add_violation(f"Turn {turn}: response contains forbidden keyword '{k}'")


# ---------------------------------------------------------------------------
# THE 30 SCENARIOS
# ---------------------------------------------------------------------------

all_results: List[ScenarioResult] = []


# ---- 1. Basic greeting flow ------------------------------------------------

def s1_check(resp, turn, result):
    t = extract_text(resp)
    helpful = ["help", "buy", "rent", "looking", "property", "apartment", "assist", "welcome", "hello", "hi", "ahla"]
    if not contains(t, *helpful):
        result.add_violation(f"Turn {turn}: no helpful greeting or offer to assist")
    forbidden = ["budget", "bedroom", "how many", "which area", "where are you"]
    for f in forbidden:
        if f in t:
            result.add_violation(f"Turn {turn}: too early to ask '{f}' on a bare greeting")

all_results.append(run("1. Basic greeting flow", [("hi", s1_check)]))


# ---- 2. Apartment without buy/rent -----------------------------------------

def s2_check(resp, turn, result):
    t = extract_text(resp)
    if not contains(t, "buy", "rent", "purchase", "sale", "selling"):
        result.add_violation(f"Turn {turn}: did not ask buy or rent")
    # Only flag if the response is STATING rent (not asking about it).
    # "Is this for rent or to buy?" is correct behavior, not an assumption.
    # We flag when the response skips asking and goes straight to rent mode.
    is_asking = "for rent or" in t or "rent or buy" in t or "rent or to buy" in t or "is this for rent" in t
    if not is_asking:
        assume_rent = ["to rent", "monthly rental", "your lease", "renting it", "the rental"]
        for k in assume_rent:
            if k in t:
                result.add_violation(f"Turn {turn}: assumed rent without confirmation (found '{k}')")

all_results.append(run("2. Apartment without buy/rent", [("looking for an apartment", s2_check)]))


# ---- 3. Explicit buy -------------------------------------------------------

def s3_check(resp, turn, result):
    t = extract_text(resp)
    if "buy or rent" in t or "rent or buy" in t:
        result.add_violation(f"Turn {turn}: re-asked buy/rent after it was already stated")
    useful = ["location", "area", "where", "budget", "price", "bedroom", "neighborhood", "district", "help"]
    if not contains(t, *useful):
        result.add_violation(f"Turn {turn}: did not ask a useful follow-up after 'buy' stated")

all_results.append(run("3. Explicit buy", [("I want to buy an apartment", s3_check)]))


# ---- 4. Explicit rent ------------------------------------------------------

def s4_check(resp, turn, result):
    t = extract_text(resp)
    if "buy or rent" in t or "rent or buy" in t:
        result.add_violation(f"Turn {turn}: re-asked buy/rent after it was already stated")
    useful = ["location", "area", "where", "budget", "price", "bedroom", "neighborhood", "district", "help"]
    if not contains(t, *useful):
        result.add_violation(f"Turn {turn}: did not ask a useful follow-up after 'rent' stated")

all_results.append(run("4. Explicit rent", [("I want to rent a place", s4_check)]))


# ---- 5. Multi-info message -------------------------------------------------

def s5_check(resp, turn, result):
    t = extract_text(resp)
    re_asks = [
        ("buy or rent", "re-asked buy/rent"),
        ("rent or buy", "re-asked buy/rent"),
        ("how many bedroom", "re-asked bedrooms"),
        ("which area", "re-asked area"),
        ("what area", "re-asked area"),
        ("what's your budget", "re-asked budget"),
        ("what is your budget", "re-asked budget"),
        ("your budget", "re-asked budget"),
        ("how much are you looking", "re-asked budget"),
    ]
    for phrase, label in re_asks:
        if phrase in t:
            result.add_violation(f"Turn {turn}: {label} (all info was provided)")

all_results.append(run("5. Multi-info (rent 2BR Achrafieh $1000)", [
    ("I want to rent a 2 bedroom apartment in Achrafieh for 1000 dollars", s5_check),
]))


# ---- 6. Off-topic ----------------------------------------------------------

def s6_check(resp, turn, result):
    t = extract_text(resp)
    handoff = ["connect you with an agent", "transfer you", "human agent will", "speak to our agent"]
    for k in handoff:
        if k in t:
            result.add_violation(f"Turn {turn}: handed off to agent for off-topic message")
    redirect = ["property", "apartment", "real estate", "buy", "rent", "help you find", "looking for", "assist"]
    if not contains(t, *redirect):
        result.add_violation(f"Turn {turn}: did not redirect to real estate topic")

all_results.append(run("6. Off-topic (weather)", [("what is the weather today", s6_check)]))


# ---- 7. Full conversation (multi-turn) ------------------------------------

def s7_t1(resp, turn, result):
    t = extract_text(resp)
    hello = ["hello", "hi", "welcome", "help", "assist", "ahla", "property", "looking"]
    if not contains(t, *hello):
        result.add_violation(f"Turn {turn}: no greeting or offer to help")

def s7_t2(resp, turn, result):
    t = extract_text(resp)
    if "buy or rent" in t or "rent or buy" in t:
        result.add_violation(f"Turn {turn}: re-asked buy/rent after 'rent' was stated")
    location_hints = ["area", "location", "where", "neighborhood", "district", "city", "which part", "beirut"]
    if not contains(t, *location_hints):
        result.add_violation(f"Turn {turn}: did not ask for location after rent confirmed")

def s7_t3(resp, turn, result):
    t = extract_text(resp)
    follow_up = ["budget", "bedroom", "how many", "how much", "price", "size", "sqm", "name"]
    if not contains(t, *follow_up):
        result.add_violation(f"Turn {turn}: no follow-up question after location given")

def s7_t4(resp, turn, result):
    t = extract_text(resp)
    listing_signals = [
        "listing", "option", "property", "apartment", "available", "$", "usd",
        "sqm", "bedroom", "found", "here", "take a look", "check out",
    ]
    if not contains(t, *listing_signals):
        result.add_violation(f"Turn {turn}: no listings shown after full info provided")

def s7_t5(resp, turn, result):
    t = extract_text(resp)
    tour_signals = ["tour", "visit", "schedule", "book", "appointment", "date", "time", "available", "when"]
    if not contains(t, *tour_signals):
        result.add_violation(f"Turn {turn}: no tour booking attempt after positive selection")

all_results.append(run("7. Full multi-turn conversation", [
    ("hi", s7_t1),
    ("rent", s7_t2),
    ("Achrafieh", s7_t3),
    ("1000 dollars, 2 bedrooms", s7_t4),
    ("the first one looks good", s7_t5),
]))


# ---- 8. Arabic greeting ----------------------------------------------------

def s8_check(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to Arabic greeting")

all_results.append(run("8. Arabic greeting (marhaba)", [("marhaba", s8_check)]))


# ---- 9. Name not asked on first message ------------------------------------

def s9_t1(resp, turn, result):
    t = extract_text(resp)
    name_asks = ["your name", "what's your name", "whats your name", "may i have your name", "name please", "full name"]
    for phrase in name_asks:
        if phrase in t:
            result.add_violation(f"Turn {turn}: asked for name on very first message")

all_results.append(run("9. Name not asked on first message", [
    ("hi", s9_t1),
    ("buy", None),
    ("Beirut", None),
]))


# ---- 10. Question count limit enforced -------------------------------------

def s10_check(resp, turn, result):
    q = count_questions(resp)
    if q > 2:
        result.add_violation(f"Turn {turn}: {q} question marks in single response (limit is 2)")

all_results.append(run("10. Question count limit (max 2)", [
    ("I want to rent an apartment", s10_check),
]))


# ---- 11. Budget in LBP -----------------------------------------------------

def s11_check(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to LBP budget input")
    error_phrases = ["i don't understand", "invalid", "i cannot", "error", "not recognized"]
    for e in error_phrases:
        if e in t:
            result.add_violation(f"Turn {turn}: failed to handle LBP gracefully (found '{e}')")

all_results.append(run("11. Budget in LBP", [
    ("I want to rent an apartment for 100 million Lebanese pounds", s11_check),
]))


# ---- 12. Multiple areas ----------------------------------------------------

def s12_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("12. Multiple areas mentioned", [
    ("I'm looking in Achrafieh or Hamra or maybe Verdun", s12_check),
]))


# ---- 13. Vague preference --------------------------------------------------

def s13_check(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to vague input")
    helpful = ["area", "location", "budget", "bedroom", "buy", "rent", "help", "looking", "prefer", "where", "type"]
    if not contains(t, *helpful):
        result.add_violation(f"Turn {turn}: no helpful follow-up to vague request")

all_results.append(run("13. Vague preference (somewhere nice)", [
    ("I want to live somewhere nice", s13_check),
]))


# ---- 14. Commercial property -----------------------------------------------

def s14_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("14. Commercial property request", [
    ("I'm looking for a commercial office space to rent", s14_check),
]))


# ---- 15. Just a number -----------------------------------------------------

def s15_check(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to a bare number")

all_results.append(run("15. Lead sends just a number", [
    ("1500", s15_check),
]))


# ---- 16. Just a name -------------------------------------------------------

def s16_check(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to a bare name")

all_results.append(run("16. Lead sends just a name", [
    ("Sarah", s16_check),
]))


# ---- 17. Furnished only ----------------------------------------------------

def s17_check(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to furnished preference")
    if "furnished or unfurnished" in t or "unfurnished or furnished" in t:
        result.add_violation(f"Turn {turn}: re-asked furnished preference after it was stated")

all_results.append(run("17. Furnished only preference", [
    ("I need a furnished apartment only", s17_check),
]))


# ---- 18. Mind change mid-conversation (rent -> buy) ------------------------

def s18_t2(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response after mind change")
    still_rent = ["still renting", "ok so rent", "for rent then"]
    for k in still_rent:
        if k in t:
            result.add_violation(f"Turn {turn}: still assumed rent after user switched to buy")

all_results.append(run("18. Mind change (rent to buy)", [
    ("I want to rent a 2 bedroom in Hamra", None),
    ("Actually wait, I want to buy not rent", s18_t2),
]))


# ---- 19. Commission question -----------------------------------------------

def s19_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("19. Commission question", [
    ("how much commission do you charge?", s19_check),
]))


# ---- 20. Asking about Wakeeli -----------------------------------------------

def s20_check(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to 'what is Wakeeli'")
    explain = ["wakeeli", "platform", "ai", "real estate", "properties", "listings", "help", "assist"]
    if not contains(t, *explain):
        result.add_violation(f"Turn {turn}: did not explain what Wakeeli is")

all_results.append(run("20. Asking about Wakeeli itself", [
    ("what is Wakeeli?", s20_check),
]))


# ---- 21. Short response (yes) ----------------------------------------------

def s21_t2(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to 'yes'")

all_results.append(run("21. Short response - yes", [
    ("I want to buy an apartment in Achrafieh", None),
    ("yes", s21_t2),
]))


# ---- 22. Show more options after listings ----------------------------------

def s22_t2(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to 'show more options'")
    more_signals = ["option", "listing", "property", "apartment", "here", "also", "another", "more", "available"]
    if not contains(t, *more_signals):
        result.add_violation(f"Turn {turn}: did not show more options or suggest alternatives")

all_results.append(run("22. Show more options after listings", [
    ("rent 2 bedroom Achrafieh 1200 dollars", None),
    ("show me more options please", s22_t2),
]))


# ---- 23. Reject all listings -----------------------------------------------

def s23_t2(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to rejecting all listings")
    alternatives = ["other", "different", "criteria", "adjust", "broaden", "another", "try", "else", "budget", "area", "option", "help"]
    if not contains(t, *alternatives):
        result.add_violation(f"Turn {turn}: no alternative offered after all listings rejected")

all_results.append(run("23. Reject all listings", [
    ("rent 2 bedroom Achrafieh 1000 dollars", None),
    ("none of these work for me, I don't like any of them", s23_t2),
]))


# ---- 24. Ask about specific listing details --------------------------------

def s24_t2(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("24. Ask about specific listing details", [
    ("rent 1 bedroom Mar Mikhael 800 dollars", None),
    ("what floor is the first one on? does it have a balcony?", s24_t2),
]))


# ---- 25. Book tour for tomorrow --------------------------------------------

def s25_t2(resp, turn, result):
    t = extract_text(resp)
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to tour booking request")
    tour_words = ["tour", "visit", "appointment", "schedule", "tomorrow", "confirm", "book", "time", "when", "available"]
    if not contains(t, *tour_words):
        result.add_violation(f"Turn {turn}: no acknowledgment of tour booking request")

all_results.append(run("25. Book tour for tomorrow", [
    ("rent 2 bedroom Verdun 1500 dollars", None),
    ("I like the second one, can I visit tomorrow?", s25_t2),
]))


# ---- 26. Far timeline (maybe next year) ------------------------------------

def s26_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("26. Far timeline (maybe next year)", [
    ("I might want to buy an apartment, but maybe next year", s26_check),
]))


# ---- 27. Emoji only ---------------------------------------------------------

def s27_check(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to emoji-only message")

all_results.append(run("27. Emoji only input", [
    ("\U0001f3e0", s27_check),  # house emoji
]))


# ---- 28. Already has an agent -----------------------------------------------

def s28_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("28. Lead says they already have an agent", [
    ("I'm already working with a real estate agent", s28_check),
]))


# ---- 29. Asks for agent contact directly ------------------------------------

def s29_check(resp, turn, result):
    check_not_empty(resp, turn, result)

all_results.append(run("29. Lead asks for agent contact directly", [
    ("can you give me a phone number for one of your agents?", s29_check),
]))


# ---- 30. French speaker -----------------------------------------------------

def s30_check(resp, turn, result):
    if not raw_text(resp).strip():
        result.add_violation(f"Turn {turn}: empty response to French input")

all_results.append(run("30. Lead speaks in French", [
    ("Bonjour, je cherche un appartement a louer a Beyrouth", s30_check),
]))


# ---------------------------------------------------------------------------
# Format and save results
# ---------------------------------------------------------------------------

def format_result(r: ScenarioResult) -> str:
    lines = []
    status = "PASS" if r.passed else "FAIL"
    lines.append(f"\n{'=' * 62}")
    lines.append(f"SCENARIO: {r.name}")
    lines.append(f"STATUS:   {status}   |   {r.reason}")

    for i, (sent, received) in enumerate(r.turns):
        lines.append(f"\n  Turn {i + 1}:")
        lines.append(f"    SENT:     {sent}")
        lines.append(f"    RECEIVED: {received}")

    if r.violations:
        lines.append(f"\n  VIOLATIONS:")
        for v in r.violations:
            lines.append(f"    [X] {v}")

    return "\n".join(lines)


def run_all():
    passed = sum(1 for r in all_results if r.passed)
    failed = sum(1 for r in all_results if not r.passed)
    total = len(all_results)

    lines = []
    lines.append("WAKEELI LIVE DEMO TEST SUITE")
    lines.append(f"Endpoint:  {DEMO_ENDPOINT}")
    lines.append(f"Run at:    {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"{'=' * 62}")
    lines.append(f"RESULT:    {passed}/{total} passed   {failed}/{total} failed")
    lines.append(f"{'=' * 62}")

    for r in all_results:
        lines.append(format_result(r))

    lines.append(f"\n{'=' * 62}")
    lines.append("FINAL SUMMARY")
    lines.append(f"{'=' * 62}")
    lines.append(f"PASSED: {passed}/{total}")
    lines.append(f"FAILED: {failed}/{total}")

    if failed > 0:
        lines.append("\nFAILURES:")
        for r in all_results:
            if not r.passed:
                lines.append(f"  [{r.name}]  {r.reason}")
                for v in r.violations:
                    lines.append(f"    - {v}")

    output = "\n".join(lines)
    print(output)

    with open(RESULTS_FILE, "w") as fh:
        fh.write(output)

    print(f"\nResults saved to: {RESULTS_FILE}")
    return passed, failed, total


if __name__ == "__main__":
    print(f"Running {len(all_results)} scenarios against {DEMO_ENDPOINT}\n")
    run_all()
