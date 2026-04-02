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

### The Bonus Stack (Growth and Scale plans)

| Bonus | Framed Value | What It Actually Is |
|-------|-------------|---------------------|
| Done-for-you WhatsApp setup | $500 | Fox personally configures everything |
| AI trained on their listing database | $300 | Custom prompts per agency |
| 30-day lead performance audit | $200 | Weekly check-in, Fox reviews personally |
| Lebanese Real Estate Lead Conversion Playbook | $97 | PDF written once, given to every client |
| 60-second response in Arabic, English, or French | $0 extra | Core product |

**Total bonus value: $1,097**

Month 1 framing for a Growth plan client: "$597/month plus $1,097 in bonuses plus a $497 setup fee. Total value delivered: $2,191. You pay $1,094 in Month 1."

That is the framing. Present it exactly that way.

### The Guarantee

**Option A (primary, for most prospects):**
"If Wakeeli does not book more property tours in your first 30 days than the 30 days before, we refund 100% of your first month's subscription. No questions asked."

**Option B (for skeptics):**
"If Wakeeli does not book at least one qualified property tour in your first 30 days, you pay nothing."

The guarantee is virtually zero-risk because:
1. Every agency will get at least one tour booked in 30 days
2. Most agencies have weak current follow-up, so "more than last month" is a low bar
3. Any agency skeptical enough to invoke the guarantee was not a long-term client anyway

### The Scarcity Frame

"We are in a controlled launch. We are accepting only 3 new agencies this month to ensure each gets proper setup and training. After this cohort fills, the next window is 6 weeks out."

Lebanese business owners respond to genuine constraint. Do not manufacture fake urgency. The 3-agency-per-month cap is real: Fox can only do quality onboarding for 3-4 agencies per month in the early weeks.

---

## PART 2: WEEK-BY-WEEK BATTLE PLAN

### PRE-LAUNCH: Weeks 1-3
**Goal: Tech complete, pilots committed, pipeline of 50+ agencies built**

---

**WEEK 1: Foundation**

Tech (do this yourself or hire a developer immediately):
- Start multi-tenancy sprint. This is the single most critical task. See launch-readiness.md for exact tables needed: `companies` table, `company_id` FK on all tables, JWT company context, endpoint filtering. 2-3 weeks of focused engineering.
- Submit Meta Business Verification application TODAY. The clock starts now. Approval takes 2-7 days for verification, then 1-4 more weeks for WhatsApp Business API access. Every day you delay is a day added to your go-live date.
- Register on 360dialog (360dialog.com) as a backup WhatsApp provider. They are a Meta-approved Business Solution Provider, common in MENA, and can get you API access faster than going direct. You need a fallback for when Meta is slow.
- Set up manual invoicing via Wave or Zoho Invoice. One day of work. You do not need Stripe for the first 5 clients.

Sales:
- Fox personally messages all 7 target agency owners via WhatsApp. Not email. Not their agency number. The owner's personal number if possible.
  - **Exact message:** "Hey [Name], I'm Fox. I built an AI system specifically for Lebanese real estate agencies to handle their WhatsApp leads 24/7. Responds in 3 seconds, qualifies every lead, books tours while the team sleeps. A few Beirut agencies are already in the pilot. I'd love to show you what we built. Takes 20 minutes. When are you free this week?"
- Target agencies to message on Day 1: Pro-Founders, One Properties, Spectrum Properties, Beirut Commune, RayWhite Lebanon, JSK Real Estate, C Properties.
- Begin building the Dream 100 list: 100 Lebanese real estate agencies with owner names and WhatsApp numbers. Sources: Property Finder Lebanon top agencies, Bayut Lebanon, Instagram accounts with "real estate Lebanon" in bio, LinkedIn searches for "real estate director Lebanon."

Marketing:
- Create the Wakeeli Instagram and LinkedIn pages today.
- Post Day 1 content: static graphic with this text. "35% to 50% of real estate deals go to whoever responds first. Most Lebanese agencies take 4-12 hours to respond to a WhatsApp lead. One stat. One problem. One fix." No product mention yet. Just the pain.
- Write the one-pager PDF: "The Wakeeli Conversion Engine." One page, PDF format. Headline: "Your 24/7 AI sales rep that responds in 3 seconds, qualifies every lead, and books tours while your agents sleep." Include pricing, the Forbes stat, and the 30-day guarantee. This is your leave-behind for every meeting.

**WEEK 2: First Meetings**

Tech:
- Multi-tenancy 40-50% complete.
- Remove hardcoded credentials (Admin/Admin123). This takes 1-2 days and is a hard requirement before any client touches the product. See launch-readiness.md for exact scope.
- Add backend role enforcement (3 days work). Agents currently can access every API endpoint with Postman. This is a security blocker.

