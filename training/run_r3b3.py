#!/usr/bin/env python3
import requests
import json
import time
import sys

API_URL = "https://wakeeli-ai.up.railway.app/api/chat/test"
OUTPUT_FILE = "/home/claw/claudeclaw/workspace/Wakeeli/training/test_round3_batch3.txt"

lines = []

def log(text):
    lines.append(text)
    print(text, flush=True)

def call_api(conv_id, message):
    payload = {"message": message, "conversation_id": conv_id}
    try:
        response = requests.post(API_URL, json=payload, timeout=30)
        return response.json()
    except Exception as e:
        return {"error": str(e)}

def get_reply(response):
    if isinstance(response, dict):
        if "messages" in response and isinstance(response["messages"], list) and len(response["messages"]) > 0:
            return "\n".join(str(m) for m in response["messages"])
        for key in ['reply', 'message', 'response', 'text', 'answer']:
            if key in response:
                return str(response[key])
        return json.dumps(response)
    return str(response)

def send_msg(conv_id, message, wait=True):
    log(f"  User: {message}")
    response = call_api(conv_id, message)
    bot_reply = get_reply(response)
    log(f"  Bot: {bot_reply}")
    if wait:
        time.sleep(3)
    return bot_reply

def start_scenario(num, name):
    log(f"\n{'='*60}")
    log(f"SCENARIO {num}: {name}")
    log(f"Conv ID: r3-b3-{num:02d}")
    log(f"{'='*60}")

def end_scenario(status, notes=""):
    log(f"\nSTATUS: {status}")
    if notes:
        log(f"NOTES: {notes}")
    log("")


# =============================================
# SCENARIO 21: SAME-DAY VISIT
# =============================================
start_scenario(21, "SAME-DAY VISIT")
cid = "r3-b3-21"
send_msg(cid, "Hi I want to rent an apartment")
send_msg(cid, "Achrafieh Beirut")
send_msg(cid, "2 bedrooms")
send_msg(cid, "1500 USD per month")
send_msg(cid, "furnished")
send_msg(cid, "My name is Alex")
r = send_msg(cid, "can I visit option 1 today?")
r_lower = r.lower()
if any(x in r_lower for x in ["agent", "reach out", "contact", "shortly", "get in touch", "representative"]):
    end_scenario("PASS", "Bot routed to agent for same-day visit request")
else:
    end_scenario("FAIL", "Bot did not route to agent for same-day visit request")


# =============================================
# SCENARIO 22: RESCHEDULE
# =============================================
start_scenario(22, "RESCHEDULE")
cid = "r3-b3-22"
send_msg(cid, "Hi I want to rent an apartment in Achrafieh Beirut")
send_msg(cid, "2 bedrooms")
send_msg(cid, "1800 USD per month")
send_msg(cid, "furnished")
send_msg(cid, "My name is Mark")
send_msg(cid, "I'd like to book a visit for option 1")
r = send_msg(cid, "can we reschedule to next week?")
r_lower = r.lower()
if any(x in r_lower for x in ["agent", "reach out", "contact", "shortly", "get in touch", "representative"]):
    end_scenario("PASS", "Bot routed to agent for reschedule request")
else:
    end_scenario("FAIL", "Bot did not route to agent for reschedule request")


# =============================================
# SCENARIO 23: FAR TIMELINE
# =============================================
start_scenario(23, "FAR TIMELINE")
cid = "r3-b3-23"
send_msg(cid, "Hi I want to rent an apartment in Achrafieh Beirut")
send_msg(cid, "2 bedrooms")
send_msg(cid, "1500 USD per month")
send_msg(cid, "furnished")
send_msg(cid, "My name is Sara")
r = send_msg(cid, "honestly just browsing not looking anytime soon")
r_lower = r.lower()
if any(x in r_lower for x in ["agent", "reach out", "contact", "shortly", "get in touch", "representative"]):
    end_scenario("PASS", "Bot routed to agent after far-timeline signal")
else:
    end_scenario("FAIL", "Bot did not route to agent after far-timeline signal")


# =============================================
# SCENARIO 24: POST-HANDOFF
# =============================================
start_scenario(24, "POST-HANDOFF")
cid = "r3-b3-24"
r1 = send_msg(cid, "are you a bot?")
r2 = send_msg(cid, "actually I found something else")
r1_lower = r1.lower()
r2_lower = r2.lower()
handoff_triggered = any(x in r1_lower for x in ["agent", "reach out", "shortly", "get in touch", "representative"])
no_restart = not any(x in r2_lower for x in ["welcome", "hello! how", "hi! how", "how can i help you today"])
agent_msg_maintained = any(x in r2_lower for x in ["agent", "reach out", "shortly", "get in touch"])

if handoff_triggered and no_restart and agent_msg_maintained:
    end_scenario("PASS", "Handoff triggered and subsequent message did not restart the flow")
elif handoff_triggered and no_restart:
    end_scenario("PARTIAL", "Handoff triggered and flow not restarted, but agent message not explicitly maintained in follow-up")
elif not handoff_triggered:
    end_scenario("FAIL", "Initial handoff was not triggered by 'are you a bot?'")
else:
    end_scenario("FAIL", "Flow restarted after handoff - bot did not maintain agent handoff state")


# =============================================
# SCENARIO 25: VILLA REQUEST
# =============================================
start_scenario(25, "VILLA REQUEST")
cid = "r3-b3-25"
r = send_msg(cid, "Hi I want to rent a villa in Rabieh")
r_lower = r.lower()
no_villa = any(x in r_lower for x in ["villa", "not available", "don't have", "don't offer", "cannot", "can't", "only", "apartments", "houses"])
offers_alt = any(x in r_lower for x in ["house", "apartment", "agent", "reach out", "help", "offer"])
if no_villa and offers_alt:
    end_scenario("PASS", "Bot acknowledged no villas and offered alternative (houses or agent)")
