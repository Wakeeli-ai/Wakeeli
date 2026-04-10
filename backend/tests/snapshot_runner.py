#!/usr/bin/env python3
"""Snapshot test runner for Wakeeli AI demo chat."""

import uuid
import json
import time
import requests
from pathlib import Path
from datetime import datetime

BASE_URL = "https://wakeeli-ai.up.railway.app/api/demo/chat"
SNAPSHOTS_DIR = Path(__file__).parent / "snapshots"
SNAPSHOTS_DIR.mkdir(exist_ok=True)


def send_message(session_id: str, message: str, mode: str = "auto") -> dict:
    payload = {
        "message": message,
        "mode": mode,
        "session_id": session_id
    }
    try:
        resp = requests.post(BASE_URL, json=payload, timeout=30)
        resp.raise_for_status()
        return resp.json()
    except Exception as e:
        return {"error": str(e), "raw": None}


def run_scenario(number: int, description: str, messages: list, checks: list) -> dict:
    session_id = str(uuid.uuid4())
    transcript = []

    for msg in messages:
        result = send_message(session_id, msg)
        # Response key is "messages" (list). Join with " ||| " for display.
        if "messages" in result:
            agent_response = " ||| ".join(result["messages"])
        elif "error" in result:
            agent_response = f"ERROR: {result['error']}"
        else:
            agent_response = str(result)
        transcript.append({"lead": msg, "agent": agent_response})
        time.sleep(1)

    return {
        "number": number,
        "description": description,
        "session_id": session_id,
        "transcript": transcript,
        "checks": checks
    }


SCENARIOS = [
    {
        "number": 1,
        "description": "Basic buy flow",
        "messages": ["hi", "buy", "Achrafieh", "300000 dollars, 3 bedrooms"],
        "checks": [
            "greeting present",
            "buy/rent asked",
            "name bundled with qualifying Qs",
            "listings shown"
        ]
    },
    {
        "number": 2,
        "description": "Basic rent flow",
        "messages": ["hello", "rent", "Hamra", "1500 a month, 2 bedrooms"],
        "checks": [
            "greeting present",
            "buy/rent asked",
            "furnished asked (rent only)",
            "listings shown"
        ]
    },
    {
        "number": 3,
        "description": "No buy/rent specified",
        "messages": ["looking for an apartment"],
        "checks": [
            "must ask buy or rent",
            "must NOT assume buy or rent"
        ]
    },
    {
        "number": 4,
        "description": "All info in one message",
        "messages": ["I want to rent a 2 bedroom apartment in Achrafieh for 1000 dollars a month"],
        "checks": [
            "should skip to name ask + listings",
            "should not re-ask known info (location/budget/bedrooms)"
        ]
    },
    {
        "number": 5,
        "description": "Budget vague first time",
        "messages": ["hi", "rent", "Beirut, 2 bedrooms", "budget is flexible"],
        "checks": [
            "should ask for a rough range after vague budget"
        ]
    },
    {
        "number": 6,
        "description": "Budget vague second time",
        "messages": ["hi", "rent", "Beirut, 2 bedrooms", "not sure about budget", "really no idea"],
        "checks": [
            "should skip budget after second vague answer",
            "should show listings without budget"
        ]
    },
    {
        "number": 7,
        "description": "Furnished asked for rent",
        "messages": ["hi", "rent", "Jounieh, 1500 a month, 2 bedrooms"],
        "checks": [
            "furnished question should appear at some point"
        ]
    },
    {
        "number": 8,
        "description": "Buy flow no furnished",
        "messages": ["hi", "buy", "Achrafieh, 200000, 2 bedrooms"],
        "checks": [
            "furnished should NOT be asked in buy flow"
        ]
    },
    {
        "number": 9,
        "description": "Off-topic message",
        "messages": ["what is the weather today"],
        "checks": [
            "must redirect to real estate",
            "must NOT hand off to agent"
        ]
    },
    {
        "number": 10,
        "description": "Name handling",
        "messages": ["hi", "buy", "Beirut"],
        "checks": [
            "name should be bundled as second message with qualifying questions",
            "not asked as a standalone first question"
        ]
    }
]