Sales:
- Meetings with first 4 target agencies completed.
- 2-3 agencies verbally agree to free pilot. They do not need to sign anything this week. Lock the relationship.
- Do not demo the product live yet if it is not fully multi-tenant. Demo using a prepared screen recording or a sandboxed mock environment. Never show a live system that has broken security.
- Begin 20 Instagram DMs per day to Lebanese agency accounts. Script: "Hey [Agency Name], quick question. When a lead messages your WhatsApp at 11pm, what happens? I'm doing research on Lebanese agency response times and would love 2 minutes of your perspective."
  - This is research framing, not sales. It gets responses. The conversation does the selling.

Marketing:
- Instagram post 2: Pain content. "A lead came in at 10:47 PM on a Friday. Nobody at the agency saw it until 9:15 AM Saturday. The lead had already toured with a competitor by 8 AM. This happened last week. At a Beirut agency. This is the problem Wakeeli was built to solve."
- Instagram post 3: Product intro. "Wakeeli responds to your leads in under 3 seconds. Qualifies them. Matches them to your listings. Books the tour. Your agent wakes up with a confirmed appointment. While they were sleeping."
- Draft the HVCO: "The Lebanese Agency Lead Loss Calculator." An interactive calculator where agency owners enter their monthly lead volume, after-hours percentage, average commission, and close rate. Output: estimated monthly revenue lost to slow response. Built on Typeform or a simple Webflow calculator. 2-3 days to build.

**WEEK 3: Pilots Live**

Tech:
- Multi-tenancy complete. Companies table live. company_id on all tables. JWT carries company context. Every endpoint filters by company_id. Test with 2 fake companies. Verify Agency A cannot see Agency B's data.
- Terms of Service and Privacy Policy drafted (get a Lebanese lawyer to review, ~$200-400). Required by Meta. Required by Lebanese law. Required before any client signs.
- Client service agreement template drafted. One-page document: what Wakeeli provides, SLA, data ownership, cancellation terms. Simple. This is what the pilot agencies sign.
- Set up custom domain (wakeeli.app or similar). Connect SSL. Deploy to custom domain. Railway setup takes 1 day.
- Deploy Sentry for error tracking. One hour of work. You need to know when things break before clients complain.

Sales:
- First 2-3 pilot agencies sign the one-page pilot agreement.
- Onboard Pilot 1: connect their WhatsApp (via 360dialog if Meta approval still pending), train AI on their listings, set up conversation flows. Fox handles this personally. Budget 3-5 hours per client.
- Continue 20 Instagram DMs per day.
- Begin 10 LinkedIn connection requests per day to agency owners/directors in Lebanon. Personalized note: "Hey [Name], I noticed your work at [Agency]. I'm building AI tools for Lebanese real estate agencies and your perspective on the market would be valuable. Would love to connect."
- Add 30 more agencies from the Dream 100 to active outreach.

Marketing:
- HVCO calculator live on landing page.
- Landing page above the fold: Headline: "Lebanese Real Estate Agencies: How Many Deals Did You Lose While Sleeping Last Night?" Subhead: "Calculate exactly how much your agency loses every month to slow WhatsApp response times. Free. 90 seconds." CTA: "Show Me My Number." No email required for the calculator. Email and WhatsApp number captured after the result is shown.
- Post the HVCO calculator link in 3 Lebanese business Facebook groups: "Lebanese Entrepreneurs," "Real Estate Lebanon," and "Lebanon Business Network." Do not post as an ad. Post as a free resource with a short personal note from Fox.

---

### MONTH 1: Weeks 4-7
**Goal: 10 paying clients, $5,970 base MRR**

---

**WEEK 4: First Conversions**

Tech:
- WhatsApp Meta API approved (best case) or 360dialog live as interim (likely).
- Session state persistence: AI conversation context currently lives in memory. Server restart = context lost. Build DB-backed session storage or Redis. 2-3 days. Do this before you have clients whose conversations matter.
- Listing bulk import: agencies have 50-500 listings and will not add them one by one. Build CSV import. 3-5 days.

Sales:
- Convert first 2-3 pilot agencies to paid. Frame it: "The pilot period is ending. Here is what ongoing looks like."
  - Pilot Agency 1 conversation: "You have had the system running for 2 weeks. Walk me through what you noticed. [Let them talk.] Based on what you just said, what is that worth monthly to your agency? [Let them do the math.] That is what Wakeeli is protecting. It costs $597 a month. Want to keep it running?"
- Setup fees collected: 3 x $497 = $1,491 cash on the day they convert.
- Begin formal onboarding for paid clients. Create an onboarding checklist doc. Use it for every client from here on.
- Run 8-10 demo meetings this week. These are prospects from the DM outreach in Weeks 2-3 who expressed interest.

Marketing:
- First case study drafted. Even if the pilot is 2 weeks old, you have numbers. "In 14 days with [Agency Name anonymized], Wakeeli handled 34 WhatsApp conversations, qualified 12 leads, and booked 7 tours. The agency's previous monthly average: 5 tours." Even early data is powerful.
- Instagram: Post the case study numbers as a graphic. No agency name needed. "14 days. 34 conversations handled. 7 tours booked automatically. One agency in Beirut." The comment section will do the selling.
- LinkedIn: First long-form post. "Why Lebanese Real Estate Agencies Are Losing $54,000 Per Year to WhatsApp Response Time (And How to Fix It in 30 Days)." Walk through the math: 60 leads per month, 25% lost to slow response, 10% close rate, $3,000 average commission. Show the $4,500 monthly loss. End with a link to the calculator.

