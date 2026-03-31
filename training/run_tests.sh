#!/bin/bash
# Wakeeli Round 5 Automated Test Runner
URL="https://wakeeli-ai.up.railway.app/api/chat/test"
OUT="/home/claw/claudeclaw/workspace/Wakeeli/training/test_round5_results.txt"
DELAY=3

send() {
  local cid="$1" msg="$2"
  sleep $DELAY
  curl -s -X POST "$URL" -H 'Content-Type: application/json' \
    -d "{\"message\":\"$msg\",\"conversation_id\":\"$cid\"}" --max-time 60
}

echo "=== WAKEELI ROUND 5 TEST RESULTS ===" > "$OUT"
echo "Date: $(TZ='Asia/Beirut' date)" >> "$OUT"
echo "" >> "$OUT"

# S1: Bare Greeting
echo "--- S1: BARE GREETING ---" >> "$OUT"
R=$(send "r5t-s1" "hi")
echo "USER: hi" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S2: Rent or Buy First
echo "--- S2: RENT OR BUY FIRST ---" >> "$OUT"
send "r5t-s2" "hi" > /dev/null
R=$(send "r5t-s2" "I want an apartment in Beirut")
echo "USER: hi -> I want an apartment in Beirut" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S3: Name Enforcement
echo "--- S3: NAME ENFORCEMENT ---" >> "$OUT"
send "r5t-s3" "hi" > /dev/null
R=$(send "r5t-s3" "I want to rent in Beirut, budget 800 dollars")
echo "USER: hi -> rent Beirut $800" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S4: Full Happy Path Rent
echo "--- S4: FULL HAPPY PATH RENT ---" >> "$OUT"
send "r5t-s4" "hi" > /dev/null
R1=$(send "r5t-s4" "looking for an apartment to rent in Ashrafieh, budget 1000 dollars")
echo "USER: hi -> rent Ashrafieh $1000" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s4" "John")
echo "USER: John" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S5: Full Happy Path Buy
echo "--- S5: FULL HAPPY PATH BUY ---" >> "$OUT"
send "r5t-s5" "hi" > /dev/null
R1=$(send "r5t-s5" "I want to buy an apartment in Dbayeh, budget 300000 dollars")
echo "USER: hi -> buy Dbayeh $300k" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s5" "Sara")
echo "USER: Sara" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S6: LBP Conversion
echo "--- S6: LBP CONVERSION ---" >> "$OUT"
send "r5t-s6" "hi" > /dev/null
R1=$(send "r5t-s6" "I want to rent in Beirut, budget 50000000 LBP")
echo "USER: hi -> rent Beirut 50M LBP" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s6" "2 bedrooms unfurnished, my name is Lara")
echo "USER: 2 bedrooms unfurnished, name Lara" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S7: Off Topic
echo "--- S7: OFF TOPIC ---" >> "$OUT"
send "r5t-s7" "hi" > /dev/null
R=$(send "r5t-s7" "what is the weather today?")
echo "USER: hi -> weather?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S8: Bot Identity
echo "--- S8: BOT IDENTITY ---" >> "$OUT"
send "r5t-s8" "hi" > /dev/null
R=$(send "r5t-s8" "are you a bot?")
echo "USER: hi -> are you a bot?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S9: Arabic Greeting
echo "--- S9: ARABIC GREETING ---" >> "$OUT"
R=$(send "r5t-s9" "مرحبا")
echo "USER: مرحبا" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S10: Mixed Language
echo "--- S10: MIXED LANGUAGE ---" >> "$OUT"
send "r5t-s10" "hi" > /dev/null
R1=$(send "r5t-s10" "badde apartment bBeirut lal rent, budget 700 dollars")
echo "USER: hi -> badde apartment bBeirut..." >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s10" "Alex")
echo "USER: Alex" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S11: Rejection First
echo "--- S11: REJECTION FIRST ---" >> "$OUT"
send "r5t-s11" "hi" > /dev/null
send "r5t-s11" "I want to rent in Beirut, budget 1500" > /dev/null
R1=$(send "r5t-s11" "Mike")
echo "USER: hi -> rent Beirut $1500 -> Mike" >> "$OUT"
echo "BOT after name: $R1" >> "$OUT"
R2=$(send "r5t-s11" "not interested")
echo "USER: not interested" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S12: Rejection Second
echo "--- S12: REJECTION SECOND ---" >> "$OUT"
send "r5t-s12" "hi" > /dev/null
send "r5t-s12" "I want to rent in Beirut, budget 2000" > /dev/null
send "r5t-s12" "Joe" > /dev/null
R1=$(send "r5t-s12" "not interested")
echo "USER: hi -> rent Beirut $2000 -> Joe -> not interested" >> "$OUT"
echo "BOT first rejection: $R1" >> "$OUT"
R2=$(send "r5t-s12" "no thanks")
echo "USER: no thanks" >> "$OUT"
echo "BOT second rejection: $R2" >> "$OUT"
echo "" >> "$OUT"

