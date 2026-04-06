# WAKEELI LAUNCH BATTLE PLAN
## $0 to $30K MRR in 16 Weeks

**Prepared:** April 2026
**Owner:** Fox
**Status:** Execute immediately

---

## THE NUMBER

**47 agencies. $31,369 base MRR. $33,000+ with add-ons.**

Beirut metro has 300-500 active real estate agencies. You need 47. That is less than 16% of the market. This is not an ambitious target. This is a conservative one. The only variable is sales execution.

---

## PART 1: THE OFFER

### Revised Pricing Architecture

Stop leading with features. Lead with outcomes. The offer is: **never lose a deal to a slow response again.**

| Plan | Monthly Price | Who It's For | Key Limit |
|------|--------------|--------------|-----------|
| Starter | $299/mo | 1-2 agent shops | 3 agents max |
| Growth | $597/mo | 3-6 agent agencies | 6 agents, priority support |
| Scale | $997/mo | 7+ agents, top-tier | Unlimited agents, dedicated attention |

**One-time Setup Fee: $497** (all paid plans)

Why the setup fee is non-negotiable:
- Immediate cash flow before Month 1 subscription
- Signals seriousness (agencies that balk at $497 are not good clients)
- Funds Fox's white-glove onboarding time
- Anchors perceived value of the product

**Exception:** First 5 pilot agencies get the setup fee waived. You need proof more than you need the $497 right now.

### What's Included

Every plan includes all of the following. These are the product, not extras:

- Done-for-you WhatsApp setup and full configuration
- AI trained on the agency's listing database
- 30-day lead performance audit with weekly check-ins
- Lebanese Real Estate Lead Conversion Playbook (PDF, delivered at onboarding)
- Responses in Arabic, English, or French, automatically
- 24/7 coverage with no human staffing required
- Full conversation dashboard with live monitoring and manual takeover at any point

None of these are optional. Without them the product does not work. They are included in every paid plan, every tier, from day one.

### The Guarantee

"Wakeeli's AI responds to every single inbound lead in under 60 seconds, 24/7, in Arabic, English, or French. If it ever fails to do so, that month is free."

Why this guarantee works:
- It is fully within Wakeeli's control. Response time is automated and logged. There are no external dependencies.
- It is measurable. Every conversation has a timestamp. If the SLA is missed, the data shows it with no ambiguity.
- It speaks directly to the pain point every agency owner already knows: slow response equals a lost deal. The guarantee names that exact problem and puts money behind fixing it.
- It does not depend on variables outside Wakeeli's control, such as the agency's listings, their agents' follow-through, or market conditions.

This is a guarantee you can stand behind because you control the outcome entirely.

### The Scarcity Frame

"This product is new to the Lebanese market. Every agency owner knows what happens when a competitor responds to a lead before you do. The question is not whether AI will handle real estate leads in Lebanon. It is whether you will be the agency using it, or the agency losing deals to the one that does. Early adopters lock in founding pricing before rates increase."

This is competitive pressure scarcity. It is real, not manufactured. Lebanese agency owners are acutely aware of their local competition. The framing does not require any artificial cohort limits. It uses the truth: the market is moving, and first movers win.

---

## PART 2: WEEK-BY-WEEK BATTLE PLAN

### PRE-LAUNCH: Days 1 through Week 3
**Goal: Tech complete in 72 hours, first meetings held by end of Week 1, first pilots committed by end of Week 3**

---

**DAYS 1-3: Tech Complete**

Lexy handles all technical execution. The full tech stack is done in the first 72 hours. There is no multi-week sprint and no developer hire.

**Day 1 (4-5 hours of execution):**
- Multi-tenancy: companies table, company_id FK on all relevant tables (conversations, listings, agents, users, token_usage), JWT carries company_id, every API endpoint filters by company_id. 3 hours. Done.
- Submit Meta Business Verification application today. This starts the external clock. Meta approval takes 1-2 weeks: that is outside Fox's control. The technical setup on Wakeeli's side takes 1-2 hours.
- Sign up with 360dialog (360dialog.com) as backup WhatsApp provider. Meta-approved, active in MENA, faster provisioning than going direct.
- Set up manual invoicing (Wave or Zoho). 1 hour.
- WhatsApp all 7 target agency owners personally today. Do not wait for tech to be done. (See Appendix for priority list.)

**Day 2 (4-5 hours of execution):**
- Stripe billing: subscription plans, payment status connected to company activation and suspension. 1-2 hours.
- Remove hardcoded credentials (Admin/Admin123). Replace with DB-only auth. 1-2 hours.
- Backend role enforcement on all protected endpoints. 1-2 hours.
- Session state persistence: DB-backed conversation context instead of in-memory. 1-2 hours.
- Mobile responsiveness for the dashboard. Lebanese agents check everything on their phones. 1-2 hours.
- Begin building the Dream 100 prospect list. Sources: Property Finder Lebanon (sort by listings volume), Instagram agency pages (WhatsApp links in bios), LinkedIn search for "real estate director Lebanon", R.E.A.L (Real Estate Syndicate of Lebanon) member directory, Google Maps listings of agencies with phone numbers.

**Day 3 (4-5 hours of execution):**
- Sentry error tracking deployed. 30 minutes.
- UptimeRobot or Betterstack monitoring live. 30 minutes.
- Staging environment on Railway separate from production. 1 hour.
- Custom domain live with SSL. 1 hour.
- Rate limiting on the WhatsApp webhook and API endpoints. 1 hour.
- Database backup policy: verify Railway PostgreSQL retention, test a restore. 1 hour.
- CSV listing bulk import: agencies will not add 100 listings one by one. 1-2 hours.
- Data export for clients (CSV). 1 hour.
- Company onboarding admin panel: Fox can provision new clients without touching the DB. 1-2 hours.
- Terms of Service and Privacy Policy: draft both. Submit to Lebanese lawyer for review ($200-400). Required by Meta. Required by Lebanese law. Required before any client signs.
- Client service agreement template: one page. Done.
- Create the one-pager PDF: "The Wakeeli Conversion Engine." One page. Headline: "Your 24/7 AI sales rep that responds in under 60 seconds, qualifies every lead, and books tours while your agents sleep." Include pricing, the Forbes stat, and the guarantee. This is the leave-behind for every meeting.

Tech is done. Every blocker from launch-readiness.md is cleared. Everything from here is sales.

---

**WEEK 1 (Days 4-7): Prospect List and Active Outreach**