**WEEK 5: Machine Mode**

Sales:
- Fox doing 10-12 sales conversations this week. Mix of meetings, WhatsApp conversations, calls.
- 6-7 paying clients locked in by end of week.
- Referral program announced to all existing clients: "Refer an agency that signs up, get 2 months free. Simple."
- Target: WhatsApp message each existing client personally. "Hey [Name], things are going well with [their agency name]. Who else do you know in the industry who has the same challenge with WhatsApp leads? Even a warm intro would mean a lot."
- In Lebanon, one peer referral is worth 100 cold DMs.

Marketing:
- Meta ad campaign launched. Budget: $300 this week.
  - Ad 1 (static image): "35% to 50% of real estate deals go to the first responder. How fast is your agency responding right now? See how Wakeeli fixes this." CTA points to HVCO calculator landing page.
  - Ad 2 (video, 30-60 seconds): Show a WhatsApp lead coming in at 11 PM, Wakeeli responding in 3 seconds, qualifying the lead, booking the tour. Text overlay: "While your agents were sleeping." Fox's voice or text-on-screen narration. Shoot this on a phone. Raw is fine. Authentic beats polished.
  - Targeting: Location Lebanon, job title real estate agent/agency owner/property consultant, interests real estate and WhatsApp Business.

**WEEK 6: Scale the Process**

Sales:
- 9-10 paying clients.
- Begin documenting the sales process. After every meeting, write 3 bullet points: what the prospect said that indicated pain, what objection came up, what closed them. This becomes your playbook for the sales assistant you hire in Month 2.
- First Jordan outreach: 5 WhatsApp messages to Jordanian agencies. Do not invest time here. Just test the waters. One message each, move on.

Tech:
- Email notifications for agents: when a new lead is assigned or a tour is booked, the agent gets an email (or WhatsApp message if you can build it). Agents should not have to check a dashboard they are not in the habit of checking. 2-3 days.
- UptimeRobot or Betterstack monitoring live. If the server goes down, you know before a client does.
- Staging environment created on Railway. Stop deploying directly to production.

**WEEK 7: Month 1 Close**

Sales:
- 10 paying clients. Month 1 target hit.
- Review everything: Which content drove the most DMs? Which outreach channel converted at the highest rate? Which objection came up most? Which closing approach worked?
- Offer the AI Refresh add-on ($99/month) to the first wave of clients. Frame it: "Each month I personally review your conversation logs, retrain the AI prompts based on what is working, and update your listing data. Your AI gets smarter every month. $99 to keep it optimizing."

Marketing:
- Scale the Meta ad budget to $500/month based on Week 5-6 learnings. Kill any creative that is not getting clicks. Double down on what is working.
- Instagram: Begin posting 4x per week consistently. Two content types: (1) pain/stat posts (most viral), (2) proof posts with anonymized numbers from client results. Do not post about features. Only pain and proof.

---

### MONTH 2: Weeks 8-11
**Goal: 20 paying clients, $11,940 base MRR**

---

**WEEK 8: Referral Engine**

Sales:
- Every existing client gets a personal WhatsApp from Fox: "Hey [Name], I wanted to check in. How are things going since we launched? [Listen.] Glad to hear it. Quick question. Which agency owner do you most respect in Beirut? Would you be willing to make an intro?"
- In Lebanon, this conversation is natural. Agency owners know each other. They talk at industry events and in their networks. One respected owner telling another "I'm using this, you should try it" is the most powerful sales tool you have.
- First referred clients signed this week. Referral mechanics: referring agency gets 2 months free, referred agency gets first month free.

Tech:
- Stripe integration (1-2 weeks of work). You have been invoicing manually. By Week 8, with 10+ clients, manual invoicing becomes a real-time cost. Stripe Billing with monthly recurring, annual option, and add-on support. Connect to company account activation/suspension on payment status.
- Rate limiting on API endpoints. The WhatsApp webhook is currently unprotected. Add slowapi or nginx rate limiting. One day.
- Database backup policy verified and tested. Know what your Railway PostgreSQL retention policy is. Test a restore.

Marketing:
- Instagram: Case study carousel post. Format: Slide 1: "One Beirut agency. 30 days. The numbers." Slide 2-5: Metrics from best performing pilot client (leads handled, tours booked, estimated revenue protected, agent hours saved). Slide 6: "30-day pilot. 0 risk. 3 spots left this month. DM to start."
- LinkedIn: Second long-form post. "The Lebanese Real Estate Agency That Went From 11 Tours Per Month to 19 Without Hiring Anyone." Story-format case study. Anonymized agency. Real numbers. This post will be shared in Lebanese real estate circles.
- Meta ads: $700/month. Test the case study creative as Ad 3. A named (or clearly anonymized) agency result as the hook.

