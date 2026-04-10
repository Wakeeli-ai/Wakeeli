#!/usr/bin/env python3
"""
Snapshot comparison: re-runs all 30 scenarios and compares against golden files.
Use this after any code change to catch regressions.

Usage:
    cd /home/claw/claudeclaw/workspace/Wakeeli/backend
    python tests/snapshot_compare.py

Reports:
    - X/30 passed, Y/30 failed
    - Regressions: scenarios that were PASS in golden, now FAIL
    - Fixed: scenarios that were FAIL in golden, now PASS
    - Full diff of response content for changed scenarios
"""

import os
import sys
import difflib
from datetime import datetime

# Add tests/ to path so we can import snapshot_runner
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from snapshot_runner import (
    build_scenarios,
    save_snapshot,
    ScenarioResult,
    SNAPSHOTS_DIR,
    DEMO_ENDPOINT,
    raw_text,
    lower_text,
    contains,
)

COMPARE_RESULTS_FILE = os.path.join(SNAPSHOTS_DIR, "compare_results.txt")


# ---------------------------------------------------------------------------
# Parse golden files
# ---------------------------------------------------------------------------

def parse_golden(num: int) -> dict:
    """
    Parse a golden snapshot file. Returns:
        {
            "passed": bool,
            "notes": str,
            "turns": [(lead_msg, agent_msg), ...],
            "generated": str,
        }
    Returns None if file does not exist.
    """
    num_str = str(num).zfill(2)
    filename = os.path.join(SNAPSHOTS_DIR, f"scenario_{num_str}.txt")

    if not os.path.exists(filename):
        return None

    with open(filename, "r", encoding="utf-8") as f:
        content = f.read()

    lines = content.splitlines()
    parsed = {
        "passed": False,
        "notes": "",
        "turns": [],
        "generated": "",
        "raw_agent_responses": [],
    }

    current_lead = None
    agent_bubbles = []

    for line in lines:
        if line.startswith("Generated:"):
            parsed["generated"] = line.replace("Generated:", "").strip()
        elif line.startswith("RESULT:"):
            parsed["passed"] = "PASS" in line
        elif line.startswith("NOTES:"):
            parsed["notes"] = line.replace("NOTES:", "").strip()
            if not parsed["notes"]:
                # Multi-line notes follow
                pass
        elif "] Lead:" in line:
            # Save previous turn if any
            if current_lead is not None and agent_bubbles:
                parsed["turns"].append((current_lead, " ".join(agent_bubbles)))
                parsed["raw_agent_responses"].append(" ".join(agent_bubbles))
                agent_bubbles = []
            current_lead = line.split("] Lead:", 1)[1].strip()
        elif "] Agent:" in line:
            agent_bubbles.append(line.split("] Agent:", 1)[1].strip())

    # Save last turn
    if current_lead is not None and agent_bubbles:
        parsed["turns"].append((current_lead, " ".join(agent_bubbles)))
        parsed["raw_agent_responses"].append(" ".join(agent_bubbles))

    return parsed


# ---------------------------------------------------------------------------
# Per-scenario behavioral checks (independent of golden content)
# These catch specific rule violations regardless of golden status.
# ---------------------------------------------------------------------------