Sales:
- Dream 100 list: reach 50+ agencies identified with owner contact info by end of the week.
- Direct outreach: 20 messages per day from Day 4 forward. WhatsApp is the primary channel. LinkedIn for owners where WhatsApp is not accessible.
  - **WhatsApp opener (cold):** "Hey [Name], quick question. What percentage of your WhatsApp leads come in after 9 PM? I've been collecting data from Lebanese agencies and the numbers are surprising. Happy to share if you're curious."
  - **WhatsApp opener (targeted):** "Hey [Name], I'm Fox. I built an AI system specifically for Lebanese real estate agencies. Responds to every WhatsApp lead in under 60 seconds, qualifies them, books tours automatically. A few Beirut agencies are already in the pilot. 20 minutes to show you? When are you free?"
  - **LinkedIn DM:** "Hey [Name], noticed your work at [Agency Name]. I built Wakeeli specifically for Lebanese agencies to handle WhatsApp leads 24/7. AI responds in under 60 seconds, qualifies leads, books tours. Would love to show you what it does for an agency your size. 20 minutes?"
- Walk-in visits: identify 5 agencies in Ashrafieh, Verdun, or Hamra this week. Walk in, ask for the owner, hand them the one-pager. A physical visit from a real founder closes more than 10 DMs.
- Create the Wakeeli Instagram and LinkedIn pages. Post 3 pieces of content this week: the Forbes stat, the response time problem, what the product delivers. Professional, no features, outcomes only. This page exists so agencies can check you out after a WhatsApp message. Nothing more.
- Track every outreach contact in a Google Sheet: name, agency, channel, date, response, outcome. Simple.

---

**WEEK 2: First Meetings**

Sales:
- First 4-6 meetings scheduled and held. Prioritize in-person for Beirut agencies. Fox goes personally.
- 2-3 agencies verbally commit to a free pilot. Lock the relationship. Nothing to sign yet.
- Demo environment ready. Use a prepared screen recording or sandboxed setup if Meta approval is still pending. Never show a live system that does not have full data isolation.
- Continue 20 outreach messages per day. Add Week 1 follow-ups to the queue.
- Walk-in visits: Gemmayzeh, Achrafieh, Downtown this week.

---

**WEEK 3: Pilots Live**

Sales:
- First 2-3 pilot agencies sign the one-page pilot agreement.
- Onboard Pilot 1: connect WhatsApp (360dialog if Meta approval still pending), train AI on their listings, configure conversation flows. Fox personally. Budget 2-3 hours per client.
- Pipeline: 20+ agencies in active conversation by end of Week 3.
- Continue 20 outreach messages per day.
- Begin 10 LinkedIn connection requests per day to agency owners and directors. Personalized note with each request.

Tech (minor, everything critical was done Days 1-3):
- Email notifications for agents: new lead assigned, tour booked. Agents should not need to check a dashboard they are not in the habit of using. 1-2 hours.
- Tour reminder automation: scheduled WhatsApp messages 24 hours before a tour and day-of. 2-3 hours with APScheduler.
- Deploy Sentry for error tracking if not already live (should be done Day 3).

---

### MONTH 1: Weeks 4-7
**Goal: 10 paying clients, $5,970 base MRR**

---

**WEEK 4: First Conversions**

Sales:
- Convert first 2-3 pilot agencies to paid. Frame it: "The pilot period is ending. Here is what ongoing looks like."
  - Pilot Agency 1 conversation: "You have had the system running for 2 weeks. Walk me through what you noticed. [Let them talk.] Based on what you just said, what is that worth monthly to your agency? [Let them do the math.] That is what Wakeeli is protecting. It costs $597 a month. Want to keep it running?"
- Setup fees collected: 3 x $497 = $1,491 cash on the day they convert.
- Begin formal onboarding for paid clients. Create an onboarding checklist. Use it for every client from here on.
- Run 8-10 demo meetings this week from the DM outreach pipeline built in Weeks 1-3.

---

**WEEK 5: Momentum**

Sales:
- Fox doing 10-12 sales conversations this week. Mix of meetings, WhatsApp conversations, calls.
- 6-7 paying clients locked in by end of week.
- After 5 happy clients: activate the referral engine. WhatsApp each existing client personally: "Hey [Name], things are going well with [their agency name]. Who else do you know in the industry who has the same challenge with WhatsApp leads? Even a warm intro would mean a lot."
- In Lebanon, one peer referral is worth 100 cold DMs. Start this immediately once you have 5 clients with results to point to.

---

**WEEK 6: Scale the Process**

Sales:
- 9-10 paying clients.
- Document the sales process: after every meeting, write 3 bullet points. What indicated pain. What objection came up. What closed them. This becomes the playbook for the sales assistant you hire in Month 2.
- First Jordan outreach: 5 WhatsApp messages to Jordanian agencies. One message each, move on. Do not invest time here. Just test.
- Announce the referral program to all clients: "Refer an agency that signs up and get 2 months free."

---

**WEEK 7: Month 1 Close**

Sales:
- 10 paying clients. Month 1 target hit.
- Review everything: which outreach channel converted at the highest rate, which objection came up most, which closing approach worked best.
- Offer the AI Refresh add-on ($99/month) to the first wave of clients: "Each month I personally review your conversation logs, retrain the AI based on what is working, and update your listing data. Your AI gets smarter every month. $99 to keep it optimizing."
- Pull the first case study numbers: anonymized agency, real data. Leads handled, tours booked, estimated revenue protected. Even 14 days of data is powerful if the numbers are real.

---

### MONTH 2: Weeks 8-11
**Goal: 20 paying clients, $11,940 base MRR**

---

**WEEK 8: Referral Engine**

Sales:
- Every existing client gets a personal WhatsApp from Fox: "Hey [Name], I wanted to check in. How are things going since we launched? [Listen.] Glad to hear it. Quick question: which agency owner do you most respect in Beirut? Would you be willing to make an intro?"
- In Lebanon, this conversation is natural. Agency owners know each other. One respected owner telling another "I'm using this, you should try it" is the most powerful sales tool available.
- First referred clients signed this week. Referral mechanics: referring agency gets 2 months free, referred agency gets first month free.

---

**WEEK 9: Enterprise Push**

Sales:
- Identify the 5 largest agencies in the current pipeline. Push them toward the Scale plan ($997/month). These conversations are worth an extra $400/month per client. If 5 close on Scale instead of Growth, that is $2,000/month additional MRR.
- Scale plan pitch addition: "With Scale, you also get a dedicated account manager (Fox, personally, for the first year). Any issue, any optimization request, any question. You get me directly. Not a ticket system. Me."
- 15 paying clients by end of week.
- Case study published: first full named (or anonymized) case study with specific numbers. Blog post, Instagram carousel, LinkedIn article. Real is better than anonymized. If the agency is proud of their results, most will let you use their name.

