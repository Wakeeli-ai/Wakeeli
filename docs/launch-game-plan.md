# Wakeeli Launch Game Plan

**Date:** April 1, 2026
**Prepared for:** Fox
**Goal:** First paying client in 8 weeks.
**Status:** Execution document. Not theory. Not a gap analysis. Read this, then do the first thing on the list.

---

## 1. CURRENT STATE ASSESSMENT

### What Exists and Works

| Component | Status | Notes |
|-----------|--------|-------|
| Admin dashboard | Deployed on Railway | Functional. Needs real data after multi-tenancy. |
| WhatsApp bot backend | Code complete | Not connected to Meta. Last mile is missing. |
| Super-admin dashboard | Built, not deployed | Deploy this week. |
| AI conversation engine | Solid | 5-stage flow. Session memory loss on restart is the risk. |
| Database schema | Incomplete | No multi-tenancy. This is the #1 blocker. |
| Authentication | Broken | Hardcoded Admin/Admin123 and Agent/Agent123. Cannot ship. |
| API security | Partial | JWT works but backend doesn't enforce roles. |
| Deployment infra | Production-grade | Railway is fine. Custom domain needed. |

### The Three Hard Blockers (Nothing Ships Without These)

1. **Multi-tenancy not implemented.** Agency A would see Agency B's leads. This is a data breach, not a bug.
2. **WhatsApp not connected to Meta.** The AI has no channel. Start Meta Business Verification today. It takes 2 to 7 days minimum and cannot be rushed.
3. **No billing infrastructure.** No way to charge anyone. Paddle supports Lebanon directly. This is the path.

### What Fox Has That Most Founders Don't

- Real WhatsApp transcripts from all 7 target agencies. This is intelligence competitors cannot buy.
- A working product. Most founders at this stage have a Figma mockup.
- Seven warm prospects who are already living the problem.

---

## 2. WEEK-BY-WEEK EXECUTION PLAN

### WEEK 1: April 1 to 7. Start the Clock on Everything External.

The theme: start every task that has an external dependency or waiting period. These cannot be rushed. Starting them now buys the most time.

**What to Build**
- Deploy super-admin dashboard to Railway. One environment variable, one push.
- Remove hardcoded credentials. Replace Admin/Admin123 and Agent/Agent123 with DB-only auth. Estimated: 1 to 2 days.
- Set up a staging branch and environment on Railway. Separate from production. One bad push should never touch live clients.
- Register a custom domain. `wakeeli.app` or `wakeeli.com`. Check availability now. Get Cloudflare in front of it for DNS and SSL.
- Set up Sentry on both frontend and backend. Free tier covers early stage.
- Set up UptimeRobot for uptime alerts. Free.

**What Fox Does Personally**
- Start Meta Business Verification TODAY. Go to business.facebook.com. Create a Meta Business Manager account if not done. Submit: Lebanese commercial register extract (Segel Tejari), tax registration number from Ministry of Finance (Raqam al-Kayd al-Daribiy), and a business utility bill showing the company name. All three together is the strongest submission. Lebanese Arabic documents are accepted. Do not wait for this.
- Create a Paddle account at paddle.com. Submit Lebanese company documents (commercial registration, owner ID, business address, USD bank account). Paddle explicitly supports Lebanon as a seller country. This is the billing path. Stripe does not support Lebanon without a foreign entity.
- Identify which of the 7 agencies Fox has the warmest personal connection with. Not the most impressive. The most forgiving. This is client 1. Text or call that person this week. No pitch. Just reconnect.

**What Lexy/Workers Handle**
- Research domain availability for wakeeli.app, wakeeli.com, getwakeeli.com.
- Draft the Paddle account submission checklist with required Lebanese documents.
- Pull the Meta Business Verification step-by-step flow with current screenshots.

**Deliverables by End of Week**
- Meta Business Verification submitted and in review.
- Paddle account application submitted.
- Staging environment live on Railway.
- Hardcoded credentials removed from codebase.
- Custom domain registered and pointing to Railway.
- Sentry and UptimeRobot active.

**Dependencies and Blockers**
- Meta verification can take 2 to 30 days. Starting it now is non-negotiable.
- Paddle onboarding typically takes 1 to 3 business days.
- Everything else in Week 1 is in Fox's control.

---

### WEEK 2: April 8 to 14. Database Multi-Tenancy Phase 1.

The theme: database changes first. Do not touch the application layer until the DB migration is done and verified.

**What to Build**

