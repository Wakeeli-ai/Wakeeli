#!/usr/bin/env python3
"""
Bulk fix script for Wakeeli AI training scenario files.
Applies all text fixes to agent message blocks only.
"""

import re
import os

FILES = [
    '/home/claw/claudeclaw/workspace/Wakeeli/training/conversation_scenarios.md',
    '/home/claw/claudeclaw/workspace/Wakeeli/training/conversation_scenarios_entry_a.md',
    '/home/claw/claudeclaw/workspace/Wakeeli/training/conversation_scenarios_edge_cases.md',
    '/home/claw/claudeclaw/workspace/Wakeeli/training/conversation_scenarios_arabic.md',
]

# Fix 5: Booking confirmation simplification
# Pattern A: I've scheduled your visit for the [N]-bed [details] apartment in [location] for [time]
BOOKING_PATTERN_A = re.compile(
    r"I[''']?ve scheduled your visit for the (?:[\w-]+ ){1,10}"
    r"(?:apartment|villa|studio|flat|property|house)\s+in\s+([\w\s]+?)\s+for\s+"
    r"(.+?)(?=\s*\|\|\||\n|$)",
    re.IGNORECASE
)
# Pattern B: Ive scheduled your visit for the N-bed in [location] for [time] (no property type)
BOOKING_PATTERN_B = re.compile(
    r"I[''']?ve scheduled your visit for the (?:[\w-]+ ){1,5}"
    r"in\s+([\w\s]+?)\s+for\s+"
    r"(.+?)(?=\s*\|\|\||\n|$)",
    re.IGNORECASE
)
# Pattern C: "on the Nth floor" instead of "in [location]" - no location info
BOOKING_PATTERN_C = re.compile(
    r"I[''']?ve scheduled your visit for the (?:[\w-]+ ){1,10}"
    r"(?:apartment|villa|studio|flat|property|house)"
    r"(?:\s+on\s+[\w\s]+?)?\s+for\s+"
    r"(.+?)(?=\s*\|\|\||\n|$)",
    re.IGNORECASE
)

# Fix 3: Question-style alternatives -> statement
# Only targets patterns explicitly about finding similar/alternative properties
QUESTION_PATTERNS = [
    # "Want me to find/look for something similar..."
    re.compile(
        r'Want me to (?:find|look for|search for|show you) (?:something |a few )?similar[^?]*\?',
        re.IGNORECASE
    ),
    # "Want me to [verb] similar/comparable/other options/alternatives"
    re.compile(
        r'Want me to (?:show you |find |look for |search for )?(?:some |a few |more |other |comparable )?'
        r'(?:similar |comparable )?(?:options|alternatives)\??',
        re.IGNORECASE
    ),
    # "Would you like me to show you a few similar options..."
    re.compile(
        r'Would you like(?: me)? to (?:show you|find|look for|search for) (?:a few |some )?similar[^?]*\?',
        re.IGNORECASE
    ),
    # "Would you like me to show you similar options"
    re.compile(
        r'Would you like(?: me)? to (?:show you |find |look for |search for )?(?:some |a few )?'
        r'similar (?:options|alternatives|listings|properties)\??',
        re.IGNORECASE
    ),
]

STATEMENT_REPLACEMENT = "But ill be more than happy to help you find similar options."