def apply_behavioral_checks(result: ScenarioResult, violations: list):
    """
    Apply pipeline-rule checks across all turns of a scenario.
    Appends violation strings to the violations list.
    """
    all_agent_text = " ".join(
        turn.bot_response for turn in result.turns
    ).lower()

    # Rule: no forbidden phrases in any turn
    forbidden_phrases = [
        ("nothing found", "forbidden phrase 'nothing found'"),
        ("nothing was found", "forbidden phrase 'nothing was found'"),
        ("no properties found", "forbidden phrase 'no properties found'"),
        ("no listings found", "forbidden phrase 'no listings found'"),
        ("welcome back", "forbidden phrase 'welcome back'"),
        ("looking now", "forbidden phrase 'looking now'"),
    ]
    for phrase, label in forbidden_phrases:
        if phrase in all_agent_text:
            violations.append(f"BEHAVIORAL: {label}")

    # Rule: max 2 question marks per response
    for i, turn in enumerate(result.turns, 1):
        q = turn.bot_response.count("?")
        if q > 2:
            violations.append(f"BEHAVIORAL: Turn {i} has {q} question marks (max 2)")

    # Scenario-specific behavioral rules
    num = result.num

    # Scenarios 3, 12, 13: must ask buy/rent when not specified
    if num == 3:
        first_agent = result.turns[0].bot_response.lower() if result.turns else ""
        if not contains(first_agent, "buy", "rent", "purchase", "renting", "buying"):
            violations.append("BEHAVIORAL: Did not ask buy/rent when type not specified")

    # Scenario 8: buy flow, furnished never asked
    if num == 8:
        furnished_phrases = [
            "furnished or unfurnished", "unfurnished or furnished",
            "do you want it furnished", "want it furnished",
        ]
        for phrase in furnished_phrases:
            if phrase in all_agent_text:
                violations.append(f"BEHAVIORAL: Furnished asked in buy flow ('{phrase}')")

    # Scenario 15: handoff mode should connect to agent
    if num == 15:
        if result.turns and len(result.turns) >= 2:
            last = result.turns[-1].bot_response.lower()
            if not contains(last, "agent", "connect", "human", "team member", "representative"):
                violations.append("BEHAVIORAL: Handoff mode did not connect to agent after interest")

    # Scenario 16: auto mode should initiate booking
    if num == 16:
        if result.turns and len(result.turns) >= 2:
            last = result.turns[-1].bot_response.lower()
            if not contains(last, "tour", "visit", "book", "schedule", "when", "date", "time"):
                violations.append("BEHAVIORAL: Auto mode did not initiate booking after interest")

    # Scenario 23: no 'welcome back' on return
    if num == 23:
        for turn in result.turns:
            if "welcome back" in turn.bot_response.lower():
                violations.append("BEHAVIORAL: Said 'welcome back' on return message")

    # Scenario 27: no 'nothing found' family of phrases
    if num == 27:
        forbidden_27 = [
            "nothing found", "no results found", "no listings found",
            "couldn't find anything", "found nothing",
        ]
        for phrase in forbidden_27:
            if phrase in all_agent_text:
                violations.append(f"BEHAVIORAL: Said '{phrase}' (must not use this phrase)")


# ---------------------------------------------------------------------------
# Diff engine
# ---------------------------------------------------------------------------

def response_diff(golden_responses: list, new_responses: list) -> str:
    """
    Generate a human-readable diff of agent responses between runs.
    golden_responses and new_responses are lists of strings (one per turn).
    """
    golden_lines = [f"Turn {i+1}: {r}" for i, r in enumerate(golden_responses)]
    new_lines = [f"Turn {i+1}: {r}" for i, r in enumerate(new_responses)]

    diff = list(difflib.unified_diff(
        golden_lines,
        new_lines,
        fromfile="golden",
        tofile="new run",
        lineterm="",
    ))

    if not diff:
        return "  (responses identical)"

    return "\n".join(f"  {line}" for line in diff[:40])


# ---------------------------------------------------------------------------
# Main comparison
# ---------------------------------------------------------------------------

class CompareResult:
    def __init__(self, num: int, description: str):
        self.num = num
        self.description = description
        self.golden_passed: bool = None
        self.new_passed: bool = False
        self.golden_notes: str = ""
        self.new_violations: list = []
        self.behavioral_violations: list = []
        self.response_diff: str = ""
        self.status: str = ""  # PASS / FAIL / REGRESSION / FIXED / NEW_FAILURE / IMPROVED


def run_comparison() -> list:
    print(f"Wakeeli Snapshot Compare")
    print(f"Endpoint : {DEMO_ENDPOINT}")
    print(f"Goldens  : {SNAPSHOTS_DIR}")
    print(f"Re-running 30 scenarios ...")
    print("-" * 62)

    new_scenarios = build_scenarios()
    compare_results = []

    for new in new_scenarios:
        cr = CompareResult(new.num, new.description)

        # Load golden
        golden = parse_golden(new.num)

        if golden is None:
            cr.golden_passed = None
            cr.golden_notes = "No golden file found"
            cr.status = "NO_GOLDEN"
        else:
            cr.golden_passed = golden["passed"]
            cr.golden_notes = golden["notes"]

        # Run behavioral checks on new result
        apply_behavioral_checks(new, cr.behavioral_violations)

        # New run violations = from runner + behavioral
        cr.new_violations = list(new.violations) + cr.behavioral_violations
        cr.new_passed = len(cr.new_violations) == 0

        # Determine status
        if cr.golden_passed is None:
            cr.status = "NO_GOLDEN"
        elif cr.golden_passed and not cr.new_passed:
            cr.status = "REGRESSION"
        elif not cr.golden_passed and cr.new_passed:
            cr.status = "FIXED"
        elif cr.new_passed:
            cr.status = "PASS"
        else:
            cr.status = "FAIL"

        # Build response diff
        if golden is not None:
            golden_responses = golden["raw_agent_responses"]
            new_responses = [turn.bot_response for turn in new.turns]
            cr.response_diff = response_diff(golden_responses, new_responses)

        compare_results.append(cr)

        # Print live progress
        status_label = {
            "PASS":        "  PASS      ",
            "FAIL":        "  FAIL      ",
            "REGRESSION":  "  REGRESSION",
            "FIXED":       "  FIXED     ",
            "NO_GOLDEN":   "  NO_GOLDEN ",
        }.get(cr.status, cr.status)

        print(f"[{status_label}] {new.num:02d}. {new.description}")
        if cr.new_violations:
            for v in cr.new_violations[:3]:
                print(f"              ! {v}")
            if len(cr.new_violations) > 3:
                print(f"              ! ... {len(cr.new_violations) - 3} more violations")

    return compare_results