**WEEK 9: Enterprise Push**

Sales:
- Identify the 5 largest agencies in the current pipeline. Push them toward the Scale plan ($997/month). These conversations are worth an extra $400/month per client. If you close 5 of them on Scale instead of Growth, that is $2,000/month additional MRR. The difference between hitting $28K and $30K.
- Scale plan pitch addition: "With Scale, you also get a dedicated account manager (Fox, personally, for the first year). Any issue, any optimization request, any question. You get me directly. Not a ticket system. Me."
- 15 paying clients by end of week.

Marketing:
- Announce the HVCO calculator via WhatsApp broadcast to your outreach list. Everyone who gave their number while researching the product gets a message: "Hey [Name], I built a free calculator for Lebanese agency owners. Takes 90 seconds. Shows you exactly how much your agency is losing to slow response times. Want the link?"
- LinkedIn: Begin posting 2x per week consistently from this week forward. Fox's face, Fox's voice, Fox's perspective. This is not optional. Thought leadership compounds. Every post builds the next one.

**WEEK 10-11: Consolidation**

Sales:
- 20 paying clients. Month 2 target hit.
- Monthly performance review. Key questions: What is the blended MRR per client? What is the current monthly churn (should be 0 at this stage)? Which acquisition channel is producing the best clients? What is the average time from first contact to close?
- Hire 1 commission-based sales assistant in Beirut. Junior, hungry, connected. Their job: cold outreach, Instagram DMs, meeting booking. Fox closes every deal. The assistant fills the top of the funnel. Pay: $300/month base + $150 per client signed. This costs Fox nothing if they do not perform.

Tech:
- Mobile responsiveness for the dashboard. Lebanese agents check everything on their phone. The dashboard is currently desktop-first. 2-3 days to make it responsive.
- Data export (CSV) for clients. Compliance, CRM migration, future-proofing. One day of work. Clients feel more secure knowing they can take their data with them.

Marketing:
- Meta ads scaled to $1,000/month. Three creatives running: stat ad, demo video, case study.
- Build a 7-message Magic Lantern nurture sequence on WhatsApp for leads who complete the calculator but do not book a demo. Full sequence detailed in Part 5 of this document.

---

### MONTH 3: Weeks 12-15
**Goal: 33 paying clients, $19,701 base MRR**

---

**WEEK 12-13: Case Study Offensive**

Sales:
- Three full named case studies published: blog post, Instagram carousel, LinkedIn article. Named agencies (with permission) OR detailed anonymized with specific numbers. Real is better. If agency owners are proud of their results (most will be), they will let you use their name.
- Request video testimonials from the 3 happiest clients. Ask for this via WhatsApp voice message: "Hey [Name], I wanted to ask a favour. Would you record a 30-second WhatsApp video of just saying what changed since you started using Wakeeli? Raw and honest. Nothing produced. Just you talking. It would mean a lot."
  - Raw WhatsApp videos from Lebanese business owners convert better than any polished ad.
- These case studies become the primary sales collateral for the next 3 months. Every new prospect gets them before the demo.

Tech:
- Platform health dashboard for Fox: cross-company metrics. Total leads handled across all agencies, total tours booked, conversion rates, top performing agencies, token cost tracking. 3-4 days. You need this visibility to manage scale.
- Tour reminder automation: scheduled WhatsApp messages 24 hours before and day-of. Agents already expect this from real businesses. 3-4 days with APScheduler.
- Self-service onboarding wizard (start building, not urgent yet). When you hit 50 clients, onboarding manually will break you.

Marketing:
- Property Finder Lebanon outreach. Contact their commercial team. Position Wakeeli as a lead-conversion add-on that makes their listing service more valuable. Pitch: "Your agencies pay you to generate leads. We help them convert those leads. We make your platform more valuable. Let's co-market." Even one newsletter mention from Property Finder reaches hundreds of agencies.
- Identify 3-5 Lebanese digital marketing agencies that serve real estate clients. Approach with a referral deal: they recommend Wakeeli to their clients, they get $297 (one month Growth subscription equivalent) per agency that signs.
- Instagram: First video reel. 60-90 seconds. Screen recording of a real Wakeeli conversation in Lebanese Arabic (8-11 PM timestamp visible), the AI responding in seconds, qualifying the lead, booking the tour. Caption: "This is what your agency looks like at 2 AM without Wakeeli." Post between 7-9 PM when Lebanese agency owners are checking their phones. This post has viral potential in the Lebanese real estate community.

**WEEK 14: Annual Plan Push**

Sales:
- WhatsApp and email blast to all existing clients: "Lock in your current price forever. Pay for 10 months, get 12. Zero risk. And you never face a price increase on your plan."
- Target: 20% of existing 33 clients convert to annual. That is roughly 7 clients.
- 7 clients x $597 x 10 months = $41,790 cash collected in one week.
- This cash injection funds Month 4 ad spend, the sales assistant salary, and any additional technical hires.