If you now have 10+ clients and at least one documented case study: launch the first paid ad test. Budget $300/month. Case study creative only. No stat ads yet. Let proof do the selling.

---

**WEEK 10-11: Consolidation**

Sales:
- 20 paying clients. Month 2 target hit.
- Monthly performance review: blended MRR per client, current monthly churn (should be 0), which acquisition channel is producing the best clients, average time from first contact to close.
- Hire 1 commission-based sales assistant in Beirut. Junior, hungry, connected. Their job: cold outreach, DMs, meeting booking. Fox closes every deal. Pay: $300/month base + $150 per client signed. Costs nothing if they do not perform.
- WhatsApp broadcast to outreach list (everyone who expressed interest but did not book a demo): personalized follow-up with the case study numbers attached.

---

### MONTH 3: Weeks 12-15
**Goal: 33 paying clients, $19,701 base MRR**

---

**WEEK 12-13: Case Study Offensive**

Sales:
- Three full named case studies published: blog post, Instagram carousel, LinkedIn article. Named agencies with permission, or detailed anonymized with specific numbers.
- Request video testimonials from the 3 happiest clients via WhatsApp voice message: "Hey [Name], would you record a 30-second WhatsApp video saying what changed since you started using Wakeeli? Raw and honest. Nothing produced. Just you talking. It would mean a lot."
  - Raw WhatsApp videos from Lebanese business owners convert better than any polished ad.
- These case studies become the primary sales collateral for the next 3 months. Every new prospect gets them before the demo.

Tech:
- Platform health dashboard for Fox: cross-company metrics. Total leads handled across all agencies, total tours booked, conversion rates, top performing agencies, token cost tracking. 3-4 hours. You need this visibility to manage scale.
- Self-service onboarding wizard: start building. Not urgent until 50 clients, but that day is coming.

Marketing:
- Property Finder Lebanon outreach. Contact their commercial team. Position Wakeeli as a lead-conversion add-on that makes their listing service more valuable. Pitch: "Your agencies pay you to generate leads. We help them convert those leads. Let's co-market." Even one newsletter mention from Property Finder reaches hundreds of agencies.
- Identify 3-5 Lebanese digital marketing agencies that serve real estate clients. Referral deal: they recommend Wakeeli, they get $297 per agency that signs.
- Instagram: first video reel. 60-90 seconds. Screen recording of a real Wakeeli conversation in Lebanese Arabic (8-11 PM timestamp visible), AI responding in seconds, lead booking a tour. Caption: "This is what your agency looks like at 2 AM without Wakeeli." Post between 7-9 PM. This post has viral potential in the Lebanese real estate community.
- Paid ads: scale to $700-1,000/month with case study creative. Three creatives: stat ad, demo video, case study.

---

**WEEK 14: Annual Plan Push**

Sales:
- WhatsApp and email blast to all existing clients: "Lock in your current price forever. Pay for 10 months, get 12. Zero risk. And you never face a price increase on your plan."
- Target: 20% of existing 33 clients convert to annual. That is roughly 7 clients.
- 7 clients x $597 x 10 months = $41,790 cash collected in one week.
- This cash injection funds Month 4 ad spend, the sales assistant salary, and any additional technical work.

---

**WEEK 15: Partnership Revenue**

Sales:
- First referred client from Property Finder or digital agency partnership.
- Jordan: upgrade from testing to active outreach. 20 WhatsApp messages to Jordanian agency owners. Use Lebanese case studies as social proof: "Lebanese agencies are getting X results with Wakeeli. Jordan has the same WhatsApp lead challenge. Want to see how it works?"
- 33 paying clients by end of Week 15. Month 3 target hit.
- Hire first full-time employee: Customer Success. Monthly performance reports, client health monitoring, renewal conversations, escalating at-risk accounts to Fox. $800-1,200/month in Beirut. Frees Fox 8-10 hours per week.

Marketing:
- Paid ads: $2,000/month. Four creatives: stat ad, demo video, case study video (from Week 12 testimonials), annual plan offer.
- LinkedIn article: "Why I Turned Down a $300K Investment Offer (And What We're Doing Instead)." Founder story content. Builds personal brand, drives inbound inquiries, positions Fox as a thought leader.

---

### MONTH 4: Weeks 16+
**Goal: 47 paying clients, $30K+ MRR**

---

**WEEK 16: The Close**

Sales:
- All acquisition channels running simultaneously: warm outreach, cold outreach, paid ads, referrals.
- Fox doing 10+ sales conversations per week. The sales assistant fills the calendar. Fox closes every deal.
- Enterprise deal push: identify 3-5 agencies that have been on Growth for 2+ months and are near their agent limits. Upsell conversation: "You mentioned wanting to add two more agents. Scale gives you unlimited plus everything else stays the same. It is $400 more per month. Given what Wakeeli is doing for you, that is easy math."

**End of Week 16 target breakdown:**

| Plan | Price | Clients | MRR |
|------|-------|---------|-----|
| Starter | $299/mo | 5 | $1,495 |
| Growth | $597/mo | 30 | $17,910 |
| Scale | $997/mo | 12 | $11,964 |
| **Base MRR** | | **47** | **$31,369** |
| AI Refresh add-on | $99/mo | 20 | $1,980 |
| Expansion seats | $79/seat | 5 seats | $395 |
| **TOTAL MRR** | | | **$33,744** |

**$33,744 MRR by Week 16. Target exceeded.**

---

## PART 3: SALES PROCESS

### The CLOSER Script (Adapted for Lebanese Agency Owners)

Lebanese business culture rules:
- They respect directness and confidence
- They hate being sold to but love buying
- They do not buy from websites, they buy from people they trust
- Reference their pride in their agency, their market position, their team
- Never talk down to them or treat them as unsophisticated

For the first 10 agencies: Fox goes in person. No exceptions. Bring a laptop or phone. Do a live demo. Let them text the AI themselves.

---

**C: Clarify (Why Are They There)**

"Before I show you anything, I want to understand your operation. Walk me through how you handle a new WhatsApp lead right now. From the moment it comes in at, let's say, 10 PM on a Thursday. What happens?"

Let them talk. Most will describe a chaotic process: someone sees it when they get to it, agents respond when they are free, nights and weekends are dead zones.

Listen for their exact words. You will use them back.

---

**L: Label (The Pain)**

"So if I heard you right, the main issue is that your agents can't respond fast enough, especially at night and on weekends, and you're probably losing leads to competitors who got there first."

Pause. Let them confirm.

"How many deals do you think that has cost you this year? Even a rough guess."

Watch them do the math. Most have never been asked to quantify this. This is when the emotional sale begins.