# S13: Booking
echo "--- S13: BOOKING ---" >> "$OUT"
send "r5t-s13" "hi" > /dev/null
send "r5t-s13" "rent in Achrafieh budget 2500" > /dev/null
R1=$(send "r5t-s13" "Tony")
echo "USER: hi -> rent Achrafieh $2500 -> Tony" >> "$OUT"
echo "BOT after name: $R1" >> "$OUT"
R2=$(send "r5t-s13" "I like this one, can I visit?")
echo "USER: I like this, can I visit?" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S14: Same Day Visit
echo "--- S14: SAME DAY VISIT ---" >> "$OUT"
send "r5t-s14" "hi" > /dev/null
send "r5t-s14" "rent in Achrafieh budget 3000" > /dev/null
send "r5t-s14" "Sarah" > /dev/null
R=$(send "r5t-s14" "can I visit today?")
echo "USER: hi -> rent Achrafieh $3000 -> Sarah -> can I visit today?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S15: Reschedule
echo "--- S15: RESCHEDULE ---" >> "$OUT"
send "r5t-s15" "hi" > /dev/null
send "r5t-s15" "rent in Achrafieh budget 2000" > /dev/null
send "r5t-s15" "Omar" > /dev/null
send "r5t-s15" "I like the first one" > /dev/null
R=$(send "r5t-s15" "actually can we do another day?")
echo "USER: hi -> rent Achrafieh $2000 -> Omar -> like first one -> another day?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S16: Far Timeline
echo "--- S16: FAR TIMELINE ---" >> "$OUT"
send "r5t-s16" "hi" > /dev/null
R=$(send "r5t-s16" "I want to buy an apartment but not for another 6 months")
echo "USER: hi -> buy but 6 months away" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S17: Broken Link
echo "--- S17: BROKEN LINK ---" >> "$OUT"
send "r5t-s17" "hi" > /dev/null
R=$(send "r5t-s17" "I saw this listing ABC123, can you help?")
echo "USER: hi -> listing ABC123" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S18: Address Question
echo "--- S18: ADDRESS QUESTION ---" >> "$OUT"
send "r5t-s18" "hi" > /dev/null
send "r5t-s18" "rent in Achrafieh budget 2800" > /dev/null
send "r5t-s18" "Lisa" > /dev/null
R=$(send "r5t-s18" "where is this apartment exactly?")
echo "USER: hi -> rent Achrafieh $2800 -> Lisa -> where exactly?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S19: Photo Question
echo "--- S19: PHOTO QUESTION ---" >> "$OUT"
send "r5t-s19" "hi" > /dev/null
send "r5t-s19" "rent in Achrafieh budget 2500" > /dev/null
send "r5t-s19" "Rami" > /dev/null
R=$(send "r5t-s19" "can you send me photos?")
echo "USER: hi -> rent Achrafieh $2500 -> Rami -> photos?" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S20: Post-Handoff
echo "--- S20: POST-HANDOFF ---" >> "$OUT"
send "r5t-s20" "hi" > /dev/null
send "r5t-s20" "rent in Beirut budget 2000" > /dev/null
send "r5t-s20" "Dan" > /dev/null
send "r5t-s20" "not interested" > /dev/null
send "r5t-s20" "no thanks" > /dev/null
R=$(send "r5t-s20" "hello are you there?")
echo "USER: full flow -> 2 rejections -> hello after handoff" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S21: Villa
echo "--- S21: VILLA REQUEST ---" >> "$OUT"
send "r5t-s21" "hi" > /dev/null
R=$(send "r5t-s21" "I want a villa in Beit Mery, budget 500000 dollars")
echo "USER: hi -> villa Beit Mery $500k" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S22: Drip Input
echo "--- S22: DRIP INPUT ---" >> "$OUT"
send "r5t-s22" "hi" > /dev/null
R1=$(send "r5t-s22" "rent")
echo "USER: hi -> rent" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s22" "Beirut")
echo "USER: Beirut" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
R3=$(send "r5t-s22" "700 dollars")
echo "USER: $700" >> "$OUT"
echo "BOT: $R3" >> "$OUT"
R4=$(send "r5t-s22" "Sarah")
echo "USER: Sarah" >> "$OUT"
echo "BOT: $R4" >> "$OUT"
echo "" >> "$OUT"