Step 1: Create the `companies` table.
```sql
CREATE TABLE companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR NOT NULL,
  slug VARCHAR UNIQUE NOT NULL,
  whatsapp_phone_number_id VARCHAR,
  whatsapp_token TEXT,
  whatsapp_provider VARCHAR DEFAULT 'meta_cloud',
  plan VARCHAR DEFAULT 'starter',
  status VARCHAR DEFAULT 'trial',
  trial_ends_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

Step 2: Add `company_id` as nullable to every table. One migration per table or all in one. Nullable first, no downtime.
- `listings`
- `agents`
- `conversations`
- `messages`
- `users`
- `token_usage`

Step 3: Insert one row into `companies` for the current dev/test state. Backfill all existing rows with that company ID.

Step 4: Add NOT NULL constraints and FK references after backfill. Use `NOT VALID` to avoid table locks. Validate separately.

Step 5: Create indexes CONCURRENTLY on every `company_id` column.

Step 6: Create a Postgres app role with `NOBYPASSRLS`. This is critical. Superusers bypass Row Level Security silently. Switch the `DATABASE_URL` in Railway to this role after RLS is set up.

Step 7: Enable RLS on all tables and create isolation policies using session variables. The policy: `company_id = current_setting('app.current_company_id')::uuid`.

**Critical RLS rules:**
- Use `SET LOCAL` not `SET`. Connection pools reuse connections. `SET LOCAL` scopes the variable to the current transaction only. `SET` leaks tenant context across requests. This is the #1 production bug in every multi-tenant RLS implementation.
- Add `WITH CHECK` clauses to every policy. Otherwise inserts without `company_id` succeed silently and create orphaned rows visible to nobody.
- Test with `app_user`, not with the postgres superuser. RLS bypasses silently for superusers. Every test you run as superuser is a false negative.

**What Fox Does Personally**
- Check Meta verification status. If stuck in review, submit a support ticket referencing case number.
- Reconnect with first target agency contact. Coffee or WhatsApp message. No pitch yet.
- Begin draft of Terms of Service and Privacy Policy. Use a Lebanese startup lawyer or adapt a template. Meta requires ToS and Privacy Policy to complete WhatsApp Business API setup. Do not skip this.

**What Lexy/Workers Handle**
- Generate the Alembic migration files for company_id columns across all tables.
- Draft ToS and Privacy Policy first version based on Lebanese data law requirements and Meta's WhatsApp Business Policy requirements.

**Deliverables by End of Week**
- `companies` table created.
- `company_id` on all tables, backfilled, constrained.
- RLS enabled and policies in place on all tenant-scoped tables.
- App Postgres role with NOBYPASSRLS active.
- Cross-tenant isolation tested manually: query as tenant A, confirm tenant B data is invisible.
- Meta verification status known.

**Dependencies and Blockers**
- Meta verification still in progress. Nothing to do but wait.
- Paddle onboarding should complete this week. Check status.

---

### WEEK 3: April 15 to 21. Application Layer and Auth Fixes.

The theme: wire the database changes into the application. Every API endpoint must respect company context.

**What to Build**
- Update all SQLAlchemy models to include `company_id` field.
- Add FastAPI auth middleware that extracts `company_id` from JWT or falls back to DB lookup for old tokens. Old tokens continue to work. No forced re-login.
- Add `SET LOCAL app.current_company_id` to the DB session dependency. Every request sets this before any query runs.
- Update every write operation (INSERT, UPDATE) to include `company_id` from request context. This touches every endpoint that creates or modifies data.
- Add backend role enforcement middleware. Frontend hides admin routes. Backend must independently verify role on every request. Any agent with Postman currently accesses all analytics and listings endpoints.
- Update JWT generation to include `company_id` claim in the token payload.

Estimated effort: 15 to 28 hours of focused work. 3 to 5 days for a solo developer. Budget 5 full days.

**What Fox Does Personally**
- Check Meta verification. If approved, proceed to WhatsApp setup immediately.
- First informal demo call or meeting with the warm contact from Week 1. Show them the admin dashboard. Walk through the flow. Do not pitch. Ask what frustrates them most about managing WhatsApp leads today.
- Sign off on ToS and Privacy Policy drafts. Get a lawyer to review for 1 to 2 hours, not a full engagement.

**What Lexy/Workers Handle**
- Review all existing API endpoint files and list every one that does not filter by `company_id`. Produce a checklist.
- Draft the client service agreement template. One-page MSA: what Wakeeli provides, what the agency pays, data ownership, 30-day cancellation, SLA terms.

**Deliverables by End of Week**
- All API endpoints filter by `company_id`.
- JWT carries `company_id` claim.
- Backend role enforcement active on admin routes.
- No hardcoded credential paths remaining.
- Multi-tenancy integration test: two fake companies, confirm complete data isolation.
- ToS and Privacy Policy reviewed and finalized.

**Dependencies and Blockers**
- Meta verification must be approved before Week 4 work proceeds.
- If Meta is delayed past this week, begin 360dialog parallel track (see Risk Register).

---

### WEEK 4: April 22 to 28. WhatsApp Goes Live.

The theme: connect the last mile. The AI gets its channel.

**What to Build (assuming Meta verification is approved)**
- Set `WHATSAPP_TOKEN` (permanent system user token, not the 24-hour temporary one), `WHATSAPP_PHONE_NUMBER_ID`, and `WHATSAPP_VERIFY_TOKEN` in Railway production environment variables.
- Set the webhook URL in Meta App Dashboard: `https://yourdomain.com/api/whatsapp/webhook`.
- Complete the webhook subscription. Note: in Meta's newer App Dashboard, adding a phone number does NOT automatically subscribe the app to WABA events. You must manually register the subscription. If you skip this, webhooks silently fail to fire even when the URL shows as verified.
- Test with a real phone number end-to-end. Message in, AI responds, message out.
- Submit the 6 required WhatsApp template messages for Meta approval:
  1. `FIRST_CONTACT` (new inbound lead greeting)
  2. `TOUR_CONFIRMATION`
  3. `TOUR_REMINDER_24H`
  4. `TOUR_REMINDER_1H`
  5. `FOLLOW_UP_AFTER_TOUR`
  6. `NEW_LISTING_ALERT`
  Templates typically approve within a few hours. Allow 24 to 48 hours.