If they struggle to estimate: "Most agencies in Beirut get somewhere between 40-80 WhatsApp inquiries per month. If even 20% of those come in after hours and go cold by morning, and your average commission is, say, $3,500, you are looking at roughly $2,800 to $5,600 per month in missed revenue. Every single month. That is $33,000 to $67,000 per year."

---

**O: Overview (Past Pain, Future Pace)**

"Think about last week specifically. How many leads came in on WhatsApp? How many did someone respond to within 5 minutes? How many waited until the next morning?"

Then: "There is a Forbes study that found 35 to 50 percent of sales go to the first responder. In real estate, where you are competing with 10 other agencies for the same buyer, being second by 6 hours is the same as not responding at all."

Additional stat if they need more: "78% of buyers choose the first agent who responds. Not the best agent. The first one."

---

**S: Sell the Vacation (Future Pace the Win)**

"Here is what I want you to picture. It is 11 PM on a Friday. A lead messages your WhatsApp: 'I am looking for a 3-bedroom in Achrafieh, budget $450K.' Normally, that lead waits until Saturday morning. Maybe they already booked a tour with another agency by then.

With Wakeeli, within 60 seconds, not minutes, seconds, they get a response. In Arabic if that is what they wrote in. The AI asks the right qualification questions. It checks your listings, finds the three best matches, and offers to book a tour for Saturday at 10 AM or 2 PM, whichever works.

The lead picks a time. Saturday morning, your agent wakes up to a confirmed, pre-qualified tour already in their calendar. The lead knows the property, the price range, and why it matches their criteria.

Your agent did nothing. They just show up and close."

---

**E: Explain Away Concerns**

Three objections you will hear from every Lebanese agency owner. Handle them this way:

**Objection 1: "My clients want to talk to a real person."**
"They want a fast, knowledgeable response. At 11 PM, the AI is the only option available. And the AI knows exactly when to hand off. The moment a lead says 'I want to speak with someone directly,' it flags it immediately for your agent with the full conversation context. Your agents are not replaced. They are freed up for the moments that actually require a human. The tour. The negotiation. The close."

**Objection 2: "What if it says something wrong about a property?"**
"Every response is trained specifically on your listings and your agency's policies. The AI does not improvise on price, availability, or property details. It works from your actual listing data. And every conversation is visible in the dashboard, live, right now. If you ever want to jump in manually and take over a conversation, you can. One click."

**Objection 3: "We tried something like this before and it did not work."**
"What did you try?" (Let them describe it.)
"That is different from what we are doing in one key way: [address the specific difference, usually it was a generic chatbot, not WhatsApp-native, or not trained on real estate qualification flows].
Also, this is why we do the 30-day pilot. You do not have to take my word for it. You watch it work on your actual leads, your actual WhatsApp number, for 30 days. If it does not outperform what you are doing now, I shut it down and we shake hands."

**Objection 4: "$600 per month is expensive."**
"One commission from a deal that Wakeeli books covers 12 months of the subscription. Your average commission is [X]. If Wakeeli saves you even one deal in the first year, it has paid for itself many times over. And our guarantee is simple: Wakeeli responds to every inbound lead in under 60 seconds, 24/7. If it ever fails to do that, that month is free. You have zero risk on the response side."

**Objection 5: "We are not ready right now."**
"What would need to happen for you to be ready? [Let them answer.] What I can tell you is that every month you wait, the leads coming in after 9 PM are going somewhere. To a competitor who is responding faster. The system takes 3 days to set up. There is no upfront cost for the pilot. The only thing you risk is 30 days of having an AI work for you for free."

---

**R: Reinforce the Decision**

"Here is what I propose. We do 30 days together. I set everything up personally. Your WhatsApp connection. The AI trained on your listings. The conversation flows. You do not touch a thing technical. At the end of 30 days, I bring you a one-page report: how many leads came in, how many were qualified, how many tours were booked.

If those numbers are better than last month without Wakeeli, we talk about making it permanent. If they are not, I shut it down, we shake hands, and you have lost nothing except 30 days of having an AI qualify your leads for free.

There is no risk on your side. The only risk is mine. And I am confident enough in this product to take it."

Stop talking. The next person who speaks loses.

---

### The Demo Flow (20 Minutes)

1. Set up: "I am going to show you something live. Pick up your phone and text this number." [Hand them your demo WhatsApp number.]

2. Let them type a realistic inquiry. Something like: "I'm looking for a 3-bedroom apartment in Ashrafieh, budget $300K, moving in 3 months."

3. They watch Wakeeli respond in seconds. In Arabic if they wrote in Arabic. Watch their face.

4. Show the dashboard: open the laptop. Show the lead being captured in real time. Show the qualification data being populated automatically.

5. Show the booking: "If you had listings that matched, the AI would have offered 3 properties and asked which day works for a tour. The tour gets booked without your agent lifting a finger."

6. Show the stat wall: pull up the Forbes stat. "35 to 50 percent of real estate deals go to the first responder. You just responded to that lead in under 60 seconds. Your competitor is still asleep."

7. Close with the pain reframe: "How many leads came into your agency last night after 9 PM?"

---

### The 30-Day Pilot Follow-Up Sequence

**Day 7:** WhatsApp message to the agency owner. "Hey [Name], quick update. Wakeeli has handled [X] conversations this week and booked [Y] tours. Everything is running smoothly. Any feedback from your agents on the leads they are receiving?"

**Day 14:** Second check-in. "Two weeks in. [X] conversations handled, [Y] tours booked. One note: I noticed leads coming in between 9 PM and midnight are the most active segment for your agency. Want me to optimize the responses for that window?"

**Day 30:** In-person meeting (if possible) or video call. Bring the one-page results report. Show the numbers. Then: "Last month you booked [Y] tours without your team lifting a finger for lead qualification. Two of those are likely going to deals, which is roughly $X in commission. For $597 a month, that is [Y] x ROI. Want to keep this running?"

At this point, the agency is already dependent. The AI is already running. Saying no means turning it off and going back to manual response. Conversion rate from pilot to paid should be 60-70%.

---

## PART 4: DIRECT SALES STRATEGY

### The Model

This is not a digital marketing play. This is a direct sales play. You are selling to 300-500 agencies in one city. You do not need funnels, paid ads, or content engines to reach them. You need conversations.

The market is small enough to touch directly. The right move is to find every agency owner's contact and reach out personally. Do that at volume with precision, and you will hit 47 clients without running a single ad.

### The Funnel