# S23: All Info One Message
echo "--- S23: ALL INFO ONE MESSAGE ---" >> "$OUT"
send "r5t-s23" "hi" > /dev/null
R=$(send "r5t-s23" "I want to rent a 2-bedroom apartment in Achrafieh for 900 dollars, my name is Tony")
echo "USER: hi -> all info in one message" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S24: Budget Refusal
echo "--- S24: BUDGET REFUSAL ---" >> "$OUT"
send "r5t-s24" "hi" > /dev/null
send "r5t-s24" "I want to rent in Beirut" > /dev/null
R1=$(send "r5t-s24" "I prefer not to share my budget")
echo "USER: hi -> rent Beirut -> refuse budget" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s24" "I really prefer not to share")
echo "USER: refuse again" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S25: Name as Phone
echo "--- S25: NAME AS PHONE ---" >> "$OUT"
send "r5t-s25" "hi" > /dev/null
send "r5t-s25" "rent in Beirut budget 1000" > /dev/null
R=$(send "r5t-s25" "03123456")
echo "USER: hi -> rent Beirut $1000 -> 03123456 as name" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S26: Returning Lead
echo "--- S26: RETURNING LEAD ---" >> "$OUT"
send "r5t-s26" "hi" > /dev/null
R=$(send "r5t-s26" "I talked to someone before about an apartment")
echo "USER: hi -> returning lead" >> "$OUT"
echo "BOT: $R" >> "$OUT"
echo "" >> "$OUT"

# S27: Over Budget
echo "--- S27: OVER BUDGET ---" >> "$OUT"
send "r5t-s27" "hi" > /dev/null
R1=$(send "r5t-s27" "rent in Beirut 50000 per month")
echo "USER: hi -> rent Beirut $50k/mo" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s27" "Mark")
echo "USER: Mark" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S28: Multiple Types
echo "--- S28: MULTIPLE TYPES ---" >> "$OUT"
send "r5t-s28" "hi" > /dev/null
R1=$(send "r5t-s28" "I want a studio or 1-bedroom in Hamra for rent, 600 dollars")
echo "USER: hi -> studio or 1-bed Hamra $600" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s28" "Nadia")
echo "USER: Nadia" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S29: Correction
echo "--- S29: CORRECTION ---" >> "$OUT"
send "r5t-s29" "hi" > /dev/null
send "r5t-s29" "rent in Achrafieh budget 2000" > /dev/null
R1=$(send "r5t-s29" "Sami")
echo "USER: hi -> rent Achrafieh $2000 -> Sami" >> "$OUT"
echo "BOT after name: $R1" >> "$OUT"
R2=$(send "r5t-s29" "actually I meant Jounieh not Ashrafieh")
echo "USER: correction to Jounieh" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

# S30: Emoji/Special Chars
echo "--- S30: EMOJI/SPECIAL CHARS ---" >> "$OUT"
send "r5t-s30" "hi" > /dev/null
R1=$(send "r5t-s30" "I want an apartment in Beirut for rent! Budget 800 dollars")
echo "USER: hi -> apartment Beirut rent $800 (with punctuation)" >> "$OUT"
echo "BOT: $R1" >> "$OUT"
R2=$(send "r5t-s30" "Chris")
echo "USER: Chris" >> "$OUT"
echo "BOT: $R2" >> "$OUT"
echo "" >> "$OUT"

echo "=== TESTS COMPLETE ===" >> "$OUT"
echo "Tests done at $(TZ='Asia/Beirut' date)" >> "$OUT"
