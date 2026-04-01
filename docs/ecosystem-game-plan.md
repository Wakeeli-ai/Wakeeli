# Wakeeli Ecosystem Architecture
**Version:** 1.0
**Last Updated:** 2026-04-01
**Owner:** Fox (Founder)
**Status:** Living Document

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Full Architecture Diagram](#full-architecture-diagram)
3. [Lead Acquisition Flow](#1-lead-acquisition-flow)
4. [WhatsApp Bot Integration](#2-whatsapp-bot-integration)
5. [CRM and Lead Management](#3-crm-and-lead-management)
6. [Listings Management](#4-listings-management)
7. [Tours and Scheduling](#5-tours-and-scheduling)
8. [Analytics and Reporting](#6-analytics-and-reporting)
9. [Multi-Tenant Architecture](#7-multi-tenant-architecture)
10. [Integrations Map](#8-integrations-map)
11. [Missing Pieces and Gaps](#9-missing-pieces-and-gaps)
12. [Priority Matrix](#priority-matrix)
13. [Data Models Reference](#data-models-reference)
14. [Tech Stack Recommendation](#tech-stack-recommendation)

---

## System Overview

Wakeeli is a **B2B SaaS platform** that gives Lebanese real estate agencies an AI-powered lead conversion engine running on WhatsApp. Agencies plug in their listings, connect their WhatsApp Business number, and the AI handles inbound leads automatically: qualifying, matching to listings, and booking tours. Human agents step in only when the lead is warm and ready.

**Core Value Proposition:**
- Leads get instant, 24/7 responses on WhatsApp (no more cold leads dying at 2am)
- Agencies see every lead, every conversation, every outcome in one dashboard
- AI does the grunt work. Agents close deals.

**Business Model:** B2B SaaS. Monthly subscription per agency, tiered by number of agents and leads/month. Wakeeli is the platform. Agencies are tenants. Fox is the super-admin.

---

## Full Architecture Diagram

```
+------------------------------------------------------------------+
|                        LEAD SOURCES                              |
|  [WhatsApp QR/Link]  [Website Widget]  [Facebook/IG Ads]  [SMS] |
+------------------------------------------------------------------+
            |                   |                  |
            v                   v                  v
+------------------------------------------------------------------+
|                   WHATSAPP BUSINESS API                          |
|          (Meta Cloud API / 360dialog / Twilio)                   |
+------------------------------------------------------------------+
                          |
                          v
+------------------------------------------------------------------+
|                    WAKEELI BACKEND                               |
|                                                                  |
|   +------------------+        +---------------------------+      |
|   |  MESSAGE ROUTER  |------->|   CONVERSATION ENGINE     |      |
|   |  - Tenant ID     |        |   - Claude (Anthropic)    |      |
|   |  - Session mgmt  |        |   - State machine         |      |
|   |  - Rate limiting |        |   - Intent detection      |      |
|   +------------------+        |   - Lead qualification    |      |
|                                +---------------------------+      |
|                                          |                       |
|            +-----------------------------+                       |
|            |                                                     |
|            v                                                     |
|   +------------------+        +---------------------------+      |
|   |   CRM ENGINE     |<------>|   LISTINGS ENGINE         |      |
|   |   - Lead mgmt    |        |   - Property data         |      |
|   |   - Scoring      |        |   - Photo storage         |      |
|   |   - Pipeline     |        |   - Matching algorithm    |      |
|   |   - Notes/Tags   |        |   - Search/filter         |      |
|   +------------------+        +---------------------------+      |
|            |                            |                        |
|            v                            v                        |
|   +------------------+        +---------------------------+      |
|   |  TOUR SCHEDULER  |<------>|   NOTIFICATION ENGINE     |      |
|   |  - Availability  |        |   - WhatsApp templates    |      |
|   |  - Booking logic |        |   - Email (Resend)        |      |
|   |  - Reminders     |        |   - SMS fallback          |      |
|   +------------------+        +---------------------------+      |
|            |                                                     |
|            v                                                     |
|   +------------------+        +---------------------------+      |
|   | ANALYTICS ENGINE |        |   MULTI-TENANT LAYER      |      |
|   |   - KPIs         |        |   - Tenant isolation      |      |
|   |   - Reports      |        |   - Billing               |      |
|   |   - Exports      |        |   - Usage quotas          |      |
|   +------------------+        +---------------------------+      |
|                                                                  |
+------------------------------------------------------------------+
                          |
            +-------------+--------------+
            |             |              |
            v             v              v
  +---------------+  +----------+  +----------+
  |   AGENCY      |  |  GOOGLE  |  |  CLOUD   |
  |   DASHBOARD   |  | CALENDAR |  | STORAGE  |
  |   (Web App)   |  |   API    |  |  (S3/R2) |
  +---------------+  +----------+  +----------+
            |
            v
  +---------------+
  |  FOX SUPER    |
  |  ADMIN PANEL  |
  +---------------+
```

---

## 1. Lead Acquisition Flow

### 1.1 Entry Points

Every lead enters through one of these channels. Each channel resolves to a WhatsApp conversation or a form submission that then triggers a WhatsApp message.

```
CHANNEL                   MECHANISM                      RESULT
-------                   ---------                      ------
WhatsApp QR Code       -> Scan code, tap link         -> Inbound WA message
WhatsApp Click-to-Chat -> Facebook/IG ad button       -> Inbound WA message
Website Chat Widget    -> User submits form            -> Outbound WA template
OLX/Dubizzle listing   -> Phone number click          -> Agent manually adds lead
Referral link          -> Unique tracking URL          -> Inbound WA message (tagged)
Cold import (CSV)      -> Agent uploads spreadsheet   -> System sends outbound WA
```

### 1.2 Lead Data Capture

The AI collects this data through natural conversation. Not a form. A chat.

**Required (minimum viable lead):**
- Full name
- Phone number (WhatsApp)
- Transaction type: buy or rent
- Property type: apartment, villa, office, commercial
- Location preference: area(s) in Lebanon
- Budget range
- Timeline: urgency to move/buy

**Optional but valuable:**
- Number of bedrooms
- Floor preference
- Parking required
- Furnished or unfurnished
- Specific building or neighborhood
- Source (how they heard about the agency)
- Language preference (Arabic or English)

**Capture strategy:**
The AI does NOT interrogate the lead with a form-style question list. It extracts this data through natural conversation. If a lead says "I'm looking for a 2-bedroom in Achrafieh under $1500/month", the AI parses all of that in one shot and stores it. Follow-up questions fill in missing fields naturally.

### 1.3 Lead Assignment Logic

```
NEW INBOUND MESSAGE
       |
       v
Is this number already in CRM?
       |
  YES  |  NO
       |    \
       |     v
       |   Create new lead record
       |   Mark source channel
       |         |
       v         v
  Resume existing   Start qualification flow
  conversation      (AI-led)
       |
       v
Is lead already QUALIFIED?
       |
  YES  |  NO
       |    \
       |     v
       |   Continue AI qualification
       |         |
       v         v
Has agent claimed this lead?   Lead qualifies
       |                           |
  YES  |  NO                       v
       |    \               Auto-assign to
       |     v              available agent
       |  AI handles        OR stay with AI
       |  until agent       if no agent set
       v  claims
Forward to assigned agent's
WhatsApp or notify in dashboard
```

**Auto-assignment rules (configurable per agency):**
- Round-robin across available agents
- Assign by specialization (residential vs. commercial)
- Assign by area covered
- First-come-first-served (agent who claims first gets it)
- Always-AI until agent manually claims

---

## 2. WhatsApp Bot Integration

### 2.1 WhatsApp Business API Options

Three provider options. Fox picks one per tenant or offers choice during onboarding.

| Provider | Pros | Cons | Best For |
|----------|------|------|----------|
| **Meta Cloud API (direct)** | Free, official, fastest, no middleman | More setup complexity, Fox manages compliance | Mature setup, cost-sensitive |
| **360dialog** | Easy onboarding, good sandbox, popular in MENA | Monthly fee per number | Fast launch, simplicity |
| **Twilio** | Excellent docs, reliable, global | More expensive | Enterprise clients |

**Recommendation:** Start with Meta Cloud API directly. More control, no per-message markup. Use 360dialog as a fallback option for agencies that can't navigate Meta's verification.

### 2.2 Message Handling Pipeline

```
INBOUND MESSAGE (from Meta webhook)
          |
          v
+---------------------------+
| 1. WEBHOOK RECEIVER       |
|    - Verify Meta signature |
|    - Parse payload        |
|    - Extract: phone, msg  |
|      type, content, media |
+---------------------------+
          |
          v
+---------------------------+
| 2. TENANT ROUTER          |
|    - Match phone number   |
|      to tenant account    |
|    - Load tenant config   |
|    - Check rate limits    |
+---------------------------+
          |
          v
+---------------------------+
| 3. SESSION MANAGER        |
|    - Load conversation    |
|      history (last N msgs)|
|    - Load lead profile    |
|    - Load current state   |
+---------------------------+
          |
          v
+---------------------------+
| 4. CONVERSATION ENGINE    |
|    - Pass to Claude API   |
|    - System prompt =      |
|      agency persona +     |
|      lead context +       |
|      listings context +   |
|      instructions         |
|    - Get response         |
+---------------------------+
          |
          v
+---------------------------+
| 5. RESPONSE PROCESSOR     |
|    - Extract actions      |
|      (update lead field,  |
|       book tour, send     |
|       listing, escalate)  |
|    - Format message       |
|    - Send via API         |
+---------------------------+
          |
          v
+---------------------------+
| 6. STATE UPDATER          |
|    - Save conversation    |
|    - Update lead profile  |
|    - Trigger actions      |
|    - Log for analytics    |
+---------------------------+
```

### 2.3 AI Conversation Engine

The brain of Wakeeli. Every inbound message goes through Claude.

**System Prompt Structure (per message):**
```
[AGENCY PERSONA]
You are the AI assistant for {agency_name}.
Communicate in {language}. Tone: {tone_config}.

[LEAD CONTEXT]
Lead: {name}, Budget: {budget}, Looking for: {requirements}
Qualification stage: {stage}
Missing data needed: {missing_fields}

[AVAILABLE LISTINGS]
Top 3 matching listings:
- {listing_1_summary}
- {listing_2_summary}
- {listing_3_summary}

[AVAILABLE AGENTS]
Agents available for tours: {agent_list_with_schedule}

[CONVERSATION HISTORY]
{last_20_messages}

[INSTRUCTIONS]
- Your goal: qualify lead, match to listings, book a tour
- When you have enough info, suggest top 3 listings
- If lead asks for human agent, trigger handoff
- Output actions as structured JSON at end of response
- Never make up listing details
```

**Action JSON Schema (appended to every AI response):**
```json
{
  "actions": [
    {
      "type": "update_lead",
      "field": "budget",
      "value": "1500 USD/month"
    },
    {
      "type": "send_listing",
      "listing_id": "abc123"
    },
    {
      "type": "book_tour",
      "listing_id": "abc123",
      "proposed_slots": ["2026-04-05 10:00", "2026-04-06 14:00"]
    },
    {
      "type": "escalate_to_agent",
      "reason": "lead_requested_human"
    },
    {
      "type": "update_stage",
      "stage": "qualified"
    }
  ]
}
```

### 2.4 Conversation State Machine

```
States and valid transitions:

NEW ---------> GREETING ---------> QUALIFYING
                                        |
                              +---------+---------+
                              |                   |
                         MATCHING           DEAD_END
                         (show listings)    (no match found)
                              |
                         TOUR_PROPOSED
                              |
                    +---------+---------+
                    |                   |
              TOUR_BOOKED         TOUR_DECLINED
                    |
              AGENT_NOTIFIED
                    |
              [Handoff to human pipeline]
```

**States:**
- `NEW`: First message received, no qualification started
- `GREETING`: AI has greeted, intro sent
- `QUALIFYING`: AI actively collecting lead data
- `MATCHING`: AI has enough data, showing listings
- `TOUR_PROPOSED`: AI has offered tour slots
- `TOUR_BOOKED`: Lead confirmed a time
- `AGENT_NOTIFIED`: Agent has been pinged about the booked tour
- `HUMAN_HANDOFF`: Agent is now handling the conversation
- `DEAD_END`: No matching listings, lead stored for future
- `CLOSED_WON`: Deal closed
- `CLOSED_LOST`: Lead went elsewhere or dropped

### 2.5 Media Handling

| Media Type | Handling |
|-----------|----------|
| Images from lead | Download, store in S3/R2, attach to lead profile |
| Voice messages | Download audio, transcribe via Whisper API, treat as text |
| Documents (PDF) | Download, store, attach to lead profile (e.g., salary slip) |
| Location pins | Extract lat/lng, use to refine area preference |
| Listing photos (outbound) | Send as WA image messages in carousel format |
| Virtual tour links | Send as regular URL in message |

### 2.6 WhatsApp Template Messages (Outbound)

Meta requires pre-approved templates for outbound messages (when you initiate contact, not reply).

**Required Templates:**
```
1. FIRST_CONTACT
   "Hi {name}, this is {agency_name}. You asked about properties
   in {area}. I'm your AI assistant and I'll help you find the
   perfect place. What's your budget?"

2. TOUR_CONFIRMATION
   "Your tour is confirmed. {property_address} on {date} at {time}.
   Your agent: {agent_name} ({agent_phone}). Reply CANCEL to cancel."

3. TOUR_REMINDER_24H
   "Reminder: Your tour at {property_address} is tomorrow at {time}.
   Reply CONFIRM to confirm or RESCHEDULE to change."

4. TOUR_REMINDER_1H
   "Your tour starts in 1 hour. {property_address}.
   Agent: {agent_name}. See you there."

5. FOLLOW_UP_AFTER_TOUR
   "Hi {name}, how was your tour? Did {property_address} feel like
   the right fit? Reply and I can show you more options or help
   you move forward."

6. NEW_LISTING_ALERT
   "New listing matching your search in {area}: {price}/month.
   {listing_link}. Want to schedule a tour?"
```

---

## 3. CRM and Lead Management

### 3.1 Lead Profile Data Model

```
LEAD
  id                    UUID (primary key)
  tenant_id             UUID (which agency owns this lead)
  phone                 VARCHAR (WhatsApp number, E.164 format)
  name                  VARCHAR
  email                 VARCHAR (optional)
  source                ENUM (whatsapp_organic, fb_ad, website, import, referral)
  source_campaign       VARCHAR (UTM or ad campaign ID)
  language_preference   ENUM (arabic, english, french)
  stage                 ENUM (see pipeline below)
  score                 INT (0-100, AI-calculated)
  assigned_agent_id     UUID (FK to agents table)
  created_at            TIMESTAMP
  last_activity_at      TIMESTAMP

  -- Lead Requirements
  transaction_type      ENUM (buy, rent)
  property_type         ENUM (apartment, villa, office, commercial, land)
  area_preferences      TEXT[] (array of areas, e.g. ["Achrafieh", "Hamra"])
  budget_min            INT (USD)
  budget_max            INT (USD)
  bedrooms_min          INT
  bedrooms_max          INT
  furnished             BOOLEAN
  parking_required      BOOLEAN
  timeline_urgency      ENUM (immediate, 1_month, 3_months, 6_months, browsing)
  notes                 TEXT (free-form notes from agent)
  tags                  TEXT[] (custom tags per agency)
  custom_fields         JSONB (flexible key-value for agency-specific data)
```

### 3.2 Pipeline Stages

```
NEW         Lead just entered. No qualification started.
            Trigger: First inbound message or CSV import.

CONTACTED   AI or agent has initiated contact.
            Trigger: First outbound message sent.

QUALIFYING  Conversation active. AI is gathering requirements.
            Trigger: Lead responds to first message.

QUALIFIED   All minimum data collected. Budget, type, area confirmed.
            Trigger: AI action "update_stage: qualified"

MATCHED     AI has shown matching listings. Lead is reviewing.
            Trigger: Listings sent to lead.

TOUR_BOOKED Lead agreed to see a property. Time and date confirmed.
            Trigger: Tour record created.

TOUR_DONE   Tour happened. Awaiting feedback.
            Trigger: Agent marks tour as completed.

NEGOTIATION Lead wants to proceed. Price/terms discussion.
            Trigger: Agent moves manually.

CLOSED_WON  Deal signed. Lease or purchase complete.
            Trigger: Agent marks as won.

CLOSED_LOST Lead dropped, went elsewhere, or is unresponsive.
            Trigger: Agent marks as lost. Auto-trigger after X days silence.
```

### 3.3 Lead Scoring Algorithm

Score is 0-100. Used to prioritize which leads agents should focus on.

```
SCORING FACTORS:

Recency (30 points max)
  - Messaged in last 1 hour:  30 pts
  - Last 24 hours:            20 pts
  - Last 3 days:              10 pts
  - Last week:                 5 pts
  - Older:                     0 pts

Completeness (20 points max)
  - Each qualification field filled: +2-4 pts
  - All required fields filled:      20 pts

Engagement (20 points max)
  - Replied 5+ times:         20 pts
  - Replied 3-4 times:        15 pts
  - Replied 1-2 times:        10 pts
  - No reply yet:              0 pts

Intent signals (20 points max)
  - Used words like "immediately", "urgent", "this week": +10 pts
  - Asked about price, availability, contract:           +10 pts
  - Said "just browsing" or similar:                     -10 pts

Budget clarity (10 points max)
  - Gave a specific number:   10 pts
  - Gave a range:              7 pts
  - Said "flexible":           3 pts
  - No budget mentioned:       0 pts
```

### 3.4 Notes, Tags, and Custom Fields

- **Notes:** Free-text per lead. Agent can add during or after conversation. Timestamped.
- **Tags:** Agency-defined. Examples: "VIP", "Hot Lead", "Investor", "Expat", "Referral from John"
- **Custom Fields:** Agency can define their own fields in settings. JSONB storage. Rendered in dashboard as configured.

---

## 4. Listings Management

### 4.1 Listing Data Model

```
LISTING
  id                    UUID
  tenant_id             UUID
  status                ENUM (active, rented, sold, paused, draft)
  transaction_type      ENUM (rent, sale)
  property_type         ENUM (apartment, villa, office, commercial, land, chalet)

  -- Location
  area                  VARCHAR (e.g. "Achrafieh")
  sub_area              VARCHAR (e.g. "Sursock")
  building_name         VARCHAR
  floor                 INT
  address               TEXT
  google_maps_url       VARCHAR
  latitude              DECIMAL
  longitude             DECIMAL

  -- Property Details
  bedrooms              INT
  bathrooms             INT
  area_sqm              INT
  parking_spots         INT
  furnished             BOOLEAN
  view                  VARCHAR (sea, mountain, city, garden)
  floor_type            VARCHAR (marble, wood, tile)
  year_built            INT
  condition             ENUM (new, renovated, good, needs_work)

  -- Pricing
  price                 INT (USD)
  price_currency        ENUM (USD, LBP)
  price_negotiable      BOOLEAN

  -- Features (array of strings)
  amenities             TEXT[] (pool, gym, generator, security, elevator, etc.)

  -- Media
  photos                TEXT[] (S3/R2 URLs)
  virtual_tour_url      VARCHAR
  video_url             VARCHAR

  -- Agent/Ownership
  listing_agent_id      UUID (FK to agents)
  external_listing_id   VARCHAR (if sourced from OLX, Dubizzle, etc.)
  external_source       VARCHAR

  -- Metadata
  created_at            TIMESTAMP
  updated_at            TIMESTAMP
  views_count           INT
  leads_matched_count   INT
  tours_count           INT
```

### 4.2 Listing Sources

```
SOURCE 1: MANUAL ENTRY
  Agent fills form in dashboard.
  Photos uploaded directly.
  Immediate availability.

SOURCE 2: BULK UPLOAD (CSV/Excel)
  Agency uploads spreadsheet with listings.
  Wakeeli maps columns to data model.
  Photos linked via URL or zip upload.

SOURCE 3: SCRAPING (OLX Lebanon / Dubizzle Lebanon)
  Scheduled scraper runs nightly.
  Pulls listings matching tenant's configured areas.
  Deduplicates by address/phone.
  Tenant reviews and approves before going live.
  NOTE: Check legality. OLX TOS may prohibit scraping.
  Safer approach: browser extension for agent to import with one click.

SOURCE 4: API INTEGRATION
  Agency's existing website pushes listings via Wakeeli API.
  Webhook-based sync.
  Real-time updates.
```

### 4.3 Photo Storage

- Photos stored in **Cloudflare R2** or **AWS S3**
- Each photo processed on upload: resize to 3 sizes (thumbnail, medium, full)
- CDN delivery via Cloudflare
- Max 20 photos per listing
- Total storage quota per tenant (part of subscription tier)
- Photos organized by: `/{tenant_id}/listings/{listing_id}/{filename}`

### 4.4 Matching Algorithm

When a lead has been qualified, the system finds the best listings.

```
MATCHING PROCESS:

Step 1: HARD FILTERS (must match, no exceptions)
  - transaction_type matches
  - property_type matches (or is in lead's acceptable types)
  - price <= lead.budget_max (with 15% tolerance)
  - area is in lead.area_preferences
  - listing.status = 'active'

Step 2: SOFT SCORING (nice to have)
  - bedrooms in preferred range:       +20 pts
  - exactly within budget:             +15 pts
  - furnished matches preference:      +10 pts
  - parking matches preference:        +10 pts
  - has photos (more photos = better): +5 pts
  - has virtual tour:                  +5 pts
  - recently listed (last 7 days):     +5 pts
  - agent has good tour conversion:    +10 pts

Step 3: RANK AND RETURN
  Top 3 listings sent to AI context.
  AI presents them naturally in conversation.
  Lead can ask for more or say none match.
```

---

## 5. Tours and Scheduling

### 5.1 Google Calendar Integration

Each agent connects their Google Calendar via OAuth2. The system reads their free/busy slots and suggests available tour times.

```
OAUTH FLOW:
  1. Agent clicks "Connect Google Calendar" in dashboard
  2. Redirect to Google OAuth consent screen
  3. Grant access to: calendar.readonly + calendar.events
  4. Token stored encrypted in DB
  5. Refresh token used to maintain access
  6. Agent's calendar now visible to scheduler

AVAILABILITY CHECK:
  - Read free/busy for next 14 days
  - Working hours configured per agent (e.g., Mon-Sat 9am-6pm)
  - Blocked slots from calendar respected
  - Buffer time between tours (configurable, default 30 min)
  - Max tours per day (configurable per agent)
```

### 5.2 Tour Booking Flow

```
AI suggests tour during conversation
          |
          v
System checks agent availability
(agent assigned to lead, or any available agent for that area)
          |
          v
AI presents 2-3 time slots to lead
          |
     Lead picks a slot
          |
          v
+----------------------------+
| TOUR RECORD CREATED        |
|   lead_id                  |
|   listing_id               |
|   agent_id                 |
|   scheduled_at             |
|   status: SCHEDULED        |
|   meeting_point            |
|   notes                    |
+----------------------------+
          |
          v
Calendar event created in agent's Google Calendar
(includes lead name, phone, property address)
          |
          v
WhatsApp confirmation sent to lead
          |
          v
Push notification + email sent to agent
          |
          v
Reminder flows kick off (see 5.3)
```

### 5.3 Reminder Flows

```
BOOKING CONFIRMED
      |
      +---> Immediate: Confirmation WA to lead
      |
      +---> T-24h: Reminder WA to lead ("Tour tomorrow at {time}")
      |             Lead can reply CONFIRM or RESCHEDULE
      |
      +---> T-1h: Final reminder WA to lead
      |
      +---> T+2h after tour: Follow-up WA to lead
      |     ("How was the tour? Ready to move forward?")
      |
      +---> Agent gets push notification 1h before tour
```

### 5.4 Tour Status Tracking

| Status | Meaning | Who Sets It |
|--------|---------|-------------|
| `SCHEDULED` | Booked, upcoming | System (auto) |
| `CONFIRMED` | Lead confirmed 24h reminder | System (auto on lead reply) |
| `COMPLETED` | Tour happened | Agent (marks in dashboard) |
| `NO_SHOW_LEAD` | Lead didn't show up | Agent |
| `NO_SHOW_AGENT` | Agent didn't show up | System (flag if agent doesn't update) |
| `RESCHEDULED` | New time agreed | System (auto when rebooked) |
| `CANCELLED_LEAD` | Lead cancelled | System (on lead reply) |
| `CANCELLED_AGENCY` | Agency cancelled | Agent |

---

## 6. Analytics and Reporting

### 6.1 Core KPIs Dashboard

**Response Metrics:**
- Average first response time (AI: target under 30 seconds)
- Average human response time (agents)
- Messages per conversation before qualification

**Conversion Funnel:**
```
Total Leads
    |
    v
Contacted (%)
    |
    v
Qualified (%)
    |
    v
Listings Shown (%)
    |
    v
Tours Booked (%)
    |
    v
Tours Completed (%)
    |
    v
Negotiation (%)
    |
    v
Closed Won (%)
```

**Revenue Metrics (for agency):**
- Deals closed this month
- Total deal value
- Average commission per deal
- Revenue pipeline (deals in negotiation)

### 6.2 Per-Agent Performance

Per agent, trackable metrics:
- Leads assigned vs. leads closed
- Tours completed vs. tours booked (show-up rate)
- Average time to close
- Deals won this month vs. last month
- Response time to handoff requests from AI
- Lead score at time of handoff (did they take over high-quality leads?)

### 6.3 Per-Listing Performance

Per listing:
- Times matched to a lead
- Times shown in conversation
- Times a tour was booked
- Tours completed
- Conversion to deal (has this listing ever been sold/rented through Wakeeli?)
- Average time on market

### 6.4 WhatsApp Bot Performance

- Total messages handled by AI
- Handoff rate (% of conversations escalated to human)
- AI containment rate (% handled fully by AI)
- Conversations by source (which channels bring the best leads)
- Language breakdown (Arabic vs. English)

### 6.5 Analytics Infrastructure

```
Every event in Wakeeli fires an analytics event:
  - Lead created
  - Message sent/received
  - Stage changed
  - Tour booked/completed/cancelled
  - Listing viewed
  - Deal closed

Events stored in an events table (append-only, never updated).
Reports are queries over this events table.
Aggregate tables updated nightly for dashboard performance.

Events Schema:
  id            UUID
  tenant_id     UUID
  event_type    VARCHAR
  entity_type   VARCHAR (lead, listing, tour, conversation)
  entity_id     UUID
  actor_type    ENUM (ai, agent, lead, system)
  actor_id      UUID
  payload       JSONB
  created_at    TIMESTAMP
```

### 6.6 Exports

- CSV export for all data views (leads, tours, deals)
- PDF report generation (monthly summary, custom date range)
- Scheduled email reports (weekly digest to agency owner)

---

## 7. Multi-Tenant Architecture

### 7.1 Tenant Isolation Model

**Every record in every table has a `tenant_id`.** No exceptions. Row-level security enforced at the database layer (Postgres RLS). API middleware double-checks tenant context on every request. A tenant's data is completely invisible to any other tenant.

```
TENANT
  id                    UUID
  company_name          VARCHAR
  company_name_ar       VARCHAR (Arabic name for the brand)
  slug                  VARCHAR (used in subdomain: acme.wakeeli.com)
  whatsapp_number       VARCHAR (their WA Business number)
  whatsapp_provider     ENUM (meta_cloud, 360dialog, twilio)
  whatsapp_credentials  JSONB (encrypted API keys)

  -- Branding
  logo_url              VARCHAR
  primary_color         VARCHAR
  bot_name              VARCHAR (e.g. "Maya from Premium Realty")
  bot_language          ENUM (arabic, english, both)
  bot_tone              ENUM (formal, friendly, professional)

  -- Subscription
  plan_id               UUID (FK to plans)
  status                ENUM (trial, active, paused, cancelled)
  trial_ends_at         TIMESTAMP
  billing_cycle_anchor  DATE

  -- Usage Limits (from plan)
  max_agents            INT
  max_leads_per_month   INT
  max_listings          INT
  max_storage_gb        INT

  -- Current Usage (reset monthly)
  current_leads_month   INT
  current_storage_gb    DECIMAL

  -- Settings
  timezone              VARCHAR (default: Asia/Beirut)
  currency              ENUM (USD, LBP)
  working_hours         JSONB
  auto_assign_rule      ENUM (round_robin, first_claim, by_area)

  created_at            TIMESTAMP
  onboarded_at          TIMESTAMP (null until onboarding complete)
```

### 7.2 Subscription Plans

```
PLAN: STARTER
  Price: $99/month
  Agents: up to 3
  Leads/month: 100
  Listings: 50
  Storage: 5GB
  Features: WhatsApp bot, CRM, basic analytics

PLAN: GROWTH
  Price: $249/month
  Agents: up to 10
  Leads/month: 500
  Listings: 200
  Storage: 20GB
  Features: All Starter + Google Calendar, tour reminders,
            per-agent analytics, CSV exports

PLAN: AGENCY
  Price: $499/month
  Agents: unlimited
  Leads/month: 2000
  Listings: unlimited
  Storage: 100GB
  Features: All Growth + PDF reports, custom fields,
            API access, priority support, custom bot name

PLAN: ENTERPRISE
  Price: custom
  Features: All Agency + SLA, dedicated onboarding,
            custom integrations, white-label option
```

### 7.3 Billing System

- **Payment processor:** Stripe (handles subscriptions, invoices, failed payments)
- **Billing cycle:** Monthly, charged on subscription anniversary date
- **Lebanon consideration:** Many Lebanese businesses don't have standard credit cards.
  OMT, Whish Money, or cash collection via agent may be needed for local market.
  Stripe supports international cards. For local collection, offer manual invoice +
  bank transfer option for annual plans.
- **Usage overage:** Warn at 80% of monthly limit. Block AI responses at 100%
  (show human agent alert). Offer upgrade prompt.
- **Failed payments:** Grace period 7 days, then suspend (not delete) account.

### 7.4 Super-Admin Panel (Fox's View)

Fox's dashboard shows everything across all tenants.

**Metrics Fox sees:**
- Total active tenants
- Total leads processed this month (across all tenants)
- MRR (monthly recurring revenue) and ARR
- Churn this month (cancelled accounts)
- New signups this week
- AI messages sent (for Anthropic cost tracking)
- Storage used across all tenants
- Top-performing agencies (by deal volume)
- Tenants approaching usage limits (upgrade opportunities)

**Actions Fox can take:**
- Create/edit/suspend any tenant
- Override subscription (give free months, upgrade manually)
- Impersonate a tenant (for support, with audit log)
- View any conversation (for support)
- Edit global settings (AI prompts, template messages)
- Manage plans and pricing
- Export full data dump

---

## 8. Integrations Map

### 8.1 WhatsApp Business API

```
Provider Options:  Meta Cloud API (recommended), 360dialog, Twilio
Auth:              Webhook + API token
Inbound:           Webhook POST to /webhooks/whatsapp/{tenant_id}
Outbound:          POST to Meta Graph API
Signature check:   X-Hub-Signature-256 header verification
Rate limits:       1000 messages/second (Meta), varies by tier
```

### 8.2 Google Calendar API

```
Auth:              OAuth2 per agent
Scopes:            calendar.readonly, calendar.events
Usage:             Read free/busy, create events
Tokens:            Stored encrypted, refresh automatically
Webhook support:   Google Calendar push notifications for changes
```

### 8.3 Cloud Storage (Cloudflare R2 or AWS S3)

```
Provider:          Cloudflare R2 (preferred, egress free) or AWS S3
Usage:             Listing photos, lead documents, voice message transcriptions
CDN:               Cloudflare CDN in front of R2
Naming:            /{tenant_id}/{resource_type}/{id}/{filename}
Access:            Presigned URLs for uploads (no direct public access)
Retention:         Listings photos kept until listing deleted + 30 days
                   Conversation media kept 90 days then purged
```

### 8.4 Anthropic Claude API

```
Usage:             AI conversation engine (per-message call)
Model:             claude-sonnet-4-5 (speed + quality balance)
Auth:              API key (one master key, Wakeeli's account)
Cost tracking:     Input/output tokens logged per conversation
                   Attribution: tenant_id tagged for cost allocation
Fallback:          If Claude API down, send "agent will be with you shortly"
                   queue message and notify human agent
```

### 8.5 Whisper API (Voice Transcription)

```
Provider:          OpenAI Whisper API (or local Whisper model)
Usage:             Transcribe voice messages from leads
Trigger:           Any inbound audio message type
Output:            Text fed into conversation engine as user message
Cost:              ~$0.006/minute of audio
```

### 8.6 Stripe (Payments)

```
Usage:             Subscription billing for agency clients
Features:          Recurring billing, invoices, failed payment handling,
                   proration on plan changes, webhook events
Webhooks:          invoice.payment_succeeded, invoice.payment_failed,
                   customer.subscription.deleted, customer.subscription.updated
```

### 8.7 Email (Resend or SendGrid)

```
Provider:          Resend (clean API, generous free tier)
Usage:             - Agent notifications (new lead, tour booked)
                   - Agency owner reports (weekly digest)
                   - Billing emails (invoice, payment failed)
                   - Onboarding sequence
                   - Password reset
Sending domain:    notifications@wakeeli.com
                   reports@wakeeli.com
```

### 8.8 SMS Fallback

```
Provider:          Vonage or Twilio SMS
Usage:             When WhatsApp message fails to deliver (rare)
Trigger:           Message undelivered after 24h
Content:           Simple text "Your message from {agency}
                   at {time}: {truncated_message}"
Lebanon coverage:  Both providers support Lebanese numbers (+961)
```

---

## 9. Missing Pieces and Gaps

This section documents everything that is not yet covered above but **must exist** for Wakeeli to be a complete, production-grade product. Treated as first-class requirements.

### 9.1 Onboarding Flow (CRITICAL GAP)

An agency signs up. Now what? Without a structured onboarding, they're lost and churn within a week.

**Required onboarding steps:**

```
STEP 1: COMPANY SETUP (5 min)
  - Company name, logo, industry focus
  - Select plan
  - Payment details

STEP 2: WHATSAPP CONNECTION (15-30 min)
  - Walk agency through Meta Business verification
  - Or connect to 360dialog if they can't do Meta direct
  - Test message send/receive
  - This is the hardest step. Must have a human-assisted option.

STEP 3: TEAM SETUP (5 min)
  - Invite agents (email invite)
  - Set roles: admin vs. agent
  - Connect Google Calendars (optional at this step)

STEP 4: LISTINGS IMPORT (10-20 min)
  - Add first listings manually
  - Or bulk upload CSV
  - At least 3 listings needed before AI can function

STEP 5: BOT CONFIGURATION (5 min)
  - Bot name
  - Language (Arabic, English, or both)
  - Tone (friendly vs. professional)
  - Working hours (when to hand off to human)

STEP 6: TEST CONVERSATION (2 min)
  - Agency owner scans QR, sends a test message
  - Sees AI respond live
  - "Aha moment" achieved

STEP 7: GO LIVE
  - Flip switch to enable
  - Confirmation email with quick-start guide
```

**Onboarding checklist UI:** Progress bar in dashboard. Each step is a card.
Can't go live without steps 1-4 complete. Steps 5-6 are optional but prompted.

### 9.2 AI Prompt Management (CRITICAL GAP)

The system prompt that drives the AI is the product. It needs to be manageable without a code deploy.

- Fox (super-admin) edits master prompt templates
- Agency admins can customize: bot name, tone, specific instructions,
  FAQs to include, pricing policy
- Version history on prompts (can roll back)
- A/B testing infrastructure for prompt variants (future)
- Per-tenant prompt preview and test tool

### 9.3 Data Privacy and Compliance

Lebanon does not have a GDPR equivalent yet but handles personal data of Lebanese residents. International standards still apply to enterprise clients.

**Requirements:**
- Privacy policy and terms of service for agencies
- Lead data deletion capability (GDPR-style right to erasure)
- Data retention policy: define how long lead data is kept
- Conversation logs: default 2-year retention, configurable
- Data export: agencies can export all their data at any time
- Subprocessor list published (Meta, Anthropic, Stripe, Google, etc.)
- Encryption at rest (database level) and in transit (TLS everywhere)
- No cross-tenant data leakage (enforced at DB and API level)

### 9.4 Backup and Recovery

- **Database:** Daily automated backups. Point-in-time recovery to any point in last 7 days.
- **File storage:** R2/S3 versioning enabled. Deleted files recoverable for 30 days.
- **RTO (Recovery Time Objective):** Under 1 hour
- **RPO (Recovery Point Objective):** Under 24 hours
- Backup testing: restore drill monthly
- Multi-region for production database (primary + read replica)

### 9.5 API for Third-Party Integrations

Agencies want to connect Wakeeli to their existing tools. A public API is a retention feature.

**Required API endpoints:**
```
GET    /api/v1/leads                  List leads with filters
POST   /api/v1/leads                  Create lead
GET    /api/v1/leads/{id}             Get single lead
PATCH  /api/v1/leads/{id}             Update lead
DELETE /api/v1/leads/{id}             Delete lead

GET    /api/v1/listings               List listings
POST   /api/v1/listings               Create listing
PATCH  /api/v1/listings/{id}          Update listing

GET    /api/v1/tours                  List tours
POST   /api/v1/tours                  Create tour

POST   /api/v1/conversations/send     Send message to lead

GET    /api/v1/analytics/summary      Basic KPI summary
```

- Auth via API keys (per tenant)
- Rate limited per plan tier
- Webhooks for push events (lead created, tour booked, stage changed)

### 9.6 Mobile App Consideration

Agents are not at desks. They're showing properties, in cars, meeting clients. The dashboard must be mobile-first. Two approaches:

**Option A: Responsive Web App (recommended for v1)**
- Build dashboard as a PWA (Progressive Web App)
- Works on iPhone and Android via browser
- Push notifications via browser notifications or WhatsApp
- No app store complexity
- Agents bookmark it on home screen

**Option B: Native Mobile App (v2 consideration)**
- Better push notifications
- Offline capability
- Camera integration (snap photos on tour, upload directly)
- Biometric login
- Higher development cost and maintenance overhead

**Recommendation:** Build a mobile-responsive PWA for launch.
Plan native app for after Product-Market Fit is confirmed.

### 9.7 Human Handoff Quality

The gap between AI handoff and agent pickup is where leads die. This needs attention.

**Required features:**
- Agent receives WhatsApp message (or in-app push) the instant a lead is escalated
- Agent sees full conversation history before typing a single word
- Agent marks themselves as "handling" to prevent AI from re-engaging
- If agent doesn't respond in X minutes, AI sends a holding message
  ("Our specialist will be with you shortly, typically within 15 minutes")
- If agent STILL doesn't respond, escalate to supervisor
- After handoff is complete, agent can hand BACK to AI
  (for sending listings, scheduling follow-ups)

### 9.8 Listing Alerts for Existing Leads

When a new listing is added that matches a previously stored lead's preferences,
the system should automatically alert that lead.

```
TRIGGER: New listing created or listing status changed to 'active'
ACTION:
  1. Query all leads with:
     - status NOT in (CLOSED_WON, CLOSED_LOST)
     - transaction_type matches listing
     - area_preferences overlaps listing.area
     - budget_max >= listing.price * 0.85
  2. For each matching lead, send WA message via template
     "New listing matching your search..."
  3. Log alert sent (don't spam same lead for same listing)
  4. Rate limit: max 1 alert per lead per 24 hours
```

### 9.9 Duplicate Lead Detection

Agencies often have the same lead come in from multiple sources.

- On lead creation, check if same phone number exists for this tenant
- If duplicate found: merge or flag for agent review
- Cross-source attribution (same lead from FB ad AND referral = one lead, multiple sources tracked)

### 9.10 Blacklist and DNC

- Agents can mark numbers as "Do Not Contact"
- Once blacklisted, no outbound messages sent to that number
- AI automatically detects "STOP" or Arabic equivalent and blacklists
- Lebanon-specific: if someone explicitly asks to be removed, honor it immediately

### 9.11 Testing and QA Infrastructure

- Sandbox mode per tenant: sends messages to a test number, not real WhatsApp
- Conversation simulator in dashboard: test the AI without real leads
- Staging environment with separate Meta app and test WhatsApp numbers
- Automated test suite for conversation flows (given input X, AI should reach state Y)

### 9.12 Localization and Language

Lebanon is multilingual. This is not an edge case. It is core.

- **Arabic:** The AI must speak Lebanese Arabic, not formal MSA.
  Lebanese leads respond to a bot that sounds like a local.
- **English:** For expat clients, English-speaking leads, and international agencies
- **French:** Some Lebanese agencies and clients default to French
- **Mixed language:** Leads often switch mid-conversation.
  AI must detect and match the language of the last message.
- Bot language is configurable per agency and can be set to "auto-detect"

### 9.13 Monitoring and Alerting

- Uptime monitoring: Betterstack or Checkly (99.9% uptime SLA for Growth+ plans)
- Error tracking: Sentry (catch all exceptions, alert Fox immediately on P0 errors)
- Performance monitoring: slow queries, high latency API responses
- WhatsApp webhook failures: alert if webhook stops receiving messages
- AI cost spike alerts: if Anthropic spend exceeds threshold, alert Fox
- Database capacity alerts: disk usage, connection pool exhaustion

### 9.14 Audit Log

For compliance and debugging:

- Every action by any user (agent, admin, Fox) logged with timestamp, user ID, and action
- AI actions logged (what prompt was sent, what response received, what actions taken)
- Log retained for 1 year
- Searchable by Fox in super-admin panel
- Exportable for compliance requests

---

## Priority Matrix

### Phase 1: MVP (Build First, Launch With This)

These are non-negotiable. Without them, the product doesn't work.

| # | Feature | Why Critical | Effort |
|---|---------|-------------|--------|
| 1 | WhatsApp inbound/outbound (Meta Cloud API) | Core product function | High |
| 2 | AI conversation engine (Claude) | Core product function | High |
| 3 | Lead qualification flow | Core product function | Medium |
| 4 | Lead CRM (basic: name, phone, stage, notes) | Agents need this | Medium |
| 5 | Listings management (manual entry only) | AI needs listings to match | Medium |
| 6 | Basic matching algorithm | Core product function | Medium |
| 7 | Tour booking (manual confirmation, no calendar sync) | Agencies need this | Low |
| 8 | Agent handoff flow | Without this, AI fails | Medium |
| 9 | Multi-tenant isolation | Required day one | High |
| 10 | Basic dashboard (leads list, conversations) | Agencies need to see activity | Medium |
| 11 | Onboarding flow (steps 1-5) | Without this, no one can start | High |
| 12 | WhatsApp template messages | Required for outbound | Low |

### Phase 2: Growth (Build After First Paying Customers)

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 1 | Google Calendar integration | Tour scheduling | High |
| 2 | Tour reminder flows (automated WA) | Reduces no-shows | Medium |
| 3 | Lead scoring | Agent prioritization | Medium |
| 4 | Analytics dashboard (core KPIs) | Agency retention | Medium |
| 5 | CSV export | Agency retention | Low |
| 6 | Stripe billing integration | Automate revenue | High |
| 7 | Voice message transcription | Lebanon uses voice msgs heavily | Medium |
| 8 | Listing alerts for existing leads | Conversion booster | Medium |
| 9 | Duplicate detection | Data quality | Low |
| 10 | Email notifications (Resend) | Agent workflow | Low |

### Phase 3: Scale (Build When Revenue Validates)

| # | Feature | Why | Effort |
|---|---------|-----|--------|
| 1 | Public API with webhooks | Enterprise clients | High |
| 2 | PDF report generation | Agency retention, enterprise | Medium |
| 3 | Mobile PWA optimization | Agent UX | Medium |
| 4 | Listing scraper / browser extension | Listing acquisition | High |
| 5 | Advanced analytics (per-agent, per-listing) | Upsell to Agency plan | Medium |
| 6 | A/B testing for AI prompts | Conversion optimization | High |
| 7 | White-label option | Enterprise revenue | High |
| 8 | Native mobile app | Agent UX | Very High |
| 9 | Third-party CRM integrations (Salesforce, HubSpot) | Enterprise | High |
| 10 | Lebanon-local payment methods | Market fit | Medium |

---

## Data Models Reference

### Core Tables Summary

```
tenants              -- Real estate companies (B2B clients)
users                -- Agents and admins within each tenant
leads                -- Lead profiles and requirements
conversations        -- WhatsApp conversation threads
messages             -- Individual messages within conversations
listings             -- Property listings per tenant
tours                -- Scheduled and completed tours
events               -- Analytics event stream (append-only)
subscriptions        -- Stripe subscription data
usage_records        -- Monthly usage tracking per tenant
notifications        -- Pending notifications queue
audit_log            -- All user/system actions
```

### Key Relationships

```
tenant (1) ----< users (many)
tenant (1) ----< leads (many)
tenant (1) ----< listings (many)
lead (1) ------< conversations (many)
conversation (1) ---< messages (many)
lead (1) ------< tours (many)
listing (1) ---< tours (many)
user/agent (1) -< tours (many)
lead (1) -------> assigned user (many-to-one)
```

---

## Tech Stack Recommendation

### Backend
- **Runtime:** Node.js with TypeScript (or Bun for speed)
- **Framework:** Fastify (faster than Express, great TypeScript support)
- **Database:** PostgreSQL (Supabase for managed Postgres + Row Level Security)
- **Queue:** BullMQ with Redis (for async tasks: AI calls, notifications, reminders)
- **File storage:** Cloudflare R2
- **Cache:** Redis (session data, rate limiting)

### Frontend (Agency Dashboard)
- **Framework:** Next.js 14+ (App Router)
- **UI Library:** shadcn/ui + Tailwind CSS
- **Real-time:** Supabase Realtime or Pusher (live conversation updates)
- **Charts:** Recharts or Chart.js

### Infrastructure
- **Hosting:** Railway or Render (simple, no DevOps overhead for early stage)
- **DNS/CDN:** Cloudflare
- **Monitoring:** Betterstack (uptime) + Sentry (errors)
- **CI/CD:** GitHub Actions

### AI
- **Primary:** Anthropic Claude API (claude-sonnet-4-5)
- **Transcription:** OpenAI Whisper (voice messages)
- **Embeddings:** OpenAI text-embedding-3-small (for semantic listing search, future)

---

## Open Questions for Fox

These need decisions before or during build:

1. **WhatsApp provider:** Meta Cloud API direct (requires business verification)
   or start with 360dialog for simplicity? 360dialog costs $5-15/month/number
   but saves weeks of setup headache.

2. **Lebanon payment collection:** Stripe covers international cards.
   What about agencies that pay cash or via OMT? Need a manual invoicing flow?

3. **Arabic dialect:** Should the AI speak Lebanese dialect by default,
   or offer formal Arabic as an option? Some Gulf clients may use the platform
   if Wakeeli expands, and they expect MSA.

4. **Listing scraping:** Legal risk with OLX/Dubizzle TOS.
   Go with browser extension import instead? Simpler, cleaner, defensible.

5. **Agent mobile experience:** Is a mobile-responsive web dashboard sufficient
   for launch, or is a native app a launch requirement for your target agencies?

6. **Data residency:** Do Lebanese agencies care where their data is hosted?
   Is a Lebanese or regional (UAE) data center required for enterprise contracts?

7. **White-label:** Is there appetite from larger agencies to run Wakeeli
   under their own brand? This is a premium revenue stream but adds complexity.

---

*This document is the single source of truth for the Wakeeli product architecture.
Update it as decisions are made and the system evolves.*