```
FIND OWNER CONTACT
(Property Finder, Instagram bios, LinkedIn, R.E.A.L directory, Google Maps, walk-ins)
     |
     v
SEND PERSONALIZED OUTREACH
(WhatsApp message or LinkedIn DM with a specific hook about their agency)
     |
     v
BOOK THE DEMO
(20-minute live demo, in person for the first 10 agencies minimum)
     |
     v
CLOSE ON THE CALL
(Or follow up within 48 hours. Never let a warm lead go cold.)
     |
     v
PAID CLIENT
```

That is the whole system. Execute it with volume and consistency.

### Finding Owner Contacts

Primary sources, in order of reliability:

1. **Property Finder Lebanon:** Sort by number of listings. Top 100 agencies appear immediately. Owner contact is often on their listing pages or linked to their Instagram bio.
2. **Instagram:** Search "real estate Lebanon" and "عقارات لبنان". Most professional agencies have an active Instagram with a WhatsApp link in the bio. That is a direct line to the owner or lead agent.
3. **LinkedIn:** Search "real estate director Beirut", "property consultant Lebanon", "agency owner real estate Lebanon". Many owners list contact info on their profiles.
4. **R.E.A.L (Real Estate Syndicate of Lebanon):** The professional member directory. Curated, verified agency listings. High quality leads.
5. **Google Maps:** Search "real estate agency Beirut" filtered by neighborhood. Click each listing. Phone number is almost always there.
6. **Walk-ins:** Walk into agencies in Ashrafieh, Verdun, Hamra, Downtown, Gemmayzeh. Ask for the owner. Hand them the one-pager. This closes more than any DM because it shows you are a real person with a real product.

### Outreach Scripts

**Cold WhatsApp (no prior connection):**
"Hey [Name], quick question. What percentage of your WhatsApp leads come in after 9 PM? I've been collecting data from Lebanese agencies and the numbers are surprising. Happy to share if you're curious."

**Targeted WhatsApp (you know their agency):**
"Hey [Name], I'm Fox. I built an AI system specifically for Lebanese real estate agencies. Responds to every WhatsApp lead in under 60 seconds, qualifies them, books tours automatically. A few Beirut agencies are already in the pilot. 20 minutes to show you? When are you free this week?"

**LinkedIn DM:**
"Hey [Name], noticed your work at [Agency Name]. I built Wakeeli specifically for Lebanese agencies to handle WhatsApp leads 24/7. AI responds in under 60 seconds, qualifies leads, books tours. Would love to show you what it does for an agency your size. 20 minutes?"

**After a walk-in:**
"Hey [Name], great meeting you today. Here is the one-pager I mentioned. [PDF]. Happy to set up a live demo this week if you want to see it in action. When works?"

### Daily Outreach Volume

From Day 4 onward: 20 outreach messages per day. Track in a Google Sheet: name, agency, channel, date, response, outcome. Simple. No CRM needed until Month 3.

Split roughly: 10 WhatsApp messages, 5 LinkedIn DMs, 5 follow-ups on previous contacts.

### Instagram: Credibility Only

Instagram is not a lead generation channel. It is a credibility asset.

When an agency owner receives your WhatsApp message, they will check your Instagram before responding. That page needs to look legitimate: professional, real, outcomes-focused. Three to five posts covering the stats, the problem, and the product. Nothing more.

Do not build a content strategy around Instagram. Do not post daily. Do not run giveaways or story campaigns. Post enough to look credible when someone checks, then focus entirely on direct outreach.

### Paid Ads: After 10 Paying Clients

Do not run paid ads until you have at least 10 paying clients and at least one documented case study with specific numbers.

In a trust-based market like Lebanon, ads without proof waste money and time. Cost per acquisition is high, close rates are low, and every hour spent on ad creative is an hour not spent on direct outreach which converts far better.

After 10 clients with real, documented results: ads become amplifiers, not generators. You run case study ads. Proof converts. Before that, do not bother.

### The Referral Engine: After 5 Happy Clients

After the first 5 clients have 30+ days of results, referrals become the primary growth channel.

Lebanese business runs on trust and word of mouth. One peer referral from a respected agency owner is worth more than 100 cold DMs. This is how business gets done in Beirut.

Referral mechanics:
- Referring agency: 2 months free for every new agency that signs
- Referred agency: first month free
- Fox personally thanks every referral source with a WhatsApp voice message or a short call

Activation script (WhatsApp to each existing client after 30+ days of results):
"Hey [Name], things have been going well. Quick question: who else in the industry do you think would benefit from what we built for you? Even a warm intro would mean a lot."

Do not wait for clients to refer spontaneously. Ask directly. One at a time. In Lebanese business culture, a direct ask from someone you respect and have a relationship with is natural, not pushy.

---

## PART 5: LEAD GENERATION CHANNELS

### Channel Priority Matrix

| Channel | Month 1 | Month 2 | Month 3 | Month 4 |
|---------|---------|---------|---------|---------|
| Direct WhatsApp outreach | PRIMARY | PRIMARY | HIGH | HIGH |
| In-person visits and meetings | PRIMARY | HIGH | MEDIUM | LOW |
| LinkedIn outreach | HIGH | HIGH | HIGH | MEDIUM |
| Referral program | ACTIVATE at 5 clients | PRIMARY | PRIMARY | PRIMARY |
| Instagram (credibility only) | SETUP | MAINTAIN | MAINTAIN | MAINTAIN |
| Meta Paid Ads | NOT YET | ONLY after 10 clients | HIGH | HIGH |
| R.E.A.L syndicate and industry events | MEDIUM | HIGH | HIGH | MEDIUM |
| Property Finder/Bayut partnership | NOT YET | NOT YET | HIGH | HIGH |
| Jordan/MENA expansion | NOT YET | NOT YET | TEST | LOW |

### Channel Tactics

**Channel 1: Direct WhatsApp Outreach (Months 1+, Highest ROI)**

Primary channel for the first 60 days. Lebanon is a WhatsApp-first market. Costs nothing. Converts at high rates when personalized.

Volume: 20 messages per day from Day 4 onward.

Building the Dream 100:
- Property Finder Lebanon: sort by listings volume, find top 100 agencies, get owner contact from listings or Instagram bios
- Instagram: search "real estate Lebanon" and "عقارات لبنان", compile accounts with 500+ followers
- LinkedIn: search "real estate director Lebanon", "property consultant Beirut", "agency owner real estate Lebanon"
- R.E.A.L member directory: verified professional agencies
- Google Maps: search "real estate agency" by Beirut neighborhood, extract phone numbers from each listing
- Walk-ins: Ashrafieh, Gemmayzeh, Verdun, Hamra, Downtown. Collect cards. Get the owner's direct number.

Track everything in a Google Sheet: name, agency, date, channel, response, meeting booked, outcome.