- Add HMAC-SHA256 signature verification to the webhook handler. Meta signs every POST with your App Secret in `X-Hub-Signature-256`. This is required for security and for Meta compliance.
- Add session state persistence. Move conversation context from in-memory to DB. Server restarts currently destroy all active conversations.

**Company Onboarding Flow in Super-Admin Panel**
- Fox needs a way to create a new company, assign a WhatsApp number, and provision the first admin user. Currently 100% manual with no tools. This is the minimum viable onboarding for the first 3 clients. It does not need to be self-service yet. It just needs to exist.

**What Fox Does Personally**
- Schedule a formal demo with first target agency. Have the WhatsApp flow live and working. Show them: a fake lead messages in, AI responds in Lebanese Arabic, qualifies the lead, matches to a listing, books a tour. All live.
- Have the service agreement and pilot offer ready. The offer: 30-day paid pilot for $150 (or equivalent in fresh USD). Pre-agreed success metric: "Every new WhatsApp lead gets a response within 2 minutes, 24/7. After 30 days, we review the numbers together."
- The pilot is paid, even at this small amount. Unpaid pilots have 95% failure-to-convert rates. The fee creates buy-in.

**What Lexy/Workers Handle**
- Draft the 6 WhatsApp template messages in both English and Lebanese Arabic.
- Set up the manual invoicing workflow using Wave or Zoho Invoice for the first few clients while Paddle is being configured.

**Deliverables by End of Week**
- WhatsApp connected to Meta and tested end-to-end.
- Template messages submitted and approved.
- Session persistence working.
- Company onboarding flow in super-admin panel functional.
- First demo delivered.
- Pilot offer on the table with first target agency.

**Dependencies and Blockers**
- Meta verification must be complete. If it is not by April 22, the WhatsApp connection slides to Week 5 and everything shifts right.
- Template approvals are fast. Not a blocker in practice.

---

### WEEK 5: April 29 to May 5. Billing and Critical Infrastructure.

The theme: be ready to take money. Set up the infrastructure that makes Wakeeli a real business.

**What to Build**
- Complete Paddle billing integration.
  - Create subscription plans: Starter ($99/month), Growth ($249/month), Agency ($499/month).
  - Set up Paddle webhooks for: `subscription.activated`, `subscription.cancelled`, `transaction.completed`, `transaction.payment_failed`.
  - When `subscription.activated` fires: set `companies.status = 'active'`.
  - When `subscription.cancelled` fires: set `companies.status = 'suspended'` after grace period.
  - For local Lebanese clients who will not pay via card: manual invoicing in USD via Wave. Issue invoice, collect via SWIFT wire or cash, manually set `status = 'active'` in super-admin panel. This is the reality of the Lebanese market.
- Agent email invitation flow.
  - When an admin creates an agent in the dashboard, send an invitation email with a password setup link.
  - Use Resend for email delivery. Free tier covers 3,000 emails/month.
  - No agent should receive credentials via WhatsApp or manual copy-paste.
- Email notifications for agents.
  - New lead assigned: notify agent by email.
  - Tour booked: notify agent by email.
  - Lead escalated to human: notify agent by email with urgency.
- Rate limiting on API endpoints.
  - Use `slowapi` in FastAPI. Add to WhatsApp webhook specifically. Unprotected webhooks are flood attack targets.
- Verify Railway PostgreSQL backup policy. Confirm automated backups are running. Test a restore.

**What Fox Does Personally**
- First pilot contract signed if not done in Week 4. If the agency is still deciding, set a deadline: "We start Monday or we start next month. I have another agency asking."
- Onboarding call scheduled. Fox handles this personally for the first client. No tutorial link. Sit with them (in person or on video) and set everything up together.

**What Lexy/Workers Handle**
- Write the 3 to 5 page client user guide. Covers: adding listings, inviting agents, reading the dashboard, understanding what the AI does and does not do.