def analyze_transcript(transcript: list, checks: list) -> tuple:
    issues = []

    if not transcript:
        issues.append("No responses received")
        return "FAIL", issues

    for t in transcript:
        agent_str = str(t.get("agent", ""))
        if agent_str.startswith("ERROR:"):
            issues.append(f"API error on message '{t['lead']}': {agent_str[:200]}")
        elif "500" in agent_str and "Internal Server Error" in agent_str:
            issues.append(f"Server 500 on message '{t['lead']}'")
        elif not agent_str.strip():
            issues.append(f"Empty response on message '{t['lead']}'")

    status = "FAIL" if issues else "PASS (verify manually)"
    return status, issues


def save_scenario_result(result: dict):
    n = result["number"]
    path = SNAPSHOTS_DIR / f"scenario_{n:02d}.txt"

    status, issues = analyze_transcript(result["transcript"], result["checks"])

    lines = []
    lines.append(f"SCENARIO {n:02d}: {result['description']}")
    lines.append(f"Session ID: {result['session_id']}")
    lines.append(f"Timestamp: {datetime.now().isoformat()}")
    lines.append(f"Target: {BASE_URL}")
    lines.append("")

    for t in result["transcript"]:
        lines.append(f"[Lead]: {t['lead']}")
        lines.append(f"[Agent]: {t.get('agent', '[no response]')}")
        lines.append("")

    lines.append(f"RESULT: {status}")
    lines.append("")
    lines.append("CHECKS (manual review required):")
    for c in result["checks"]:
        lines.append(f"  - {c}")
    lines.append("")
    if issues:
        lines.append("ISSUES DETECTED:")
        for i in issues:
            lines.append(f"  - {i}")
    else:
        lines.append("ISSUES: none detected automatically")

    path.write_text("\n".join(lines))
    print(f"  Saved: {status}")
    return status, issues


def main():
    print(f"Wakeeli Snapshot Runner")
    print(f"Target: {BASE_URL}")
    print(f"Scenarios: {len(SCENARIOS)}")
    print("=" * 60)

    summary_rows = []

    for scenario_def in SCENARIOS:
        n = scenario_def["number"]
        print(f"\nScenario {n:02d}: {scenario_def['description']}")

        result = run_scenario(
            n,
            scenario_def["description"],
            scenario_def["messages"],
            scenario_def["checks"]
        )

        status, issues = save_scenario_result(result)
        summary_rows.append({
            "number": n,
            "description": scenario_def["description"],
            "status": status,
            "issues": issues
        })

        time.sleep(2)

    summary_path = SNAPSHOTS_DIR / "summary_1_10.txt"
    lines = []
    lines.append("WAKEELI SNAPSHOT TEST SUMMARY -- SCENARIOS 1 TO 10")
    lines.append(f"Run at: {datetime.now().isoformat()}")
    lines.append(f"Target: {BASE_URL}")
    lines.append("=" * 60)
    lines.append("")

    for row in summary_rows:
        n = row["number"]
        lines.append(f"Scenario {n:02d}: {row['description']}")
        lines.append(f"  Status: {row['status']}")
        if row["issues"]:
            for i in row["issues"]:
                lines.append(f"  Issue: {i}")
        lines.append("")

    fail_count = sum(1 for r in summary_rows if "FAIL" in r["status"])
    pass_count = len(summary_rows) - fail_count
    lines.append(f"Automated check results: {pass_count} passed, {fail_count} failed")
    lines.append("Note: PASS means no automated errors detected. Manual review of AI response quality required.")

    summary_path.write_text("\n".join(lines))
    print(f"\nSummary saved to {summary_path}")
    print(f"Done: {pass_count}/{len(summary_rows)} passed automated checks")


if __name__ == "__main__":
    main()