**Channel 2: In-Person Visits (Months 1-2, Highest Close Rate)**

For the first 10 agencies, go in person. No exceptions. Bring the demo on your phone. Let the owner text the AI themselves.

After the meeting, same-day WhatsApp follow-up: "Great meeting you today [Name]. Here is the one-pager I mentioned. [PDF]. The pilot spots are filling up. Want me to hold one for you?"

**Channel 3: LinkedIn Outreach (Months 1+, Professional Tier)**

10-15 connection requests per day with a personalized note: "Hey [Name], noticed your work at [Agency]. I'm building AI tools for Lebanese real estate agencies and would love to connect." Follow up with a DM after they accept.

Good for reaching owners who are less accessible via WhatsApp and more active professionally.

**Channel 4: Referral Program (After 5 Happy Clients, Compounding Growth)**

Becomes the primary growth channel from Month 2 onward when managed actively.

Ask every client personally after 30+ days of results. Direct, one at a time, by WhatsApp.

"Hey [Name], we are growing and I'm looking to bring on agencies similar to yours. Who in the industry do you most respect and who do you think would benefit from what we built for you? Would you be open to making an intro?"

One genuine Lebanese agency owner referral closes at 70-80% vs 20-30% for cold outreach. This channel is disproportionately valuable and costs nothing. Invest in it from day one of eligibility.

**Channel 5: Meta Paid Ads (After 10 Paying Clients Only)**

Do not run paid ads before 10 paying clients with documented case study results.

When the time comes:
- After 10 clients: $300/month (case study creative only)
- After 15 clients: $500/month (optimize the winner)
- Month 3: $700-1,000/month
- Month 4+: $1,500-3,000/month

Winning creative for Lebanese agency owners:
- Case study first: "One Beirut agency. First 30 days. [X] leads handled. [Y] tours booked." Real numbers convert. Polish does not.
- Demo video: real WhatsApp conversation, AI responds in under 60 seconds, lead books a tour. Text overlay: "While the agents were asleep."

Target: Location Lebanon, job title real estate agent/director/agency owner, interests real estate and WhatsApp Business.

Target CPA: under $150 for a demo booked, under $1,500 for a paying client acquired.

**Channel 6: R.E.A.L Syndicate and Industry Events (Months 1-3)**

R.E.A.L is the Real Estate Syndicate of Lebanon. It has a member directory and hosts industry events. Being present at these events puts Fox in front of the exact audience with high credibility. A founder showing up at an industry event converts better than any outreach because the context is already warm.

Attend any upcoming Lebanese real estate events or networking gatherings. Fox goes personally.

**Channel 7: Property Portal Partnerships (Month 3+)**

Property Finder Lebanon and Bayut are where Lebanese real estate leads originate. Both companies have commercial teams looking for value-adds for their agency clients.

Contact the Property Finder Lebanon partnerships team. Email and LinkedIn.

Pitch in one sentence: "Wakeeli makes your platform more valuable by helping agencies convert the leads you send them. We want to be the official conversion tool recommended to your top agencies."

Even a mention in their agency newsletter reaches hundreds of agencies and is worth more than $2,000 in paid ads.

---

## PART 6: FINANCIAL MODEL

### Month-by-Month Revenue Projection

| Month | New Paid Clients | Total Clients | Client Mix | Base MRR | Add-ons | Total MRR | Setup Fees |
|-------|-----------------|---------------|-----------|----------|---------|----------|------------|
| Pre-launch (Wks 1-3) | 0 | 0-3 pilots | All free | $0 | $0 | $0 | $0 |
| Month 1 (Wks 4-7) | 10 | 10 | 2S + 6G + 2Sc | $6,174 | $495 | $6,669 | $3,479 |
| Month 2 (Wks 8-11) | 10 | 20 | 3S + 13G + 4Sc | $12,648 | $1,386 | $14,034 | $3,479 |
| Month 3 (Wks 12-15) | 13 | 33 | 4S + 21G + 8Sc | $21,709 | $1,980 | $23,689 | $4,523 |
| Month 4 (Wk 16) | 14 | 47 | 5S + 30G + 12Sc | $31,369 | $2,375 | $33,744 | $4,873 |

**Plan key:** S = Starter ($299), G = Growth ($597), Sc = Scale ($997)

**Add-on breakdown at Month 4:**
- AI Refresh ($99/mo): 20 clients = $1,980
- Expansion seats ($79/seat): 5 seats = $395
- Total add-ons: $2,375

**Setup fee totals (cumulative):** $16,354 in one-time cash over 4 months, in addition to MRR.

**Annual run-rate at Month 4:** $33,744 x 12 = $404,928

### Churn Assumptions

- Months 1-2: 0% churn. You cannot afford churn from the founding cohort. Obsess over their success.
- Month 3: 3% monthly churn (1 client lost). Low because switching requires Meta re-verification.
- Month 4: 5% monthly churn (2 clients lost at scale). Offset by new acquisitions.

**Churn protection mechanisms:**
- Monthly performance reports with cumulative value delivered (prevents "forgetting" they have it)
- 14-day success moment built in (early value delivery prevents early cancellation)
- WhatsApp number association creates practical lock-in (switching providers requires Meta re-verification)
- Annual plans create structural retention (paid up for 10 months, no one cancels)

### Unit Economics at Month 4

| Metric | Value |
|--------|-------|
| Average MRR per client | $717 (blended) |
| Setup fee per new client | $497 |
| Month 1 cash per new client | $1,214 |
| API/infrastructure cost per client | ~$80-100/month |
| Gross margin per client (monthly) | ~$617-637 |
| Estimated CAC (paid acquisition) | $300-500 |
| LTV at 20-month average retention | $14,340 (Growth plan) |
| LTV to CAC ratio | 28:1 to 48:1 |

**This product is cash flow positive from day one on every new client.**

### The Annual Plan Injection

When 20-25% of clients convert to annual (conservatively):
- 8 clients on Growth x $597 x 10 months = $47,760 cash
- 3 clients on Scale x $997 x 10 months = $29,910 cash
- Total one-time injection: $77,670

This is available at any time after Month 3 and can fund ad scaling, hiring, or MENA expansion without outside capital.

### Bootstrap vs. Raise Decision

Do not raise capital before Month 4. The setup fee model makes Wakeeli self-funding:
- 5 new agencies per month x $497 setup = $2,485 in monthly cash before subscription revenue
- By Month 4, setup fees alone have contributed $16,354 in operational cash

When to consider raising:
- After hitting $30K+ MRR with demonstrable retention metrics (month 5 or later)
- Specifically to accelerate UAE/Gulf expansion
- Amount: $300K-500K pre-seed. The pitch is easy at that point: proven model, documented CAC, clear MENA expansion path.

