# Wakeeli Launch Readiness Gap Analysis

**Date:** April 1, 2026
**Prepared for:** Fox
**Goal:** Identify everything needed before signing the first paying B2B client.

---

## TL;DR

**3 absolute blockers that must be resolved before onboarding any client:**

1. Multi-tenancy is not implemented. All data is in one namespace. Agency A would see Agency B's leads.
2. WhatsApp is not connected to Meta. The AI has nowhere to talk.
3. No billing infrastructure. There is no way to charge anyone.

Everything else is important but workable around. These three are hard stops.

---

## Priority Matrix

### CRITICAL (Blocks First Client)

| Item | What's Missing | Estimated Effort |
|------|---------------|-----------------|
| **Multi-tenant data isolation** | No `company_id` on any table. All agencies share one dataset. Requires: new `companies` table, add `company_id` FK to listings/agents/conversations/users/token_usage, update every API query to filter by company, update JWT to carry company context. | 2-3 weeks |
| **WhatsApp production connection** | Webhook code exists but not wired to Meta. Needs: Meta Business Verification, WhatsApp Business API approval, dedicated phone number per client (or shared number with routing logic), WHATSAPP_TOKEN and PHONE_NUMBER_ID in production env. | 1-2 weeks (Meta approval timeline unpredictable) |
| **Billing infrastructure** | No payment processing. No subscription management. No invoicing. Clients cannot be charged. Options: Stripe Billing, Paddle, or manual invoicing for MVP. | 1-2 weeks (Stripe) or 1 day (manual invoicing) |
| **Remove hardcoded credentials** | Admin/Admin123 and Agent/Agent123 are hardcoded. Every client would use the same backdoor. Must shift to DB-only auth with company-scoped users. | 1-2 days |
| **Backend role enforcement** | Frontend hides admin routes but backend doesn't enforce them. Any agent with Postman can access /analytics, /agents, all listings. Need middleware to check role on every protected endpoint. | 2-3 days |
| **Terms of service and privacy policy** | Required by Meta for WhatsApp Business API. Required by Lebanese law for data processing. Required before any client signs anything. | 2-3 days (lawyer review) |
| **Client service agreement** | No contract template. No SLA. No data ownership terms. Cannot formally onboard a paying client without this. | 2-3 days |
| **Company onboarding flow** | No way for Fox to provision a new client. No admin panel to create a company, assign a phone number, set up listings, invite agents. Currently 100% manual with no tools. | 1 week |

---

### IMPORTANT (Should Resolve Before Second Client)

| Item | What's Missing | Estimated Effort |
|------|---------------|-----------------|
| **Listing bulk import** | Agents currently add listings one by one. Lebanese agencies have 50-500 listings. Need CSV/Excel import. Optional: integration with property.com.lb or OpenSooq. | 3-5 days |
| **Agent email invitation** | No email flow when admin creates an agent account. Agents receive no credentials. Manual credential sharing is insecure. Need invitation email with password setup link. | 2 days |
| **Session state persistence** | AI conversation context lives in memory only. Server restart = all active conversations lose context and start over. Need DB-backed session storage or Redis. | 2-3 days |
| **Email notifications** | No notifications to agents when a new lead is assigned or a conversation needs attention. Agents would have no idea they have work to do. | 2-3 days |
| **WhatsApp message send confirmation** | `send_whatsapp_message()` needs error handling, retry logic, and delivery confirmation tracking. Silent failures in prod = lost leads. | 2 days |
| **Custom domain** | Currently hosted at wakeeli-ai.up.railway.app. Clients expect a branded URL. Need wakeeli.app or similar with SSL. | 1 day |
| **Staging environment** | Auto-deploy directly to production from main. One bad push breaks all clients. Need a staging branch/env for testing before prod. | 1 day |
| **Error tracking (Sentry)** | No crash reporting. Bugs in production are invisible until a client complains. Need Sentry or equivalent in both frontend and backend. | 1 day |
| **Uptime monitoring** | No alerts if the server goes down. Need UptimeRobot, Betterstack, or Railway alerts. | Half day |
| **Database backups** | Railway PostgreSQL has automated backups but the schedule and retention policy are not documented or tested. Need to verify and test restore. | 1 day |
| **Mobile responsiveness** | Dashboard is desktop-first. Agents checking leads on their phone will have a bad experience. | 2-3 days |
| **Rate limiting** | No rate limiting on API endpoints. WhatsApp webhook is unprotected from flood. Need slowapi or nginx rate limiting. | 1 day |
| **Client documentation** | No user guide. Agencies will not know how to manage listings, invite agents, or read the dashboard. | 2-3 days |