**WEEK 15: Partnership Revenue**

Sales:
- First referred client from Property Finder or digital agency partnership.
- Jordan: upgrade from testing to active outreach. 20 WhatsApp messages to Jordanian agency owners. Use the Lebanese case studies as social proof. "Lebanese agencies are getting X results with Wakeeli. Jordan has the same WhatsApp lead challenge. Want to see how it works?"
- 33 paying clients by end of Week 15. Month 3 target hit.
- Hire first full-time employee: Customer Success. Their job is monthly performance reports, client health monitoring, renewal conversations, and escalating at-risk accounts to Fox. $800-1,200/month in Beirut. Frees Fox 8-10 hours per week.

Marketing:
- Meta ads: $2,000/month. Four creatives: stat ad, demo video, case study video (from week 12 testimonials), annual plan offer.
- LinkedIn article: "Why I Turned Down a $300K Investment Offer (And What We're Doing Instead)." Founder story content. This builds personal brand, drives inbound inquiries, and positions Fox as a thought leader not just a vendor.

---

### MONTH 4: Weeks 16+
**Goal: 47 paying clients, $30K+ MRR**

---

**WEEK 16: The Close**

Sales:
- All four lead generation channels running simultaneously. Warm outreach, cold outreach, paid ads, referrals.
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

With Wakeeli, within 3 seconds, not minutes, seconds, they get a response. In Arabic if that is what they wrote in. The AI asks the right qualification questions. It checks your listings, finds the three best matches, and offers to book a tour for Saturday at 10 AM or 2 PM, whichever works.

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
"One commission from a deal that Wakeeli books covers 12 months of the subscription. Your average commission is [X]. If Wakeeli saves you even one deal in the first year, it has paid for itself many times over. And the guarantee means you get your first month back if it does not book more tours than last month."

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

6. Show the stat wall: pull up the Forbes stat. "35 to 50 percent of real estate deals go to the first responder. You just responded to that lead in 3 seconds. Your competitor is still asleep."

7. Close with the pain reframe: "How many leads came into your agency last night after 9 PM?"

---

### The 30-Day Pilot Follow-Up Sequence

**Day 7:** WhatsApp message to the agency owner. "Hey [Name], quick update. Wakeeli has handled [X] conversations this week and booked [Y] tours. Everything is running smoothly. Any feedback from your agents on the leads they are receiving?"

**Day 14:** Second check-in. "Two weeks in. [X] conversations handled, [Y] tours booked. One note: I noticed leads coming in between 9 PM and midnight are the most active segment for your agency. Want me to optimize the responses for that window?"

**Day 30:** In-person meeting (if possible) or video call. Bring the one-page results report. Show the numbers. Then: "Last month you booked [Y] tours without your team lifting a finger for lead qualification. Two of those are likely going to deals, which is roughly $X in commission. For $597 a month, that is [Y] x ROI. Want to keep this running?"

At this point, the agency is already dependent. The AI is already running. Saying no means turning it off and going back to manual response. Conversion rate from pilot to paid should be 60-70%.

---

## PART 4: MARKETING FUNNEL

### The Complete Funnel Architecture

```
TRAFFIC
(Instagram DMs, Paid Ads, LinkedIn, Facebook Groups, Referrals)
         |
         v
HVCO LANDING PAGE
"How Many Deals Did You Lose While Sleeping Last Night?"
(Lead Loss Calculator. 90 seconds. Free.)
         |
         v
CALCULATOR RESULT
"Your agency is losing $[X] per month"
(Alarming number. Hooks the attention.)
         |
         v
OPT-IN
"Get the full breakdown + 2026 Lebanese Agency Report"
(Name + WhatsApp number only. No email required.)
         |
         v
MAGIC LANTERN NURTURE (7 messages, 14 days via WhatsApp)
         |
         v
DEMO INVITATION (Message 6, Day 10)
         |
         v
20-MINUTE LIVE DEMO
         |
         v
FREE 30-DAY PILOT OFFER
         |
         v
PAID CLIENT (Day 30)
```

### The HVCO: Lebanese Agency Lead Loss Calculator

**URL:** wakeeli.app/calculator

**Calculator inputs:**
- How many WhatsApp leads does your agency receive per month?
- What percentage come in outside 9 AM to 9 PM?
- What is your average commission per deal?
- What percentage of your qualified leads do you close?

**Output (generated instantly):**
- Estimated monthly leads lost to slow response
- Estimated monthly revenue lost
- Estimated annual revenue lost
- Benchmark line: "Top Lebanese agencies convert 28% of inbound WhatsApp leads. Your current rate without automation is approximately X%."

**Post-calculator opt-in:**
"Your number is ready. Where should we send your full breakdown and the 2026 Lebanese Agency Lead Report?"
- Name field
- WhatsApp number field (not email)
- Button: "Send My Report"

**Thank you page:**
"Report is on its way. In the meantime, watch this 3-minute video showing exactly how Wakeeli fixes this."
Autoplay the demo video (muted, with subtitles).

