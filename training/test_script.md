# Wakeeli Chatbot Test Script

**Test URL:** https://wakeeli-ai.up.railway.app/chat-test

Send each message below as the **first message** in a fresh chat session.

---

## A1 — Has a Property Link or ID

> Lead comes in with a specific listing reference.

1. `https://wakeeli.com/listing/BYT-4821`
2. `Hi I saw property ID 3847, can you tell me more about it?`
3. `https://wakeeli.com/properties/detail/9203 — is this still available?`
4. `The property code is WK-1155, I want to book a viewing`

---

## A2 — Saw a Property but Has No Link

> Lead remembers a property but can't share a reference.

1. `I saw an apartment on your Instagram, it was in Achrafieh I think, 2 bedrooms, looked modern`
2. `My friend sent me a screenshot of a place you guys have in Jal el Dib, how do I find it?`
3. `I saw an ad for a furnished apartment in Hazmieh, around 1200 a month, is that still there?`
4. `I was on your website yesterday and saw a place in Mar Mikhael but I didn't save the link`

---

## B — General Inquiry, No Specific Property

> Lead is browsing with no listing in mind.

**All info upfront:**
`Hi I'm looking to rent a furnished 2-bedroom apartment in Dbayeh or Naccache, budget around $1,500/month`

**Partial info (location only):**
`Looking for something in Achrafieh`

**Just a greeting:**
`Hi`

**Lebanese Arabizi:**
`3am dawwer 3a shee apartment ta2jer bi Jounieh, ma 3ande budget mhaddad bass bade shi nice`

**Vague:**
`I'm looking for something, not sure exactly what yet`

---

## Off-Topic

> Messages completely unrelated to real estate. Bot should handle gracefully.

1. `What's the weather like in Beirut today?`
2. `Can you help me find a good restaurant in Gemmayzeh?`
3. `bade a3ref shu l traffic 3al highway`

---

## Booking Flow Walkthrough

> Follow these steps in order in a single chat session to test the full booking experience.

**Step 1 — Start with a general inquiry:**
`Hi I'm looking for a 1-bedroom apartment to rent in Broumana, furnished, around $900/month`

**Step 2 — Bot should respond with options. Pick one and say:**
`Tell me more about the second one`

**Step 3 — Express interest:**
`I like this one, how do I book a viewing?`

**Step 4 — Provide your name when asked:**
`Maya Khoury`

**Step 5 — Provide your number when asked:**
`03 123 456`

**Step 6 — Confirm the booking:**
`Yes that works for me`

> **Expected result:** Viewing confirmed, summary sent to lead, lead data captured in backend.

---

*Last updated: March 2026*
