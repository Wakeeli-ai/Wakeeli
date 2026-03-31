#!/usr/bin/env python3
"""Fix edge cases scenarios based on Fox's review."""

import re

FILE = '/home/claw/claudeclaw/workspace/Wakeeli/training/conversation_scenarios_edge_cases.md'

FALLBACK_LINE = "**Agent:** Let me connect you with one of our agents who can help you with this."
FALLBACK_OUTCOME = "**Expected Outcome:** Handed off to human agent"

def parse_scenarios(content):
    """Split file into header + list of scenario blocks."""
    # Split on scenario headers
    parts = re.split(r'(### Scenario \d+:)', content)

    header = parts[0]
    scenarios = []
    i = 1
    while i < len(parts):
        title_marker = parts[i]
        body = parts[i+1] if i+1 < len(parts) else ""
        scenarios.append(title_marker + body)
        i += 2

    return header, scenarios

def get_scenario_num(block):
    m = re.match(r'### Scenario (\d+):', block)
    return int(m.group(1)) if m else 0

def make_fallback(block):
    """Replace a scenario's conversation with fallback."""
    lines = block.split('\n')
    result = []
    in_conversation = False
    conversation_done = False
    lead_line_kept = False

    for line in lines:
        stripped = line.strip()

        if stripped == '**Conversation:**':
            in_conversation = True
            result.append(line)
            continue

        if in_conversation and not conversation_done:
            if stripped.startswith('**Lead:**') and not lead_line_kept:
                result.append(line)
                result.append(FALLBACK_LINE)
                lead_line_kept = True
                continue
            elif stripped.startswith('**Expected Outcome:**'):
                result.append('')
                result.append(FALLBACK_OUTCOME)
                conversation_done = True
                in_conversation = False
                continue
            else:
                # Skip all other conversation lines
                continue

        if stripped.startswith('**Expected Outcome:**') and conversation_done:
            continue  # Already added

        result.append(line)

    return '\n'.join(result)

def fix_scenario(block):
    """Apply specific fixes based on scenario number."""
    num = get_scenario_num(block)

    # ALL off-topic scenarios (1-22) are fallbacks
    if 1 <= num <= 22:
        return make_fallback(block)

    # Specific fallbacks
    if num in [25, 27, 28, 29, 34, 40, 42, 47, 54, 56, 58, 59]:
        return make_fallback(block)

    # S23: Remove "welcome back" language, just continue flow
    if num == 23:
        block = re.sub(r'\*\*Agent:\*\*.*[Ww]elcome back.*',
                       '**Agent:** All right noted. Are you still looking in the same area or did anything change?',
                       block)
        block = re.sub(r'[Ww]elcome back[.!]?\s*', '', block)

    # S24: Never answer things we don't know, refer to agent
    if num == 24:
        # Replace any agent guessing about area details with agent referral
        block = re.sub(
            r'(\*\*Agent:\*\*.*?)(?:is known for|is a great area|has a lot of|is popular|is well-known).*',
            r'\1The agent would be able to assist you better about this.',
            block
        )

    # S26: Small + 4 bedrooms is NOT contradictory. Small = small sqm.
    if num == 26:
        # Remove any "that seems contradictory" or "could you clarify" language
        block = re.sub(r'(?i)that.*contradictory.*?\n', '', block)
        block = re.sub(r'(?i)could you clarify.*?\n', '', block)
        block = re.sub(r'(?i)just to clarify.*small.*?\n', '', block)
        block = re.sub(r'(?i)did you mean.*?\n', '', block)

    # S31, S32: Never say "looking now [Name]", never reveal nothing found
    if num in [31, 32]:
        block = re.sub(r'(?i)looking now[,]?\s*\w+', 'On it', block)
        block = re.sub(r'(?i)searching now[,]?\s*\w+', 'On it', block)
        # Replace "nothing found" / "no matches" with agent referral
        block = re.sub(r'(?i)\*\*Agent:\*\*.*(?:no listings|nothing found|no matches|no results|couldn\'t find|could not find|unable to find|no options).*',
                       '**Agent:** The agent will be reaching out shortly to help you with this.', block)

    # S35: Don't say "let me redo research", just provide corrected options
    if num == 35:
        block = re.sub(r'(?i)let me redo.*?\.|no problem.*?let me redo.*?\.|let me search again.*?\.|let me update.*?search.*?\.',
                       'Sure.', block)

    # S36: Don't say "got it let me pull up more options". Just "Sure"
    if num == 36:
        block = re.sub(r'(?i)got it[,]?\s*let me pull up.*?\.|got it[,]?\s*let me find.*?\.|got it[,]?\s*let me search.*?\.',
                       'Sure.', block)

    # S37: Connect directly with agent, don't check calendar
    if num == 37:
        # Find the booking/scheduling part and replace with agent handoff
        block = re.sub(r'(?i)\*\*Agent:\*\*.*(?:check.*calendar|check.*availability|let me see.*schedule|how about|when works).*',
                       '**Agent:** Let me connect you with the agent directly. They will coordinate the visit with you.', block)

    # S42: Direct agent connection
    if num == 42:
        block = re.sub(r'(?i)\*\*Agent:\*\*.*(?:connect|reach out|agent).*\?',
                       '**Agent:** Let me connect you with an agent.', block)

    # S45: No "searching now" language
    if num == 45:
        block = re.sub(r'(?i)searching now[,]?\s*\w+', 'On it', block)
        block = re.sub(r'(?i)looking now[,]?\s*\w+', 'On it', block)
        block = re.sub(r"(?i)I'll look for.*?options.*?\.", 'On it.', block)

    # S48: Don't say "that looks like a phone number". Just re-ask name.
    if num == 48:
        block = re.sub(r'(?i)\*\*Agent:\*\*.*(?:looks like a phone|that\'s a phone|seems like a number|that appears to be).*',
                       '**Agent:** Whats your name?', block)

    # S49: Address is with the agent, not the bot
    if num == 49:
        block = re.sub(r'(?i)(?:exact address|the address).*(?:will be shared|shared with you).*(?:when you confirm|once you book|after booking).*',
                       'The agent will be sharing the location with you.', block)

    # S51: Agree first about photos, then suggest in-person
    if num == 51:
        block = re.sub(r'(?i)\*\*Agent:\*\*.*(?:best way to confirm|photos.*verify|to be sure).*',
                       '**Agent:** Yes they are but the best way to confirm is to see in person.', block)

    # S53: Remove the last agent message about "flag it"
    if num == 53:
        block = re.sub(r'\*\*Agent:\*\*.*(?:flag it|want me to flag).*\n?', '', block)

    return block

def main():
    with open(FILE, 'r') as f:
        content = f.read()

    header, scenarios = parse_scenarios(content)

    fixed = []
    changes = 0
    for s in scenarios:
        original = s
        s = fix_scenario(s)
        if s != original:
            changes += 1
        fixed.append(s)

    output = header + ''.join(fixed)

    with open(FILE, 'w') as f:
        f.write(output)

    print(f"Fixed {changes} scenarios out of {len(scenarios)} total")

if __name__ == '__main__':
    main()