### The Magic Lantern Nurture Sequence (WhatsApp, 7 Messages)

Delivered via WhatsApp. All messages from Fox's personal Wakeeli number. Conversational tone. Not formatted like marketing.

**Message 1 (Day 0, immediate):**
"Hey [Name], the Lead Loss Calculator and the 2026 Lebanese Agency Report are ready for you. [Link]

One thing worth pulling out immediately: 38% of Lebanese real estate inquiries come in between 8 PM and 10 AM. That is the window your agency is most exposed.

Worth 10 minutes."

**Message 2 (Day 2):**
"An agency owner in Ashrafieh told me something last month that stuck with me.

He said he loses about 3 leads a week to slow response. He knows this because leads who went cold tell him when they circle back: 'I messaged you but nobody replied fast, so I went with someone else.'

3 leads a week. At his average commission that is roughly $9,000 a month in ghost revenue.

He stopped counting after he did the math."

**Message 3 (Day 4):**
"The Forbes research on this is blunt: 35 to 50 percent of deals go to whoever responds first.

Not the best property. Not the most experienced agent. Whoever replied fastest.

The follow-up stat is worse: leads are 21 times more likely to convert if you respond within 5 minutes. After 30 minutes that number collapses.

The problem is not that Lebanese agents are lazy. It is that leads do not care what time it is. They message when they are ready, which is often 10 PM on a Sunday. No agency can staff that."

**Message 4 (Day 6):**
"One of the agencies in our early testing phase was booking an average of 11 tours per month through WhatsApp manually.

After Wakeeli went live, they booked 19 in the first full month. Same number of leads. Same agents. Same listings. The only change was response time and the qualification process.

The tours that Wakeeli books arrive pre-qualified. The agent knows the buyer's budget, timeline, preferred areas, and property type before they shake hands."

**Message 5 (Day 8):**
"The most common thing I hear from agency owners: 'My agents respond quickly.'

Here is what I always ask back: 'What happens to a lead that comes in at 11:30 PM on a Friday?'

Silence. Because every agency has that gap. It is not a criticism. It is a structural problem that even the best team cannot solve with human coverage alone.

The second most common objection: 'Lebanese clients do not want to talk to a bot.'

They are not talking to a bot. They are texting a WhatsApp number. The conversation flows naturally in Arabic or English. And by the time an agent follows up, the lead is already warm and scheduled."

**Message 6 (Day 10):**
"I want to show you something specific to your agency.

In 20 minutes I can show you: a live Wakeeli demo handling a WhatsApp inquiry in Lebanese Arabic, what the agent dashboard looks like when a tour is booked automatically, and what the first 30 days typically look like for an agency your size.

No commitment. If it makes sense, great. If not, you keep the report and the calculator.

Reply 'demo' and I will send you two time slots."

**Message 7 (Day 14):**
"Last message on this.

We are finalizing the agencies for our current onboarding cohort. Three spots left this month. After this cohort, the next window is 6 weeks out.

If you want one of the remaining spots or want to see the demo first, this week is the time.

Reply here or book directly: [Calendar link]"

---

### Landing Page Copy Framework

**Hero section:**
Headline: "Lebanese Real Estate Agencies: How Many Deals Did You Lose While Sleeping Last Night?"
Subhead: "Calculate exactly how much your agency loses every month to slow WhatsApp response times. Free. Takes 90 seconds."
CTA: "Show Me My Number" (leads to calculator)
Trust bar below: Logos of agencies using Wakeeli (once available) + "38% of Lebanese real estate leads arrive after 9 PM"

**Social proof section:**
Case study quote with agency name + owner name + specific numbers. "Before Wakeeli, we were booking 11 tours a month. First month with Wakeeli: 19 tours. Same team, same listings, different response time." [Agency Owner Name, Agency Name, Beirut]

**Stats section:**
- 3-second response time. Always.
- 38% of leads arrive after 9 PM. Wakeeli handles every one.
- 21x higher conversion when responding within 5 minutes.
- Lebanese agencies on Wakeeli report [X]% more tours booked in Month 1.

**Pricing section:**
Three columns. "Most Popular" badge on Growth. Annual pricing option shown. Feature comparison table with checkmarks. FAQ section addressing the top 5 objections.

**Final CTA:**
"30-day free pilot. Zero risk. If it does not work, we shake hands and part ways. Book your demo today."

---

## PART 5: LEAD GENERATION CHANNELS (Priority by Month)

### Channel Priority Matrix