def fix_agent_content(content):
    """
    Apply all fixes to agent message content (text after the **Agent:** marker).
    Returns (fixed_content, changes_dict)
    """
    changes = {
        'opening_comma': 0,
        'database_phrase': 0,
        'question_to_statement': 0,
        'exclamation_marks': 0,
        'booking_simplification': 0,
    }

    # --- Fix 1a: Remove comma after opening capitalized word(s) at very start ---
    # Handles: "Sure, to help..." -> "Sure to help..."
    # "Hello, thanks..." -> "Hello thanks..."
    # "Got it, I'll..." -> "Got it I'll..."
    # Regex: one uppercase-starting word, then optional lowercase words, then comma+space
    new, count = re.subn(
        r'^([A-Z][a-zA-Z]*(?:\s+[a-zA-Z]+)*),(?=\s)',
        r'\1',
        content
    )
    if count:
        changes['opening_comma'] += count
        content = new

    # --- Fix 1b: Same fix after ||| message separators ---
    new, count = re.subn(
        r'(\|\|\|\s*)([A-Z][a-zA-Z]*(?:\s+[a-zA-Z]+)*),(?=\s)',
        r'\1\2',
        content
    )
    if count:
        changes['opening_comma'] += count
        content = new

    # --- Fix 2: Remove 'in our database' or 'in the database' ---
    new, count = re.subn(
        r'\s+in (?:our|the) database',
        '',
        content,
        flags=re.IGNORECASE
    )
    if count:
        changes['database_phrase'] += count
        content = new

    # --- Fix 3: Replace question-style alternative offers with statement ---
    for pat in QUESTION_PATTERNS:
        new, count = pat.subn(STATEMENT_REPLACEMENT, content)
        if count:
            changes['question_to_statement'] += count
            content = new

    # --- Fix 4: Replace exclamation marks with periods ---
    exclaim_count = content.count('!')
    if exclaim_count:
        content = content.replace('!', '.')
        # Clean up any double-periods created (e.g. ".." from "!.")
        content = re.sub(r'\.{2,}', '.', content)
        changes['exclamation_marks'] += exclaim_count

    # --- Fix 5: Simplify booking confirmation messages ---
    def booking_repl(m):
        location = m.group(1).strip()
        time_slot = m.group(2).strip()
        return f"Your visit in {location} is set for {time_slot}"

    new, count = BOOKING_PATTERN_A.subn(booking_repl, content)
    if count:
        changes['booking_simplification'] += count
        content = new

    # Pattern B: no explicit property type (e.g. "the 3-bed in Raouche for...")
    new, count = BOOKING_PATTERN_B.subn(booking_repl, content)
    if count:
        changes['booking_simplification'] += count
        content = new

    # Pattern C: "on the Nth floor" - no location, use generic form
    def booking_repl_c(m):
        time_slot = m.group(1).strip()
        return f"Your visit is set for {time_slot}"

    new, count = BOOKING_PATTERN_C.subn(booking_repl_c, content)
    if count:
        changes['booking_simplification'] += count
        content = new

    return content, changes