---

### NICE-TO-HAVE (Post-Launch Polish)

| Item | What's Missing | Estimated Effort |
|------|---------------|-----------------|
| **Self-service signup** | Agencies sign themselves up without Fox's involvement. Requires multi-tenant onboarding wizard. | 1-2 weeks |
| **Tour reminder automation** | Scheduled WhatsApp messages (4-6 hours before, day before, morning of). Needs APScheduler or Celery. Already in CLAUDE.md spec but not built. | 3-4 days |
| **Post-visit follow-up flow** | Agent-triggered re-engagement after a tour. Not built. | 2-3 days |
| **Data export (CSV)** | No way for clients to export their leads or conversations. Compliance/CRM migration use case. | 1 day |
| **Demo environment** | Isolated sandbox with fake data for sales demos. Easier to sell with a live demo. | 2 days |
| **Advanced listing search** | No map view, no amenity filters, no distance-based search. | 1 week |
| **Feature request pipeline** | No structured way for clients to request features. Notion board or Canny. | Half day |
| **Bug tracking** | No issue tracker linked to codebase. GitHub Issues is free and sufficient. | Half day |
| **Sales collateral** | No pitch deck, one-pager, or case studies. | 2-3 days |
| **OpenSooq or Bayut integration** | Auto-sync listings from major Lebanese/regional portals. | 1-2 weeks |
| **Platform health dashboard for Fox** | Cross-company metrics (total leads, conversion rates, top agencies). Currently only per-company views exist. | 3-4 days |
| **API key auth for WhatsApp webhook** | Currently anyone who knows the URL can POST to the webhook. Need signature verification (Meta HMAC). | 1 day |
| **Horizontal scaling** | In-memory sessions mean only one backend instance. Redis sessions would allow Railway to scale out. | 2-3 days |

---

## Deep Dives on the Three Hard Blockers

### 1. Multi-Tenancy Architecture Gap

**Current state:** The `listings`, `agents`, `conversations`, `messages`, `users`, and `token_usage` tables have no company ownership. Every API query returns all rows regardless of who is asking.

**What happens if you onboard two agencies now:** Agency Horizons logs in and sees Agency Atlas's leads, listings, and conversations. Complete data breach.

**What needs to be built:**
```
companies table:
  id, name, subdomain, whatsapp_phone_number_id,
  whatsapp_token, plan, status, created_at

Add company_id FK to:
  listings, agents, conversations, users, token_usage

JWT payload must include:
  user_id, role, company_id

Every API endpoint must filter by:
  current_user.company_id
```

**Risk if skipped:** Not skippable. This is table stakes for B2B SaaS.

---

### 2. WhatsApp Production Connection

**Current state:** `backend/app/routes/whatsapp.py` has a working webhook handler and message processing pipeline. The AI logic is fully built. But the last mile is missing.

**What needs to happen:**
1. Fox registers a Meta Business Account (if not done already)
2. Create a WhatsApp Business App in Meta Developer Console
3. Go through Business Verification (can take 2-7 days)
4. Get a permanent WhatsApp Business phone number (or use a test number initially)
5. Set the webhook URL to `https://[domain]/api/whatsapp/webhook`
6. Set `WHATSAPP_VERIFY_TOKEN` in Railway env
7. Set `WHATSAPP_TOKEN` (permanent token, not the 24h one) in Railway env
8. Set `WHATSAPP_PHONE_NUMBER_ID` in Railway env
9. Test with a real phone number