elif no_villa:
    end_scenario("PARTIAL", "Bot acknowledged no villas but did not clearly offer an alternative")
else:
    end_scenario("FAIL", "Bot did not flag that villas are unavailable")


# =============================================
# SCENARIO 26: SMALL 4 BED
# =============================================
start_scenario(26, "SMALL 4 BED")
cid = "r3-b3-26"
r = send_msg(cid, "Hi my name is Sami looking to rent a small 4 bedroom in Beirut budget 2000 to 3000 furnished")
r_lower = r.lower()
contradiction_flagged = any(x in r_lower for x in ["unusual", "small 4", "typically", "note", "uncommon", "large", "bigger"])
shows_results = any(x in r_lower for x in ["option", "bedroom", "sqm", "usd", "listing", "property", "found", "available"])
agent_routed = any(x in r_lower for x in ["agent", "reach out", "shortly"])

if shows_results and not contradiction_flagged:
    end_scenario("PASS", "Bot showed listings without flagging contradiction on small 4-bed request")
elif contradiction_flagged and shows_results:
    end_scenario("PARTIAL", "Bot flagged small-4-bed as unusual but still showed results")
elif agent_routed:
    end_scenario("PARTIAL", "Bot routed to agent rather than showing listings directly")
else:
    end_scenario("FAIL", "Bot neither showed results nor routed appropriately")


# =============================================
# SCENARIO 27: PARTIAL DRIP
# =============================================
start_scenario(27, "PARTIAL DRIP")
cid = "r3-b3-27"
responses = []
for msg in ["hi", "rent", "Beirut", "Achrafieh", "2 beds", "1500", "furnished", "My name is Nour"]:
    r = send_msg(cid, msg)
    responses.append(r.lower())

# Check that bot didn't hand off early (before name was given)
premature_handoff = any(
    any(x in responses[i] for x in ["agent", "reach out", "shortly"])
    for i in range(6)  # before name step
)
final_shows_listings = any(x in responses[-1] for x in ["option", "bedroom", "sqm", "usd", "listing", "property", "found", "available"])
final_agent = any(x in responses[-1] for x in ["agent", "reach out", "shortly"])

if not premature_handoff and (final_shows_listings or final_agent):
    end_scenario("PASS", "Bot asked step by step, no premature handoff, listings shown at end")
elif premature_handoff:
    end_scenario("FAIL", f"Premature handoff detected before flow was complete")
else:
    end_scenario("PARTIAL", "No premature handoff but final state unclear - check transcript")


# =============================================
# SCENARIO 28: MIXED LANGUAGE
# =============================================
start_scenario(28, "MIXED LANGUAGE")
cid = "r3-b3-28"
r = send_msg(cid, "Hi ana baddi apartment bi Jounieh 2 beds furnished max 1500 esme Ahmad")
r_lower = r.lower()
natural_response = len(r) > 20 and not any(x in r_lower for x in ["error", "cannot understand", "please write in english"])
shows_content = any(x in r_lower for x in ["option", "bedroom", "sqm", "usd", "listing", "property", "found", "jounieh", "ahmad", "agent", "reach out"])
if natural_response and shows_content:
    end_scenario("PASS", "Bot responded naturally to mixed Arabic-English input and processed info")
elif natural_response:
    end_scenario("PARTIAL", "Bot responded without error but unclear if info was parsed correctly")
else:
    end_scenario("FAIL", "Bot could not handle mixed language input")


# =============================================
# SCENARIO 29: RETURNING LEAD
# =============================================
start_scenario(29, "RETURNING LEAD")
cid = "r3-b3-29"
send_msg(cid, "Hi I'm looking to rent an apartment")
send_msg(cid, "Beirut 2 bedrooms")
send_msg(cid, "1200 furnished")
r = send_msg(cid, "hi")
r_lower = r.lower()
no_welcome_back = not any(x in r_lower for x in ["welcome back", "good to see you again", "back again"])
# also should not fully restart the flow
no_restart = not any(x in r_lower for x in ["how can i help you today", "hello! how"])
if no_welcome_back and no_restart:
    end_scenario("PASS", "Bot did not say 'welcome back' and maintained conversation context")
elif no_welcome_back:
    end_scenario("PARTIAL", "No 'welcome back' but conversation context may have reset")
else:
    end_scenario("FAIL", "Bot said 'welcome back' on same conversation_id")


# =============================================
# SCENARIO 30: MULTIPLE INTEREST
# =============================================
start_scenario(30, "MULTIPLE INTEREST")
cid = "r3-b3-30"
send_msg(cid, "Hi I want to rent an apartment in Achrafieh Beirut")
send_msg(cid, "2 bedrooms")
send_msg(cid, "1500 USD per month")
send_msg(cid, "furnished")
send_msg(cid, "My name is Rania")
r = send_msg(cid, "I like option 1 and 3")
r_lower = r.lower()
handles_multiple = any(x in r_lower for x in ["option 1", "option 3", "both", "two", "either", "agent", "reach out", "shortly", "property"])
if handles_multiple:
    end_scenario("PASS", "Bot handled multiple property interest without confusion")
else:
    end_scenario("FAIL", "Bot did not handle multiple property interest appropriately")


# =============================================
# WRITE OUTPUT FILE
# =============================================
with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
    f.write("WAKEELI CHATBOT TEST - ROUND 3 BATCH 3\n")
    f.write(f"Scenarios: 21-30\n")
    f.write("=" * 60 + "\n\n")
    for line in lines:
        f.write(line + "\n")

print(f"\nDone. Results saved to {OUTPUT_FILE}")