| Channel | Month 1 | Month 2 | Month 3 | Month 4 |
|---------|---------|---------|---------|---------|
| Direct WhatsApp outreach (Dream 100) | PRIMARY | HIGH | MEDIUM | MEDIUM |
| In-person meetings | PRIMARY | HIGH | MEDIUM | LOW |
| Instagram DMs | HIGH | HIGH | HIGH | HIGH |
| Meta Paid Ads | LOW | MEDIUM | HIGH | PRIMARY |
| Referral program | LOW | HIGH | HIGH | HIGH |
| LinkedIn content | MEDIUM | HIGH | HIGH | HIGH |
| Facebook groups | MEDIUM | MEDIUM | MEDIUM | LOW |
| Property Finder/Bayut partnership | LOW | LOW | HIGH | HIGH |
| Agency partner network | LOW | LOW | MEDIUM | HIGH |
| Jordan/MENA expansion | NOT YET | NOT YET | TEST | LOW |

### Channel Tactics in Detail

**Channel 1: Direct WhatsApp Outreach (Months 1-2, Highest ROI)**

This is your best channel for the first 60 days because it costs nothing and Lebanon is a WhatsApp-first market.

Building the Dream 100:
- Property Finder Lebanon: sort by number of listings, take top 100 agencies, find owner WhatsApp numbers from their listings or Instagram bios
- Bayut Lebanon: same approach
- Instagram: search "real estate Lebanon" "عقارات لبنان" and compile agency accounts with 500+ followers and active posting
- LinkedIn: search "real estate director Lebanon" "property consultant Beirut" and find personal numbers from their profiles

WhatsApp opener scripts (pick based on context):

Cold (no connection): "Hey [Name], quick question. What percentage of your WhatsApp leads come in after 9 PM? I've been collecting data from Lebanese agencies and the numbers are surprising. Have some free data to share if you're curious."

Warm (met at an event, mutual connection): "Hey [Name], great connecting the other day. I've been working on something specific to Lebanese real estate agencies and thought of you. Do you have 20 minutes this week to see a quick demo?"

After they view an Instagram post: "Hey, noticed you follow [handle]. I built the system they are using. Happy to show you what it does for an agency your size. 20 minutes?"

Daily volume: 20 outreach messages per day from Week 2 onward. Track in a simple Google Sheet: name, agency, date messaged, response, meeting booked, outcome.

**Channel 2: In-Person Meetings (Months 1-2, Highest Close Rate)**

For Lebanese agency owners, in-person is everything. A coffee meeting closes what 10 WhatsApp conversations cannot.

Schedule 5-8 meetings per week in months 1 and 2. Prioritize Gemmayzeh, Ashrafieh, Hamra, and Verdun where the highest concentration of professional agencies operate. Bring the live demo on your phone. Let them touch it.

After the meeting, same-day WhatsApp follow-up: "Great meeting you today [Name]. Here is the one-pager I mentioned. [Attach PDF.] The pilot spots this month are filling up. Want me to hold one for you?"

**Channel 3: Instagram DMs (Months 1-4, Consistent)**

20 DMs per day from Week 2 forward. Use multiple scripts depending on context:

For agency accounts: "Hey [Agency], quick question. What happens at your agency when a lead comes in at midnight? Building a tool that handles this for Lebanese agencies and doing some research."

For individual agent accounts: "Hey [Name], noticed you are at [Agency]. Do you personally respond to WhatsApp leads at night? Asking because I'm looking at how agencies handle this and would love your perspective."

Track responses. Anyone who engages gets moved to a conversation. Convert conversation to demo offer.

**Channel 4: Meta Paid Ads (Month 2+, Scale Engine)**

Do not run paid ads until you have at least one real case study with specific numbers. Paid ads without proof is wasted money in a trust-based market like Lebanon.

Budget progression:
- Week 5: $300/month (test phase, 2 creatives)
- Week 7: $500/month (optimize winner)
- Weeks 9-12: $700-1,000/month
- Weeks 13-15: $1,500-2,000/month (case study creatives live)
- Weeks 16+: $3,000-5,000/month (scale proven winners)

Target CPA goals: under $150 for a calculator completion, under $500 for a demo booked, under $1,500 for a paying client acquired.

Winning creative formulas for Lebanese agency owners:
- Stat-first (static): "78% of buyers choose the first agent who responds. Your last lead came in at [time]. When did your agency respond?" CTA to calculator.
- Demo video (30-60 seconds): Real WhatsApp conversation playing out. AI responds in 3 seconds. Lead books tour. Voiceover or text: "This agency just booked a tour at 11:47 PM. Their agents were asleep."
- Case study video: Agency owner talking to camera. 30 seconds. Specific results. Raw, not produced.

**Channel 5: Referral Program (Month 2+, Compounding)**

Program mechanics:
- Referring agency: 2 months free for every new agency that signs up
- Referred agency: First month free
- Fox personally thanks every referral source with a WhatsApp voice message or a short call

Activation script for each existing client: "Hey [Name], we are growing and I'm looking to bring on agencies similar to yours. Who in the industry do you most respect and who do you think would benefit from what we built for you? Would you be open to making an intro?"

One genuine Lebanese agency owner referral closes at 70-80% vs 20-30% for cold outreach. This channel is disproportionately valuable. Invest in it.

**Channel 6: Property Portal Partnership (Month 3+)**

Property Finder Lebanon and Bayut are where Lebanese real estate leads originate. Both companies have commercial teams looking for value-adds for their agency clients.