**Per-client consideration:** Each agency needs its own WhatsApp Business number unless Wakeeli routes all conversations through one shared number with internal routing. The shared number model is simpler to start. The per-agency number model is cleaner but requires each client to have their own Meta Business Account.

**Recommendation:** Start with one shared Wakeeli WhatsApp number. Route to the right agency by tracking which leads came from which campaign or by asking leads to identify themselves. Per-agency numbers are a V2 feature.

---

### 3. Billing

**Current state:** Nothing. Zero.

**MVP approach (1 day of work):**
- Manual invoicing via Wave, Zoho Invoice, or even a PDF template
- Fox invoices clients monthly
- No automation required for the first 5 clients

**Proper approach (1-2 weeks):**
- Stripe Billing with subscription plans
- Monthly/annual options
- Usage-based add-ons (per-lead, per-conversation, AI cost pass-through)
- Automatic invoicing and payment collection
- Webhook to activate/suspend company accounts on payment status

**Recommended pricing model (based on Lebanese B2B SaaS norms):**
- Starter: $99/month (1 WhatsApp number, up to 3 agents, 200 AI conversations/month)
- Growth: $199/month (1 WhatsApp number, up to 10 agents, 1000 AI conversations/month)
- Agency: $399/month (dedicated number, unlimited agents, unlimited conversations)

---

## Launch Sequence Recommendation

**Phase 1: Technical foundation (3-4 weeks)**
1. Implement multi-tenancy (companies table + company_id everywhere)
2. Remove hardcoded credentials
3. Add backend role enforcement
4. Connect WhatsApp to Meta (start Meta verification immediately, it takes time)
5. Set up custom domain + staging environment
6. Add Sentry error tracking

**Phase 2: Business infrastructure (1-2 weeks)**
7. Draft ToS and privacy policy (get lawyer to review)
8. Draft client service agreement
9. Set up manual billing for first clients (Wave/invoice)
10. Write basic client documentation (3-5 page user guide)

**Phase 3: Client success (ongoing)**
11. Onboard first client with white-glove service
12. Fix listing bulk import pain (biggest day-1 operational headache)
13. Add email notifications for agents
14. Implement session state persistence

**Phase 4: Scale tools (after first 3 clients)**
15. Stripe integration for automated billing
16. Self-service onboarding flow
17. Tour reminders
18. Advanced analytics for Fox

---

## Current Tech Stack Assessment

| Component | Production Ready? | Notes |
|-----------|-----------------|-------|
| AI conversation engine | YES (with caveats) | Solid 5-stage flow. Session memory loss on restart is the main risk. |
| Database schema | NO | Missing multi-tenancy. Everything else is well-designed. |
| WhatsApp webhook handler | YES (code only) | Logic is ready. Just needs Meta credentials and verification. |
| Admin dashboard | YES | Well-built. Mock data in place. Needs real data integration after multi-tenancy. |
| Authentication | NO | Hardcoded credentials. No company scoping. |
| API security | PARTIAL | JWT works but no role enforcement on backend, no rate limiting. |
| Deployment (Railway) | YES | Production-grade. Custom domain needed. |
| Error handling | PARTIAL | Basic try-catch. No external error tracking. |
| Analytics | PARTIAL | Token cost tracking works. No platform-level metrics. |
| Voice transcription | YES | Whisper integration works. |

---

## Estimated Total Time to First Client

**Minimum viable (cut corners, manual everything):** 4-6 weeks
**Proper foundation (scalable from day 1):** 8-10 weeks

The difference comes down to whether multi-tenancy is built correctly upfront or bolted on after the first client is screaming about seeing another agency's data.

**Recommendation:** Do it right. 8-10 weeks. First client gets a stable product. Every client after that is straightforward.