**Deliverables by End of Week**
- Paddle billing live. Test subscription creation and cancellation.
- Manual invoicing workflow documented for local Lebanese clients.
- Agent invitation email flow working.
- Agent notifications working.
- Rate limiting in place.
- Backup policy verified.
- First pilot contract signed.

---

### WEEK 6: May 6 to 12. Listing Bulk Import and First Client Setup.

The theme: solve the day-one operational pain. Lebanese agencies have 50 to 500 listings. One-by-one manual entry is a deal killer.

**What to Build**
- CSV/Excel bulk listing import.
  - Accept a CSV with mappings for: area, property type, bedrooms, price, description.
  - Map columns to the listings data model.
  - Handle duplicates: check by address or unique external ID.
  - Show a preview before import. Let admin confirm before committing.
  - Show import results: X imported, Y skipped (duplicates), Z errors.
  - This is the single most impactful feature for Day 1 client experience.
- WhatsApp message delivery error handling.
  - `send_whatsapp_message()` needs retry logic with exponential backoff.
  - Log delivery failures. Silent failures in production mean lost leads with no trace.
  - Add delivery confirmation tracking.
- Staging environment testing.
  - Before anything goes to production from this point, it goes to staging first.
  - Staging gets its own Meta App and test WhatsApp number.

**What Fox Does Personally**
- Onboard first client. This is a white-glove process:
  1. Create their company in super-admin panel.
  2. Connect their WhatsApp Business number (help them through the Meta setup if needed, or use Wakeeli's shared number initially).
  3. Import their listings via CSV (Fox prepares the CSV with them).
  4. Invite their agents.
  5. Test with a real message. Watch the AI respond live.
  6. Define the success metric together: "We will track how many leads came in, how many got a response in under 2 minutes, and how many booked a viewing. In 30 days we review."
- Week 1 check-in with first client. Are agents using it? Any questions? What is confusing?

**What Lexy/Workers Handle**
- Build the CSV import UI and backend endpoint.

**Deliverables by End of Week**
- CSV bulk import working.
- First client fully live on Wakeeli.
- First client's listings imported, agents invited, WhatsApp active.
- WhatsApp message error handling and retry in place.

---

### WEEK 7: May 13 to 19. Stability and First Client Results.

The theme: make the first client successful. Their results are your sales collateral.

**What to Build**
- Mobile responsiveness for the dashboard. Agents are in the field, not at desks. If checking leads requires a laptop, they will not check leads.
- Demo environment. A sandboxed tenant with fake data and a test WhatsApp number. Use this for every sales demo going forward. Never demo on a live client's account.
- Database session persistence for conversation context. If this is not done yet from Week 4, it must be done now. A server restart that kills active conversations is not acceptable in production.

**What Fox Does Personally**
- Week 2 check-in with first client. Pull the numbers:
  - How many leads came in via WhatsApp?
  - How many got a response in under 2 minutes vs. before?
  - How many booked a viewing?
  - How many hours did agents save not doing manual qualification?
- Document these numbers. This is the case study that sells client 2 and 3.
- Begin approach to second target agency. Use the case study. "I'm working with [Agency Name]. In the first two weeks, they went from responding to leads in 4 hours to under 2 minutes, 24/7. Can I show you the same thing?"

**What Lexy/Workers Handle**
- Pull and format the first client metrics into a one-page case study.
- Research which of the remaining 6 agencies has the highest public presence and would be the best name-drop for future clients (RayWhite is internationally recognized; research their Lebanon operation size).

**Deliverables by End of Week**
- Mobile-responsive dashboard.
- Demo environment ready.
- Week 2 first-client check-in complete with documented results.
- Second agency outreach initiated.
- Case study drafted.

---

### WEEK 8: May 20 to 26. Second Client and Scale Preparation.

The theme: convert the first proof point into the second client. Start building the machine.

**What to Build**
- Google Calendar integration for tour scheduling. This is the most-requested feature from agents in similar PropTech implementations. Agents connect their calendar, the AI proposes slots that are actually free.
- Tour reminder automation: 24-hour WhatsApp reminder, 1-hour reminder. This alone reduces no-shows significantly.
- Platform health dashboard for Fox. Cross-company metrics: total leads, AI message volume, Anthropic spend, active tenants, MRR. Fox needs this to run the business.

**What Fox Does Personally**
- Deliver formal demo to second target agency.
- Close second pilot contract.
- Begin outreach to third agency.

**Deliverables by End of Week**
- Google Calendar integration live.
- Tour reminders working.
- Fox's super-admin metrics dashboard showing real data.
- Second client pilot contract signed.

---

### WEEKS 9 to 10: May 27 to June 9. Third Client and Automation.

By this point, the product is stable and tested. The focus shifts to repeatable sales and reducing manual onboarding work.

**Build:**
- Self-service company onboarding wizard (so Fox doesn't have to manually create every tenant in the super-admin panel).
- Stripe integration via UK entity if Paddle is proving insufficient for international clients. UK company registration costs GBP 50, takes 2 to 3 days, and unlocks full Stripe access. Use Wise Business as the UK bank account. No UK residency required.
- Lead scoring algorithm (the scoring model is already documented in the ecosystem plan, just needs to be implemented).
- New listing alerts for existing matched leads.

**Fox:**
- Third client onboarded.
- First client completes paid pilot, converts to monthly subscription.
- Begin quarterly plan for pricing increase or tier restructure based on actual usage data.

---

## 3. CRITICAL PATH

These must happen in this order. Nothing can skip the queue.

```
TODAY (April 1)
  Submit Meta Business Verification
  Apply for Paddle account
  |
  V
WEEK 1
  Remove hardcoded credentials
  Set up staging + custom domain
  |
  V
WEEK 2
  Multi-tenancy DB migration (companies table + company_id on all tables)
  RLS policies in place
  |
  V
WEEK 3
  Application layer wired to company context
  Backend role enforcement
  JWT carries company_id
  |
  V
WEEK 4 (requires Meta verification complete)
  WhatsApp webhook connected to Meta
  End-to-end test with real phone number
  WhatsApp templates submitted and approved
  |
  V
WEEK 4-5
  First formal demo with target agency
  Pilot offer signed
  |
  V
WEEK 5-6
  Paddle billing live
  CSV bulk import built
  First client fully onboarded
  |
  V
WEEK 7-8
  First client results documented
  Case study used to close second client
```

**The only item Fox cannot control:** Meta verification timeline. Everything else is internal execution. This is why it starts today.

---

## 4. PARALLEL TRACKS

### Technical Build Track

| Week | Focus |
|------|-------|
| 1 | Hardcoded creds removed, staging live, domain set up |
| 2 | DB migration: companies table, company_id everywhere, RLS |
| 3 | App layer: middleware, JWT, role enforcement |
| 4 | WhatsApp connected, templates live, session persistence |
| 5 | Paddle billing, agent invites, email notifications, rate limiting |
| 6 | CSV bulk import, WhatsApp error handling |
| 7 | Mobile responsiveness, demo environment |
| 8 | Google Calendar, tour reminders, Fox metrics dashboard |
| 9-10 | Self-service onboarding, lead scoring, listing alerts |

### Business and Legal Track

| Week | Focus |
|------|-------|
| 1 | Meta verification submitted, Paddle applied, domain registered |
| 2 | ToS and Privacy Policy drafted |
| 3 | ToS and Privacy Policy lawyer-reviewed and finalized |
| 4 | Client service agreement template finalized |
| 5 | Manual invoicing workflow documented |
| 6 | First pilot contract signed |
| 8 | Second pilot contract signed |
| 9-10 | Evaluate UK company registration if Stripe needed |

**Note on Lebanese company registration:** If Wakeeli is not yet formally registered as a company in Lebanon, do it in parallel with everything else. You need a Segel Tijari (commercial register extract) for Meta verification anyway. Registration at the Ministry of Justice in Lebanon typically takes 2 to 4 weeks through a lawyer. Cost is roughly $300 to $600 in legal fees. This does not block any of the technical work.

### Sales and Outreach Track

| Week | Focus |
|------|-------|
| 1 | Identify warmest contact from the 7 agencies. Reconnect informally. |
| 2-3 | First agency: two touchpoints. Understand their pain. No pitch yet. |
| 4 | First formal demo. Live WhatsApp flow. Pilot offer on the table. |
| 5-6 | Pilot contract signed. Onboarding begins. |
| 7 | Document first results. Build case study. |
| 7-8 | Approach second agency. Lead with case study, not demo. |
| 8 | Second pilot signed. |
| 9-10 | Third agency approach. By now the conversation is shorter. |

### Content and Marketing Track

This is not a priority for weeks 1 to 6. The product must work first. After the first client is live:

| Week | Focus |
|------|-------|
| 1-5 | Nothing. Build the product. |
| 6 | Write 3 to 5 page client user guide. |
| 7 | Draft case study from first client results. |
| 8 | LinkedIn post announcing Wakeeli (Fox's personal account). No paid ads. |
| 9 | One-pager PDF for sales conversations. |
| 10 | Website copy finalized and published. |

Website is a credibility signal, not a lead source at this stage. Prioritize it after the first client, not before.

---

## 5. FIRST CLIENT STRATEGY

### Which Agency to Approach First

Fox has the WhatsApp transcripts of all 7 agencies. The agency with the longest response times, the most unanswered leads, and the most disorganized follow-up is the easiest sell. They feel the pain the hardest.

**Do not start with RayWhite.** They are internationally franchised, have a more complex approval process, and likely have an existing CRM. They are client 3 or 4, not client 1.

**Prioritize in this order:**
1. The agency where Fox has a personal connection to the owner or a senior agent. Personal trust closes deals that demos cannot.
2. Among agencies with equal personal warmth: the one whose transcripts showed the most missed leads and slowest response times. Most pain equals easiest sell.
3. Avoid agencies that appear to already use a CRM or dedicated WhatsApp tool. They have to migrate, not just add. Save them for later.

**Likely best candidates based on typical Lebanese agency profiles:** C Properties and Spectrum tend to be smaller operations where the owner is the decision-maker and decisions happen fast. Pro-Founders and Beirut Commune may be more entrepreneurially minded and open to tech. JSK is already known in the context of Lebanon's payment landscape, suggesting they are an established mid-tier firm. Use Fox's direct knowledge of the transcript data to rank them.

### What to Offer the First Client

**The Offer:** 30-day paid pilot for $150. After 30 days, the full Growth plan at $249/month kicks in automatically unless they cancel with 7 days notice.

**Why paid even at $150:** Unpaid pilots have a 95% failure-to-convert rate. A $150 commitment creates buy-in from the owner. If they won't commit $150, they will not commit $249/month. The amount is a filter, not a revenue target.

**What to promise:** One specific, measurable thing. "Every WhatsApp lead your agency receives will get a response in under 2 minutes, 24/7, including weekends and nights. Your agents wake up to qualified leads, not cold inquiries."

Do not promise: tours booked, deals closed, revenue generated. These depend on agent behavior you cannot control. Promise what the product controls directly.

**Frame it as:** "This is a 30-day evaluation. We set a measurable goal together. If it works, we continue. If it doesn't, you owe me nothing more and we part on good terms." This removes all objection to trying it.

### What They Need to See Before Saying Yes

1. A live demo that works. Not slides. Not a video. A real WhatsApp message going in and the AI responding in Lebanese Arabic, qualifying the lead, and showing listings. This takes 5 minutes and closes more deals than any presentation.
2. Their own pain reflected back to them. Use the transcript data Fox already has. "I looked at how inquiries come in for agencies like yours. On average, a lead goes unanswered for 3 to 4 hours. After 10 minutes, 70% of leads have already moved on. Wakeeli responds in under 30 seconds, always." This is not generic. This is their situation.
3. A believable path to ROI. One extra deal per month at a typical Lebanese commission covers 12 months of Wakeeli. The math is simple. Make them say it, not Fox. "If Wakeeli helped you close one extra deal per quarter, would that be worth $249/month?" The answer is always yes.
4. Certainty that their data is safe. Lebanese agencies are wary of giving client data to a new platform. Explain: their data is isolated, they can export it any time, it is not shared with any other agency. Show them the dashboard is theirs alone.

### Onboarding Flow Once They Say Yes

Day 1 (onboarding call, 60 to 90 minutes with Fox personally):
1. Create their company in super-admin panel.
2. Connect their WhatsApp Business number. Two options: connect their existing WhatsApp Business App number (requires deregistering it from the app first), or use a new dedicated number Fox provisions for them. The second option is cleaner and avoids disrupting their current operations.
3. Import their listings via CSV. Fox prepares the CSV template and fills it with them, or they send over their listing data and Fox imports it.
4. Invite their agents (2 to 3 for a typical small Lebanese agency).
5. Test together. Owner sends a message to the WhatsApp number. AI responds. Owner sees the response in the dashboard.
6. Define the success metric. Write it down. Both parties agree.

Week 1 check-in (30 minutes):
- What is working?
- What is confusing?
- Any Arabic dialect issues? (The AI must respond in Lebanese Arabic, not formal MSA. This is critical for Lebanese leads.)
- Any listing data corrections needed?

Week 2 check-in (30 minutes):
- Pull the numbers. How many leads? How many responded in under 2 minutes? How many booked viewings?
- Show them the dashboard data. Make the value visible.

Week 4 review (before pilot ends):
- Full review of pilot results vs. agreed metric.
- Present the Growth plan renewal. "Here's what happened in 30 days. Here's what continuing looks like."

---

## 6. BUDGET ESTIMATE

### Ongoing Monthly Costs (Per Client, After Launch)

| Cost | Amount | Notes |
|------|--------|-------|
| Anthropic Claude API | $15 to $40/month per agency | Based on 100 to 300 AI conversations/month at roughly 700 tokens per exchange. Scale with usage. |
| WhatsApp API (Meta) | $10 to $50/month per agency | Utility messages ~$0.009 each. Service conversations (within 24h window, customer-initiated) are free. Marketing templates ~$0.034. Estimate 500 to 1,500 messages/month. |
| Railway (backend + DB) | $5 to $20/month | Scales with traffic. Free tier covers early stage development. |
| Resend (email) | $0 to $20/month | Free tier: 3,000 emails/month. First few clients easily covered free. |
| Sentry (error tracking) | $0 | Free tier covers early stage. |
| UptimeRobot | $0 | Free tier covers early stage. |
| Custom domain | $1.25/month | Roughly $15/year. |
| Cloudflare | $0 | Free tier covers DNS and SSL. |
| Paddle fees | 5% + $0.50 per transaction | Applied to every subscription payment. On a $249 plan: ~$13 per month per client. |

**Estimated cost to serve one agency client: $30 to $120/month.**
At $249/month revenue per client, gross margin is 50 to 88%.

### Startup and One-Time Costs

| Item | Cost | Notes |
|------|------|-------|
| Domain registration | $15 to $50 | One-time. Check wakeeli.app, wakeeli.com. |
| Lebanese company registration | $300 to $600 | If not already registered. Required for Meta verification. |
| Lawyer for ToS and Privacy Policy | $300 to $800 | 2 to 3 hours of Lebanese startup lawyer time. |
| 360dialog (if Meta Cloud API takes too long) | 50 EUR/month | Backup option only. Not required if Meta direct succeeds. |
| UK company registration (if Stripe needed) | ~$200 total | GBP 50 at Companies House, Wise Business account. Optional. Paddle covers this need without a UK entity. |

**Total startup budget required: $600 to $1,600.**
This is extremely lean. There is no hiring, no office, no paid acquisition. The product is already built.

### Revenue Projection (Conservative)

| Month | Clients | MRR |
|-------|---------|-----|
| Month 1 (May) | 1 pilot at $150 | $150 |
| Month 2 (June) | 1 paying + 1 pilot | $249 + $150 = $399 |
| Month 3 (July) | 2 paying + 1 pilot | $498 + $150 = $648 |
| Month 4 (August) | 3 paying clients | $747 |
| Month 6 (October) | 5 clients, mixed plans | $1,500+ |

This is the floor if Fox closes one new client per month from the 7-agency list. The ceiling depends on whether any agency scales up to the Agency plan ($499) or if referrals kick in from the first few satisfied clients.

---

## 7. RISK REGISTER

### Risk 1: Meta Business Verification Takes Longer Than 7 Days

**Probability:** Medium. Lebanon is not a sanctioned country but falls into a manual review bucket for MENA businesses.

**Impact:** High. WhatsApp connection is blocked. The product has no channel.

**Mitigation:**
- Start verification on Day 1 (today).
- If stuck beyond 7 days, open a Meta Business Support ticket referencing the case number.
- Parallel track: apply to 360dialog simultaneously. Their embedded signup gets a WABA live in under 5 minutes at the cost of ~50 EUR/month. If Meta takes 3 weeks, 360dialog is the bridge. It can be switched to Meta direct later.
- The codebase already supports multiple WhatsApp providers per the ecosystem plan. No rebuild needed to switch.

**Decision point:** If Meta verification is not approved by April 14 (end of Week 2), activate 360dialog immediately.

### Risk 2: Paddle Rejects the Lebanese Business Application

**Probability:** Low. Paddle explicitly lists Lebanon as a supported seller country. But document requirements must be met.

**Impact:** High. No billing infrastructure.

**Mitigation:**
- Prepare strong documentation: commercial registration, owner ID, business address proof, USD bank account.
- If Paddle rejects: register a UK company via Companies House (GBP 50, 2 to 3 days, remote), open Wise Business account, and sign up for Stripe or Paddle under the UK entity. Total additional time: 1 week. Total additional cost: under $200.
- For the first 3 clients, manual invoicing (Wave or PDF) is always the fallback. The first client does not need Paddle to exist.

**Decision point:** If Paddle application is not approved by April 14, execute the UK company track in parallel.

### Risk 3: Multi-Tenancy Takes Longer Than 5 Days

**Probability:** Medium. The estimate is 15 to 28 hours. Real-world velocity depends on codebase cleanliness.

**Impact:** High. Cannot onboard any client until this is done.

**Mitigation:**
- Do not scope creep during this phase. Multi-tenancy first, all other features after.
- If a critical endpoint is missed and data leaks between tenants in testing, catch it before production by running all tests as `app_user`, not the postgres superuser.
- Buffer Week 3 as overflow time for multi-tenancy if Week 2 runs long.

### Risk 4: Lebanese Agencies Pay Slowly or Not at All

**Probability:** Medium to High. Lebanese business culture in the post-2019 banking crisis context means USD cash or wire is common. Card payments are unreliable. Some agency owners will ask for indefinite free extensions.

**Impact:** Medium. Revenue is delayed. Not fatal at this stage.

**Mitigation:**
- Charge even the first pilot. $150 is not about revenue. It is about filtering for serious clients.
- Issue USD invoices payable by wire or cash. Do not offer LBP pricing. Lebanon's currency instability makes LBP pricing operationally painful.
- Structure the pilot contract so the monthly subscription auto-renews unless cancelled. Explicit opt-out, not opt-in renewal. This is standard B2B SaaS practice and legally defensible.

### Risk 5: First Client Churns After Pilot

**Probability:** Low if onboarding is done correctly. High if Fox hands them a tutorial link and disappears.

**Impact:** High. Losing client 1 before getting client 2 kills momentum and damages early reputation.

**Mitigation:**
- Fox handles onboarding personally for clients 1 through 5. No exception.
- Week 1 and Week 2 check-ins are non-negotiable. Most churn happens in the first two weeks due to confusion, not product failure.
- Arabic language quality is critical. Lebanese leads write in Lebanese dialect, often mixing Arabic script and Franco-Arab. The AI must match this. Test this specifically with real-world message examples before going live.

### Risk 6: The AI Responds Poorly in Lebanese Arabic

**Probability:** Medium. Claude handles Arabic well but Lebanese dialect and code-switching (Arabic + French + English in one message) requires careful prompt engineering.

**Impact:** High. If the AI sounds like a foreign robot, the agency will not renew.

**Mitigation:**
- Test the system prompt extensively with real Lebanese lead message patterns before first client goes live.
- Fox has the actual WhatsApp transcripts from the 7 agencies. Use them as test cases. If the AI responds correctly to the 20 most common message patterns in those transcripts, it is ready.
- Add explicit dialect instruction to the system prompt: "Respond in Lebanese dialect Arabic (not formal MSA). Match the language and script of the user's message. If they mix Arabic and French, respond in the same mix."

### Risk 7: A Competing Product Launches in Lebanon Before First Client

**Probability:** Low in the near term. MENA PropTech is active (Nawy, Property Finder, etc.) but none are focused specifically on Lebanese agency WhatsApp AI as of now.

**Impact:** Medium if they have existing relationships.

**Mitigation:**
- Speed of execution is the only defense. Get clients 1 and 2 signed before any competitor has a product to show.
- The 7-agency list is a head start. Fox has already studied their operations. No competitor has this.

---

## 8. QUICK WINS: What Fox Does THIS WEEK

These can all happen by April 7. None require a single line of code.

1. **Submit Meta Business Verification.** This is the longest external dependency. Start at business.facebook.com today.

2. **Apply for Paddle.** Go to paddle.com, create an account, submit the Lebanese company documents. 1 hour of work.

3. **Register a domain.** Check wakeeli.app or wakeeli.com. Register it. Point DNS to Railway. Clients will not take a `wakeeli-ai.up.railway.app` URL seriously.

4. **Review the 7 WhatsApp transcripts.** Rank the agencies by which one is experiencing the most visible lead leakage: slowest response times, unanswered messages, poor follow-up. That is client 1.

5. **Send one message to the warmest contact from that agency.** Not a pitch. A personal message. "Been a while, how's the market?" You are planting the seed, not closing a deal.

6. **Order the lawyer conversation.** Book 2 hours with a Lebanese startup lawyer to review the ToS and Privacy Policy draft. This can happen while the technical work is running.

7. **Deploy the super-admin dashboard.** It is built. Deploying it to Railway is a 15-minute task. Fox should have visibility into the platform immediately.

8. **Take a screenshot of the current admin dashboard.** Before and after documentation for marketing. These screenshots become the demo and eventually the website.

---

## APPENDIX: Key Resources and References

### WhatsApp Business API
- Business Verification: business.facebook.com
- Developer Console: developers.facebook.com
- Message pricing for Lebanon (Rest of Middle East tier): Utility ~$0.0091, Marketing ~$0.034, Service: free within 24h window
- 360dialog (backup BSP): 360dialog.com, ~50 EUR/month per WABA

### Billing
- Paddle (supports Lebanon directly): paddle.com, 5% + $0.50/transaction
- Dodo Payments (supports Lebanon, MoR): dodopayments.com
- UK company registration (if needed): Companies House at companieshouse.gov.uk, GBP 50
- Manual invoicing: Wave at waveapps.com, free

### Hosting and Infrastructure
- Railway: railway.app (current deployment)
- Cloudflare: cloudflare.com (DNS + SSL + CDN, free tier)
- Resend: resend.com (email, 3,000/month free)
- Sentry: sentry.io (error tracking, free tier)
- UptimeRobot: uptimerobot.com (uptime monitoring, free tier)

### Key Metrics to Track from Day One
- Lead response time: target under 2 minutes, 100% of the time
- Lead-to-viewing conversion rate: industry benchmark ~15%, target 25%+
- AI containment rate: percentage of conversations handled end-to-end without human intervention
- Monthly Anthropic API spend: budget $40 per agency at 300 conversations/month
- WhatsApp message delivery rate: target 99%+

---

*This document is the execution plan, not the architecture document. For full technical specs, see ecosystem-game-plan.md. For the full gap analysis, see launch-readiness.md.*

*Last updated: April 1, 2026.*