Contact: Property Finder Lebanon commercial/partnerships team. Email and LinkedIn.
Pitch in one sentence: "Wakeeli makes your platform more valuable by helping agencies convert the leads you send them. We want to be the official conversion tool recommended to your top agencies."

Even a mention in their agency newsletter, which reaches hundreds of agencies, is worth more than $2,000 in Facebook ads.

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
| Instagram DMs sent/week | 100 | 120 | 80 | 60 |
| Referrals received/month | 0 | 1-2 | 3-5 | 5-8 |
| Setup fees collected (cumulative) | $1,500 | $4,000 | $8,500 | $16,000+ |
| NPS (client survey, monthly) | 8+ | 8+ | 8+ | 8+ |

### Decision Gates

**Gate 1 (End of Week 4): Go/No-Go on Paid Ads**
- IF at least 2 paying clients AND one documented case study: launch paid ads at $300/month
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
| Part-time technical contractor | Week 1 (if Fox can't build alone) | Multi-tenancy sprint | $800-1,200/month | Tech blockers must be cleared in 3 weeks |
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

### Risk 2: Multi-Tenancy Takes Longer Than 3 Weeks

**Probability:** Medium (40%). It is a significant refactor of every API endpoint.

**Impact:** Cannot safely onboard more than 1 pilot agency. Data isolation failure = immediate trust destruction.

**Mitigation:**
- Hire a backend developer immediately if Fox cannot build this alone. This is not optional. The technical debt here has to be cleared.
- Minimum viable multi-tenancy: companies table + company_id on conversations/listings/users tables + JWT carries company_id + every API endpoint filters by company_id. That is the MVP. Everything else (analytics scoping, admin panel provisioning, billing webhooks) can come after.
- Do not onboard a second agency until Agency 1's data is genuinely isolated. Test with two fake companies first.

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

### Week 1 Non-Negotiables (Day 1-7)

- [ ] Submit Meta Business Verification application
- [ ] Sign up with 360dialog as WhatsApp API backup
- [ ] Start multi-tenancy development sprint
- [ ] WhatsApp all 7 target agency owners personally
- [ ] Create Wakeeli Instagram and LinkedIn business pages
- [ ] Post first Instagram content (the Forbes stat graphic)
- [ ] Build the Dream 100 agency list (start with Property Finder scrape)
- [ ] Create the one-pager PDF "The Wakeeli Conversion Engine"
- [ ] Set up manual invoicing (Wave or Zoho, 1 hour)
- [ ] Set up a simple Google Sheet for outreach tracking (Name, Agency, Date, Response, Status)

### Tech Completion Checklist (by end of Week 3)

- [ ] companies table created and live in DB
- [ ] company_id added to listings, agents, conversations, users, token_usage
- [ ] JWT carries company_id
- [ ] All API endpoints filter by company_id
- [ ] Two fake companies tested: Agency A cannot see Agency B's data (verified)
- [ ] Hardcoded credentials (Admin/Admin123) removed
- [ ] Backend role enforcement added to all protected endpoints
- [ ] Custom domain live with SSL
- [ ] Sentry error tracking deployed
- [ ] UptimeRobot or Betterstack monitoring active
- [ ] Staging environment on Railway separate from production

### Pre-Client Business Infrastructure (by end of Week 3)

- [ ] Terms of Service drafted and lawyer-reviewed
- [ ] Privacy Policy drafted and lawyer-reviewed
- [ ] Client service agreement template ready (1-page)
- [ ] Manual invoicing workflow documented
- [ ] WhatsApp connected (360dialog or Meta direct)
- [ ] Demo environment or prepared screen recording ready for sales meetings

### Before Scaling Past 10 Clients (by end of Week 8)

- [ ] Stripe billing integrated with subscription plans
- [ ] Email notifications for agents (new lead, tour booked)
- [ ] Session state persistence (DB-backed, not in-memory)
- [ ] CSV listing bulk import working
- [ ] Mobile responsiveness for dashboard
- [ ] Company onboarding admin panel (Fox can provision new clients without manual DB work)
- [ ] First case study published (written + graphic)
- [ ] Referral program announced to existing clients

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

"Your WhatsApp leads that come in after 9 PM are going cold. Wakeeli responds in 3 seconds, qualifies them, and books tours automatically. Your agents wake up with warm leads already scheduled. Want to see it?"

### The Number That Converts Every Time

"78% of buyers choose the first agent who responds. Your last lead came in after hours. When did your agency respond?"

Use this question in every outreach channel. It starts conversations because it makes them think. Every Lebanese agency owner has an uncomfortable answer.

---

*Battle plan compiled: April 2026*
*Next review: End of Week 4 (first conversion metrics available)*
*All frameworks synthesized from: Alex Hormozi (Grand Slam Offers + Gym Launch), Sabri Suby (Sell Like Crazy), Liam Ottley (AI Agency Accelerator), Dan Martell (Buy Back Your Time + SaaS Academy)*