def process_file(filepath):
    """
    Read file, apply all fixes to agent message blocks, write back.
    Returns dict of change counts.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        raw = f.read()

    lines = raw.split('\n')
    result = []
    agent_buffer = []
    in_agent = False

    total_changes = {
        'opening_comma': 0,
        'database_phrase': 0,
        'question_to_statement': 0,
        'exclamation_marks': 0,
        'booking_simplification': 0,
    }

    def flush_buffer():
        """Process accumulated agent block and push to result."""
        if not agent_buffer:
            return

        first_line = agent_buffer[0]
        # Extract the **Agent:** marker and the content on the first line
        # Handles: **Agent:** / **Agent (follow-up):** / **Agent [triggered]:**
        m = re.match(r'^(\s*\*\*Agent(?:\s+[\(\[][^\)\]]*[\)\]])?:\*\*\s*)(.*)', first_line)
        if not m:
            result.extend(agent_buffer)
            agent_buffer.clear()
            return

        marker = m.group(1)
        first_content = m.group(2)

        # Join with any continuation lines
        if len(agent_buffer) > 1:
            full_content = first_content + '\n' + '\n'.join(agent_buffer[1:])
        else:
            full_content = first_content

        fixed_content, changes = fix_agent_content(full_content)

        for k, v in changes.items():
            total_changes[k] += v

        # Reconstruct: first line = marker + first segment of fixed content
        fixed_lines = fixed_content.split('\n')
        result.append(marker + fixed_lines[0])
        for line in fixed_lines[1:]:
            result.append(line)

        agent_buffer.clear()

    for line in lines:
        stripped = line.strip()

        is_lead = stripped.startswith('**Lead:**')
        is_outcome = stripped.startswith('**Expected Outcome:**')
        is_separator = stripped == '---'
        # Handles: **Agent:** / **Agent (follow-up):** / **Agent [triggered]:** / **Agent [Day 3]:** etc.
        is_agent = bool(re.match(r'^\s*\*\*Agent(?:\s+[\(\[][^\)\]]*[\)\]])?:\*\*', line))

        if is_lead or is_outcome or is_separator:
            if in_agent:
                flush_buffer()
                in_agent = False
            result.append(line)
        elif is_agent:
            if in_agent:
                flush_buffer()
            in_agent = True
            agent_buffer.append(line)
        elif in_agent:
            agent_buffer.append(line)
        else:
            result.append(line)

    # Flush any remaining agent block at end of file
    if in_agent and agent_buffer:
        flush_buffer()

    new_raw = '\n'.join(result)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(new_raw)

    return total_changes


def main():
    print("Wakeeli Training Scenarios - Bulk Fix Script")
    print("=" * 50)

    grand = {
        'opening_comma': 0,
        'database_phrase': 0,
        'question_to_statement': 0,
        'exclamation_marks': 0,
        'booking_simplification': 0,
    }

    labels = {
        'opening_comma':          'Removed opening commas',
        'database_phrase':        'Removed database phrases',
        'question_to_statement':  'Replaced question with statement',
        'exclamation_marks':      'Replaced exclamation marks',
        'booking_simplification': 'Simplified booking confirmations',
    }

    for fp in FILES:
        name = os.path.basename(fp)
        print(f"\n{name}")
        print("-" * len(name))

        if not os.path.exists(fp):
            print("  [FILE NOT FOUND]")
            continue

        try:
            changes = process_file(fp)
            total = sum(changes.values())

            if total == 0:
                print("  No changes needed.")
            else:
                for key, count in changes.items():
                    if count > 0:
                        print(f"  {labels[key]}: {count}")
                print(f"  Subtotal: {total}")

            for k in grand:
                grand[k] += changes[k]

        except Exception as e:
            import traceback
            print(f"  ERROR: {e}")
            traceback.print_exc()

    print("\n" + "=" * 50)
    grand_total = sum(grand.values())
    print(f"Grand total fixes applied: {grand_total}")
    for key, count in grand.items():
        if count > 0:
            print(f"  {labels[key]}: {count}")

    print("\nVerifying residual issues...")
    print("-" * 30)

    for fp in FILES:
        name = os.path.basename(fp)
        if not os.path.exists(fp):
            continue
        with open(fp, 'r', encoding='utf-8') as f:
            lines = fp and open(fp).readlines()

        # Only count ! in agent lines (Lead lines are intentionally untouched)
        agent_exclaims = sum(
            1 for l in lines
            if '!' in l and re.match(r'\s*\*\*Agent', l)
        )
        db_phrases = sum(
            1 for l in lines
            if re.search(r'in (?:our|the) database', l, re.IGNORECASE)
               and re.match(r'\s*\*\*Agent', l)
        )
        bookings = sum(
            1 for l in lines
            if re.search(r"I[''']?ve scheduled your visit for the", l)
               and re.match(r'\s*\*\*Agent', l)
        )

        issues = []
        if agent_exclaims:
            issues.append(f"{agent_exclaims} agent exclamation marks remaining")
        if db_phrases:
            issues.append(f"{db_phrases} database phrases remaining")
        if bookings:
            issues.append(f"{bookings} unmatched booking confirmations")

        if issues:
            print(f"  {name}: {', '.join(issues)}")
        else:
            print(f"  {name}: clean")


if __name__ == '__main__':
    main()