---

## PART 7: MILESTONES AND DECISION POINTS

### Weekly KPIs to Track

| Metric | Week 4 Target | Week 8 Target | Week 12 Target | Week 16 Target |
|--------|--------------|--------------|----------------|----------------|
| Paying clients | 3-4 | 10 | 20 | 47 |
| MRR | $2,000+ | $6,000+ | $12,000+ | $30,000+ |
| Monthly churn | 0% | 0% | less than 3% | less than 5% |
| New demo meetings/week | 5 | 8 | 12 | 15+ |
| Demo to close rate | 30%+ | 35%+ | 40%+ | 40%+ |
| Outreach messages sent/week | 100 | 120 | 80 | 60 |
| Referrals received/month | 0 | 1-2 | 3-5 | 5-8 |
| Setup fees collected (cumulative) | $1,500 | $4,000 | $8,500 | $16,000+ |
| NPS (client survey, monthly) | 8+ | 8+ | 8+ | 8+ |

### Decision Gates

**Gate 1 (End of Week 4): Go/No-Go on Paid Ads**
- IF at least 2 paying clients AND one documented case study: consider first ad test at $300/month
- IF no paying clients yet: delay ads, double down on personal outreach

**Gate 2 (End of Week 8): Scale or Repair**
- IF 8+ paying clients with 0% churn: increase ad budget to $700/month, hire sales assistant
- IF fewer than 5 paying clients: diagnose the bottleneck. Is it the demo close rate? The pilot conversion? The outreach volume? Fix before scaling.

**Gate 3 (End of Week 12): Hire Decision**
- IF 18+ paying clients: hire commission-based sales assistant for top-of-funnel outreach
- IF 22+ paying clients: hire full-time Customer Success role
- IF neither: do not hire. Revenue should fund hires, not the other way around.

**Gate 4 (End of Week 14): Annual Plan Push**
- When you have 25+ paying clients: launch the annual plan offer. Target 20-25% conversion.
- The cash injection funds Month 4 advertising without touching operations.

**Gate 5 (End of Week 16): MENA Expansion Decision**
- IF $30K+ MRR with less than 5% churn: begin active Jordan outreach, allocate 10% of time to UAE research
- IF not at $30K: extend Lebanon focus. Do not expand until the home market is locked.

**Gate 6 (Month 5-6): Funding Decision**
- IF consistent $30K+ MRR with documented metrics: evaluate $300K-500K pre-seed round for UAE expansion
- IF not: continue bootstrapping. The model works. The question is pace, not viability.

### When to Hire

| Hire | When to Make It | Role | Cost | Why |
|------|----------------|------|------|-----|
| Commission sales assistant | Week 9 (20+ demos/week needed) | Top-of-funnel outreach | $300 base + $150/close | Fox's time is worth $600+/hour at this stage |
| Customer Success (full-time) | Week 13-14 (30+ clients) | Monthly reports, health monitoring, renewals | $800-1,200/month | Churn prevention becomes the growth constraint |
| Technical hire (full-time) | Month 5 (50+ clients) | Product development, scaling | Market rate | Self-serve onboarding, UAE product work |

---

## PART 8: RISK MITIGATION

### Risk 1: Meta WhatsApp API Approval Takes Too Long

**Probability:** High (60-70%). Meta approvals are unpredictable.

**Impact:** Cannot connect real agency WhatsApp numbers. Pilots stall. Clients lose confidence.

**Mitigation:**
- Submit Meta Business Verification on Day 1 of Week 1. Not Week 2. Day 1.
- Sign up with 360dialog immediately as a parallel track. 360dialog is a Meta-approved BSP operating across MENA. They can provision WhatsApp Business API access faster than going direct. Contact: 360dialog.com
- Alternatively: Twilio WhatsApp Business API. Slightly more developer work but reliable.
- Backup option: Use a shared Wakeeli WhatsApp number for the pilots. Route all pilot agencies through one number with internal routing logic. Less clean but fully functional. The per-agency number is a V2 feature.

**If this happens:** Tell pilots: "Your production number goes live in [X] days. In the meantime, we can run a limited demo via our shared test number. The AI is fully trained on your listings. We are just waiting on Meta." Most agencies will accept a 2-3 week delay if Fox is transparent and communicative.

---

### Risk 2: Technical Issues During Onboarding

**Probability:** Very low. Lexy handles all technical execution. Multi-tenancy, billing, auth, and all other core infrastructure are completed in Days 1-3 of the launch.

**Impact if something breaks:** A misconfigured API endpoint or data isolation issue could expose one client's data to another. This is a trust-destroying event.

**Mitigation:**
- All multi-tenancy work is tested with two fake companies before any real agency is onboarded. Verify that Agency A cannot see Agency B's data before touching a real client.
- Sentry error tracking catches issues before clients report them.
- Staging environment on Railway keeps production clean. Never deploy untested changes directly.
- If a production issue occurs: Fox discloses it to the affected client immediately. Offer a free month. Handle it directly. Transparency beats silence every time.

---

### Risk 3: First 3 Pilots Underperform

**Probability:** Low-medium (20-30%) if Fox obsesses over them. Higher if he does not.

**Impact:** No case studies. No social proof. No proof-based ads. The entire growth engine stalls.

**Mitigation:**
- Fox personally monitors these three accounts daily for the first 30 days. Not weekly. Daily.
- If a conversation goes wrong (AI says something incorrect or off-brand), Fox intervenes manually and then fixes the training data.
- Set up a WhatsApp group with the agency owner: "Hey, I have a direct line for you. Anything you see that is not right, send it to me and I fix it same day."
- The success bar is low: "more tours than last month." If the system is running 24/7 and every lead gets a response, the odds of underperformance are very low.
- If a pilot genuinely underperforms: diagnose the root cause before blaming the product. Is the AI responding correctly? Are agents following up on the warm leads it delivers? Are the listings in the system current? Most "failures" are onboarding quality issues, not product failures.

---

### Risk 4: Lebanese Market Instability

**Probability:** Low-medium (ongoing background risk in Lebanon).

**Impact:** Agency owners pause spending. New deals slow down. Economic anxiety reduces willingness to pay for software.

**Mitigation:**
- The ROI argument becomes MORE powerful in economic downturns, not less. "When every deal matters, can you afford to lose even one to a slow response time?"
- Flexible payment options: Lebanese lira vs. USD options, bank transfer accepted (not just credit card).
- Offer a month-to-month guarantee with no contract lock-in for the first 6 months. Lebanese business owners value flexibility.
- Target agencies serving diaspora buyers: they operate in USD and are less exposed to local economic volatility. These agencies should be Tier 1 priority.