# ---------------------------------------------------------------------------
# Reporting
# ---------------------------------------------------------------------------

def report(compare_results: list):
    total = len(compare_results)
    passed = sum(1 for r in compare_results if r.status in ("PASS", "FIXED"))
    failed = total - passed
    regressions = [r for r in compare_results if r.status == "REGRESSION"]
    fixed = [r for r in compare_results if r.status == "FIXED"]
    failures = [r for r in compare_results if r.status == "FAIL"]
    no_golden = [r for r in compare_results if r.status == "NO_GOLDEN"]

    lines = []
    lines.append("=" * 62)
    lines.append("WAKEELI SNAPSHOT COMPARE REPORT")
    lines.append(f"Run at  : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append(f"Endpoint: {DEMO_ENDPOINT}")
    lines.append("=" * 62)
    lines.append(f"RESULT  : {passed}/{total} passed   {failed}/{total} failed")

    if regressions:
        lines.append(f"REGRESSIONS: {len(regressions)}")
    if fixed:
        lines.append(f"FIXED: {len(fixed)}")
    if no_golden:
        lines.append(f"NO GOLDEN: {len(no_golden)} (run snapshot_runner.py first)")
    lines.append("=" * 62)

    # Regressions first (most important)
    if regressions:
        lines.append("\nREGRESSIONS (was PASS, now FAIL):")
        for r in regressions:
            lines.append(f"\n  [{r.num:02d}] {r.description}")
            lines.append(f"  Golden : PASS ({r.golden_notes})")
            lines.append(f"  Now    : FAIL")
            for v in r.new_violations:
                lines.append(f"    - {v}")
            if r.response_diff and r.response_diff != "  (responses identical)":
                lines.append(f"  Response diff:")
                lines.append(r.response_diff)

    # Fixed scenarios
    if fixed:
        lines.append("\nFIXED (was FAIL, now PASS):")
        for r in fixed:
            lines.append(f"  [{r.num:02d}] {r.description} (was: {r.golden_notes})")

    # Ongoing failures
    if failures:
        lines.append("\nONGOING FAILURES:")
        for r in failures:
            lines.append(f"\n  [{r.num:02d}] {r.description}")
            for v in r.new_violations:
                lines.append(f"    - {v}")

    # No golden
    if no_golden:
        lines.append("\nMISSING GOLDENS:")
        for r in no_golden:
            lines.append(f"  [{r.num:02d}] {r.description}")
        lines.append("  Run: python tests/snapshot_runner.py")

    lines.append("\n" + "=" * 62)
    lines.append("BEHAVIORAL RULE SUMMARY")
    lines.append("=" * 62)
    rules = [
        ("No 'nothing found' phrase", [27]),
        ("No 'welcome back' phrase", [23]),
        ("No 'looking now' phrase", list(range(1, 31))),
        ("Buy/rent asked when not specified", [3]),
        ("Furnished never asked for buy", [8]),
        ("Handoff mode routes to agent", [15]),
        ("Auto mode initiates booking", [16]),
        ("Max 2 questions per response", list(range(1, 31))),
    ]
    for rule_name, scenario_nums in rules:
        relevant = [r for r in compare_results if r.num in scenario_nums]
        rule_violations = [
            r for r in relevant
            if any(rule_name.split()[1].lower() in v.lower()
                   or v.lower().startswith("behavioral")
                   for v in r.new_violations)
        ]
        status = "OK" if not rule_violations else f"FAIL (scenarios: {[r.num for r in rule_violations]})"
        lines.append(f"  {rule_name:45s} {status}")

    output = "\n".join(lines)
    print("\n" + output)

    with open(COMPARE_RESULTS_FILE, "w", encoding="utf-8") as f:
        f.write(output)

    print(f"\nFull report saved to: {COMPARE_RESULTS_FILE}")
    return passed, failed


# ---------------------------------------------------------------------------
# Entry point
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    results = run_comparison()
    report(results)