---

### Risk 5: A Funded Competitor Enters Lebanon

**Probability:** Low in 16 weeks. MENA is not a hot market for most Western SaaS.

**Impact:** Price pressure, credibility competition, potential agency churn if competitor offers a free trial.

**Mitigation:**
- Move fast. By the time a competitor enters, you want 30+ agencies locked in with WhatsApp numbers associated, switching costs built, and case studies published.
- The WhatsApp number association is a structural moat. Agencies cannot easily switch providers without going through Meta re-verification, which takes weeks.
- Build relationships, not just software. Lebanese business culture means a competitor offering a slightly better product at a slightly lower price will not win against Fox's personal relationships with his clients.
- Own the content. By Month 3, Fox should be the recognized voice on AI in Lebanese real estate. Being the authority is a competitive moat that software features cannot replicate.

---

### Risk 6: Churn Spike After Month 2

**Probability:** Medium (30-40%) if onboarding quality is inconsistent.

**Impact:** Treadmill effect. You acquire 10 clients but lose 8. MRR flatlines.

**Mitigation:**
- The 14-day success moment: every agency must see a concrete result within 14 days. Not "the system is configured." An actual result: "In your first 14 days, Wakeeli handled 23 conversations and booked 4 tours." Build this as an automatic milestone.
- Monthly performance reports sent on the 1st of every month. The report headline is always a number: "Wakeeli saved your agency 47 hours of agent time this month." Without this, subscriptions become invisible and vulnerable.
- 60-day founder call: Fox personally calls every client at the 60-day mark. Growth conversation, not support call. "Where are you now vs. 60 days ago? What would make Wakeeli even more valuable to you over the next 6 months?" This call prevents quiet churn and surfaces upgrade opportunities.
- Annual plan conversion: agencies who have paid 10 months upfront do not cancel. The annual push at Week 14 is as much a retention strategy as a cash strategy.

---

## PART 9: EXECUTION CHECKLIST

### Days 1-3: Tech Complete (Lexy executes)

- [ ] Multi-tenancy: companies table, company_id on all tables, JWT company context, all endpoints filter by company_id
- [ ] Two fake companies tested: Agency A cannot see Agency B's data (verified)
- [ ] Submit Meta Business Verification application
- [ ] Sign up with 360dialog as WhatsApp API backup
- [ ] Set up manual invoicing (Wave or Zoho)
- [ ] Stripe billing integrated with subscription plans and company activation
- [ ] Hardcoded credentials (Admin/Admin123) replaced with DB-only auth
- [ ] Backend role enforcement added to all protected endpoints
- [ ] Session state persistence (DB-backed, not in-memory)
- [ ] Mobile responsiveness for dashboard
- [ ] CSV listing bulk import working
- [ ] Data export (CSV) for clients
- [ ] Company onboarding admin panel (Fox can provision clients without manual DB work)
- [ ] Sentry error tracking deployed
- [ ] UptimeRobot or Betterstack monitoring active
- [ ] Staging environment on Railway separate from production
- [ ] Custom domain live with SSL
- [ ] Rate limiting on API endpoints and WhatsApp webhook
- [ ] Database backup policy verified and tested
- [ ] Terms of Service drafted and submitted for lawyer review
- [ ] Privacy Policy drafted and submitted for lawyer review
- [ ] Client service agreement template ready (1-page)
- [ ] One-pager PDF "The Wakeeli Conversion Engine" created

### Day 1 + Week 1: Sales Launch

- [ ] WhatsApp all 7 target agency owners personally (Day 1)
- [ ] Create Wakeeli Instagram and LinkedIn business pages
- [ ] Post 3 credibility pieces on Instagram (stat, problem, product)
- [ ] Begin Dream 100 list (target 50 agencies with owner contacts by end of Week 1)
- [ ] Start 20 outreach messages per day from Day 4
- [ ] First walk-in visits: 5 agencies in Ashrafieh, Verdun, or Hamra
- [ ] Set up Google Sheet for outreach tracking (Name, Agency, Channel, Date, Response, Status)

### Week 1-3: Pre-Launch Business Infrastructure

- [ ] Demo environment or screen recording ready for sales meetings
- [ ] Manual invoicing workflow documented
- [ ] WhatsApp connected (360dialog or Meta direct, whichever is ready first)
- [ ] First 4-6 meetings held
- [ ] 2-3 verbal pilot commitments secured
- [ ] First 2-3 pilot agencies onboarded (AI trained on their listings, WhatsApp connected)
- [ ] Email notifications for agents (new lead, tour booked)
- [ ] Tour reminder automation live

### Before Scaling Past 10 Clients (by end of Week 8)

- [ ] First documented case study published (written + graphic)
- [ ] Referral program announced to all existing clients
- [ ] Platform health dashboard for Fox (cross-company metrics)
- [ ] 60-day founder call process documented and scheduled for first cohort
- [ ] Monthly performance report template created
- [ ] Sales process documented (pain signals, objections, close methods)

---

## APPENDIX: QUICK REFERENCE

### Agency Priority List (Months 1-2)

| Agency | Priority | Why | Approach |
|--------|----------|-----|----------|
| Pro-Founders | 1 | First contact. Start here. | Direct WhatsApp to owner |
| One Properties | 1 | Likely expat-focused. Perfect product fit. | Direct WhatsApp to owner |
| Spectrum Properties | 1 | Volume play. High lead count. | Direct WhatsApp to owner |
| Beirut Commune | 2 | Mid-market. Good proof point. | Instagram + WhatsApp |
| RayWhite Lebanon | 2 | Franchise brand. Strong validation if they sign. | Direct WhatsApp to owner |
| JSK Real Estate | 3 | Build relationship first | Instagram + meeting |
| C Properties | 3 | Build relationship first | Instagram + meeting |

### The 5-Second Wakeeli Pitch

"Your WhatsApp leads that come in after 9 PM are going cold. Wakeeli responds in under 60 seconds, qualifies them, and books tours automatically. Your agents wake up with warm leads already scheduled. Want to see it?"

### The Number That Converts Every Time

"78% of buyers choose the first agent who responds. Your last lead came in after hours. When did your agency respond?"

Use this question in every outreach channel. It starts conversations because it makes them think. Every Lebanese agency owner has an uncomfortable answer.

---

*Battle plan compiled: April 2026*
*Next review: End of Week 4 (first conversion metrics available)*
*Frameworks drawn from: Alex Hormozi (Grand Slam Offers + Gym Launch), Dan Martell (Buy Back Your Time + SaaS Academy), Liam Ottley (AI Agency Accelerator)*
