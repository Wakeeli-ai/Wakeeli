# Wakeeli DMSetter Clone: Build Plan

**Date:** August 1, 2026
**Scope:** 7 new pages + enhancements to 4 existing pages
**Context:** Adapted from DMSetter's B2B SaaS automation features into Wakeeli's real estate AI conversion platform for Lebanese agencies.

---

## Decision: Build Target

**Build in v1 (existing Wakeeli repo).**

The existing codebase is not a throwaway prototype. It has 12 working pages, a consistent design system (Tailwind-only, brand-600 palette, slate-50 backgrounds), a FastAPI backend with 8 models and 8 route modules, and a mock data layer that is already real-estate-specific. Building in v2 would mean rebuilding everything that already works.

The DMSetter features are additive: they slot into the existing sidebar, reuse the existing card and table components, and touch endpoints that already partially exist (conversations, agents, analytics). There is no architectural conflict.

The only valid reason to go v2 would be if multi-tenancy required a full schema rebuild. It does, but that is a backend migration, not a frontend rewrite. The frontend can be built now in v1 and the backend migrated underneath it later.

**Verdict:** Ship DMSetter features into v1. Migrate to multi-tenant DB schema as a parallel workstream.

---

## Pages to Add (7 New Pages)

---

### 1. Knowledge Base

**Route:** `/knowledge-base`

**Purpose:** Central repository of AI training content: property listings context, agency FAQs, qualification scripts, and custom Q&A pairs that feed the AI conversation engine.

**UI Components:**
- Tab bar (Listings Context / Agency Info / FAQs / Q&A Scripts)
- Rich text editor (markdown input) per entry
- Card list with title, category badge, last-updated timestamp
- Add/Edit modal with category selector and content textarea
- Delete confirmation dialog
- Search bar with live filter
- "Sync to AI" button that triggers a backend re-indexing call

**Key Data Shown:**
- Knowledge entry title
- Category (Listings / Agency / FAQ / Script)
- Character count
- Last modified date
- Sync status (Synced / Pending / Error)

**Wakeeli-Specific Adaptations:**
- Categories map directly to what the WhatsApp AI needs: property type context (apartment vs villa vs commercial in Lebanon), neighborhood descriptions (Achrafieh, Verdun, Jounieh etc.), agency tone guidelines, and Lebanese buyer objection scripts (e.g., "is this Tapu registered?", "do you accept dollars?")
- "Sync to AI" pushes content to the prompt.py service layer, which already handles prompt construction
- Q&A Scripts tab pre-loads the 7 sample agency transcripts from the `training/` folder

**Rough LOC Estimate:** 650

**Backend Needed:**
- `GET /api/knowledge` - list all entries
- `POST /api/knowledge` - create entry
- `PUT /api/knowledge/{id}` - update entry
- `DELETE /api/knowledge/{id}` - delete entry
- `POST /api/knowledge/sync` - trigger re-indexing (can be a no-op that returns 200 in v1)
- New DB table: `knowledge_entries (id, title, category, content, synced_at, updated_at)`

---

### 2. Conversation Rules

**Route:** `/conversation-rules`

**Purpose:** Configure how the AI behaves in WhatsApp conversations: language, tone, qualification flow, working hours, handoff thresholds, and message timing.

**UI Components:**
- Section cards (one per rule category)
- Toggle switches for binary rules (e.g., "Respond outside business hours")
- Dropdown selectors for enumerated options (tone, language, handoff trigger)
- Number inputs for thresholds (response delay seconds, max messages before handoff)
- Drag-and-drop list for qualification question ordering
- "Test Rule" dry-run button that simulates a conversation step
- Save button with success toast

**Key Data Shown:**
- Language setting (Arabic / English / Bilingual auto-detect)
- Tone setting (Formal / Conversational / Warm)
- Active hours (start/end time, days of week)
- Qualification questions in order (budget, location preference, property type, timeline, purpose)
- Handoff trigger (score threshold or keyword match)
- Response delay (simulate human typing, 0-10 seconds)

**Wakeeli-Specific Adaptations:**
- Language auto-detect is critical for Lebanon. Leads message in a mix of Arabic, French, and English. The rule should set which language the AI defaults to when it cannot detect.
- Active hours matter because Lebanese agency hours are typically 9AM-6PM and leads contacting after hours need a specific after-hours script, not silence.
- Qualification questions are ordered specifically for Lebanese real estate: budget in USD (the market quotes in dollars), district preference (not just city), purpose (own use vs investment), and financing (cash vs mortgage, which is rare post-2019).

**Rough LOC Estimate:** 580

**Backend Needed:**
- `GET /api/conversation-rules` - fetch current config
- `PUT /api/conversation-rules` - save full config object
- New DB table or JSON column: `conversation_config (id, company_id, config JSONB, updated_at)`
- Existing `settings` routes in the backend can be extended rather than creating a new route file

---

### 3. Triggers and Actions

**Route:** `/triggers`

**Purpose:** Automation rules that fire based on lead behavior or message content: "if lead says budget is under $150k, assign to junior agent," "if lead goes silent for 48 hours, start follow-up sequence."

**UI Components:**
- Rule list with enable/disable toggle per rule
- "Add Rule" button opening a 3-step modal:
  - Step 1: Trigger (event type + condition + value)
  - Step 2: Action (assign agent, start sequence, send message, tag lead, notify admin)
  - Step 3: Review and name the rule
- Trigger type selector (keyword match / score threshold / inactivity timer / conversation count)
- Action type selector (assign agent / start sequence / send canned message / update lead status / notify)
- Condition builder (field + operator + value, e.g., "budget less than 150000")
- Run history log per rule (last fired, count)

**Key Data Shown:**
- Rule name
- Trigger condition summary
- Action summary
- Status (Active / Inactive)
- Last fired timestamp
- Fire count

**Wakeeli-Specific Adaptations:**
- Budget thresholds in USD (the Lebanese property market is dollar-denominated)
- District-based routing: leads expressing interest in specific neighborhoods (Achrafieh, Hamra, Baabda) can be routed to agents with those territory assignments, which already exist in the Agents model
- Keyword triggers should include Arabic/French keywords (not just English), e.g., "chalet" triggers a mountain property routing rule
- Inactivity timer default is 24 hours (not 3 days) given Lebanese lead behavior

**Rough LOC Estimate:** 720

**Backend Needed:**
- `GET /api/triggers` - list all rules
- `POST /api/triggers` - create rule
- `PUT /api/triggers/{id}` - update rule
- `DELETE /api/triggers/{id}` - delete rule
- `POST /api/triggers/{id}/toggle` - enable/disable
- `GET /api/triggers/{id}/history` - fire log
- New DB table: `trigger_rules (id, company_id, name, trigger_type, trigger_config JSONB, action_type, action_config JSONB, enabled, last_fired_at, fire_count)`
- Execution hook needed in whatsapp.py route to evaluate rules on each incoming message (v1 can be mock/stub)

---

### 4. Follow-Up Sequences

**Route:** `/sequences`

**Purpose:** Multi-step automated re-engagement flows that run when a lead goes cold, with configurable delay, message content, and exit conditions.

**UI Components:**
- Sequence list with status (Active / Paused / Draft) and enrollment count
- "New Sequence" button
- Sequence editor: drag-and-drop step builder
  - Step card: delay input (hours/days) + message template textarea + exit condition selector
  - Add Step / Remove Step controls
  - Step type selector (WhatsApp message / Agent notification / Lead tag / Wait)
- Variable insertion toolbar (insert lead name, property type interest, agent name)
- Sequence analytics row: enrolled, completed, converted, dropped
- "Enroll Lead" action (manual enrollment from lead detail)

**Key Data Shown:**
- Sequence name
- Number of steps
- Current enrollments
- Completion rate
- Conversion rate (lead that booked a tour after sequence)

**Wakeeli-Specific Adaptations:**
- Message templates are in WhatsApp format (no HTML, plain text + emoji, 1600 char limit)
- Templates need Arabic/English variants selectable per step
- Exit conditions include "lead books a tour" (most important exit for real estate) and "lead responds to any message"
- Delays should account for Lebanese weekly rhythms: Friday afternoon and Saturday morning are high-response windows; avoid Sunday morning (church hours)

**Rough LOC Estimate:** 680

**Backend Needed:**
- `GET /api/sequences` - list all sequences
- `POST /api/sequences` - create sequence
- `PUT /api/sequences/{id}` - update sequence
- `DELETE /api/sequences/{id}` - delete sequence
- `GET /api/sequences/{id}/enrollments` - list enrolled leads
- `POST /api/sequences/{id}/enroll` - manually enroll a lead
- New DB tables: `sequences (id, company_id, name, status, steps JSONB)` and `sequence_enrollments (id, sequence_id, lead_id, current_step, enrolled_at, completed_at, converted)`

---

### 5. KPI Tracker

**Route:** `/kpi`

**Purpose:** Detailed performance dashboard covering lead conversion funnel, agent performance, AI conversation quality, and revenue impact metrics. Replaces and expands the token-only Analytics page.

**UI Components:**
- Date range picker (Today / 7D / 30D / 90D / Custom)
- Summary stat cards (6): total leads, qualified rate, tour booking rate, conversion rate, avg response time, revenue pipeline
- Funnel chart: Lead Contacted, Qualified, Tour Booked, Deal Closed
- Line chart: leads per day vs tours booked per day (dual axis)
- Bar chart: leads by district (Achrafieh, Hamra, Jounieh, Baabda, etc.)
- Agent performance table: name, leads handled, qualified, tours booked, conversion rate, avg handle time
- AI vs Human handoff ratio donut chart
- Top performing listing cards (most conversations generated)
- Export to CSV button

**Key Data Shown:**
- Lead velocity (leads per day/week)
- Qualification rate (% of leads that pass AI qualification)
- Tour booking rate (% of qualified leads that book)
- Time to first response (AI response latency)
- Agent workload distribution
- Cost per qualified lead (token cost / qualified leads)

**Wakeeli-Specific Adaptations:**
- "Revenue pipeline" metric estimated from leads in negotiation stage multiplied by average deal commission (configurable in Settings)
- District breakdown chart is essential for Lebanese agencies who work territory-based
- Separate metrics for Arabic vs English conversations (Lebanese agencies need to know language performance)
- Token cost metrics are already partially built in the existing Analytics page and should be merged here

**Rough LOC Estimate:** 780

**Backend Needed:**
- `GET /api/kpi/summary?from=&to=` - summary stats
- `GET /api/kpi/funnel?from=&to=` - funnel stage counts
- `GET /api/kpi/agents?from=&to=` - per-agent performance
- `GET /api/kpi/districts?from=&to=` - lead origin breakdown
- `GET /api/kpi/listings?from=&to=` - top listings by conversation count
- Most data can be derived from existing Conversation, Message, Event, and TokenUsage models with SQL aggregation

---

### 6. Playbook

**Route:** `/playbook`

**Purpose:** Sales framework for agents when they receive a warmed lead from the AI: step-by-step scripts, objection handlers, and closing guides for Lebanese real estate sales.

**UI Components:**
- Collapsible section list (Introduction, Discovery, Property Matching, Tour, Negotiation, Closing, Objection Handlers)
- Within each section: numbered step cards with title, script text, and "when to use" note
- Objection Handlers: accordion list with "Objection" header and "Response" body
- "Edit Mode" toggle (admin only) that makes all text fields editable in place
- "Save Changes" button
- Print/PDF export button
- Search within playbook

**Key Data Shown:**
- Structured sales steps with scripts
- Lebanese-specific objection handlers
- Checklist of what the AI has already gathered before handoff (budget, district, property type, timeline)

**Wakeeli-Specific Adaptations:**
- Handoff context block at the top of every playbook entry: "What the AI already knows about this lead" so agents do not re-ask questions
- Objection handlers address Lebanon-specific concerns: currency risk (USD vs LBP), banking restrictions, Tapu registration status, power/generator availability in the building, building permit legality
- Tour section includes WhatsApp-native confirmation scripts (leads confirm via voice note, agents need a script for that)
- Closing section references the Lebanese notary process (Kateb 3adl) and typical timeline

**Rough LOC Estimate:** 520

**Backend Needed:**
- `GET /api/playbook` - fetch playbook content
- `PUT /api/playbook` - save edits (admin only)
- New DB table: `playbook (id, company_id, content JSONB, updated_at)` or store as a single JSON document per company
- v1 can ship with hardcoded Lebanese real estate playbook content; edit functionality is v1.5

---

### 7. Onboarding Wizard

**Route:** `/onboarding`

**Purpose:** 15-step guided setup flow for a new agency joining Wakeeli, covering agency profile, WhatsApp connection, listing import, AI configuration, agent setup, and go-live checklist.

**UI Components:**
- Full-screen wizard layout (separate from AppLayout sidebar, no nav)
- Progress bar with step numbers and labels
- Step content area (changes per step)
- Back / Continue / Skip buttons
- Completion screen with "Go to Dashboard" CTA
- Step types used:
  - Form step (agency name, address, logo upload, primary language)
  - Connect step (WhatsApp QR scan or API key input)
  - Import step (CSV upload for existing listings)
  - Config step (tone, language, working hours, same as Conversation Rules)
  - Agent invite step (email + role)
  - Knowledge Base step (paste FAQs)
  - Review step (summary of all settings)
  - Go-live step (checklist with green checkmarks)

**15 Steps:**
1. Agency profile (name, logo, address, website)
2. Primary language and tone
3. WhatsApp Business API connection
4. Working hours configuration
5. First listing import (CSV or manual entry)
6. AI qualification questions order
7. Lead scoring thresholds
8. Knowledge Base: Agency FAQ entry
9. Knowledge Base: Property context entry
10. First agent invite
11. Trigger rules (pre-built templates to enable/disable)
12. Follow-up sequence selection (enable a default re-engagement sequence)
13. Notification preferences (email, Telegram)
14. Review all settings
15. Go-live checklist and launch

**Wakeeli-Specific Adaptations:**
- Step 3 WhatsApp connection is the hardest step (Meta approval required). The wizard should handle the "pending approval" state gracefully with a "We'll notify you when approved" screen.
- Step 5 CSV import has a Lebanese listing field mapper (maps column headers to Wakeeli's 40+ property fields)
- Language step defaults to Bilingual (Arabic + English) because Lebanese leads use both
- Go-live checklist includes "At least one listing active," "WhatsApp approved," "One agent added," "FAQ entered," "Test conversation completed"

**Rough LOC Estimate:** 890

**Backend Needed:**
- `GET /api/onboarding/status` - current step and completion state
- `POST /api/onboarding/step/{n}` - save step data and advance
- `POST /api/onboarding/complete` - finalize and activate account
- Onboarding state can be stored in the existing `Company` model as a JSON progress field
- No net-new tables required; touches existing company, agent, listing, and knowledge routes

---

## Pages to Enhance (Existing Pages)

---

### Settings (`/settings`, currently 939 LOC)

**What to add:**
- Move "AI tone and model selection" into a dedicated "AI Config" subsection
- Add "Commission Rate" field (used by KPI Tracker for pipeline revenue estimates)
- Add "Agency Languages" multi-select (Arabic, English, French) that feeds Conversation Rules
- Add "Notification Channels" section (email and Telegram webhook for admin alerts)
- Add "Billing" section stub (plan name, next billing date, usage this month) for future Stripe integration

**Why it matters:** Settings is the catch-all config page. Without the commission rate and language config, KPI Tracker and Conversation Rules cannot function correctly. The billing stub creates a natural place to land Stripe integration later without another round of nav changes.

---

### Analytics (`/analytics`, currently 789 LOC)

**What to change:**
- Rename page title to "Token Usage" and update the sidebar link to match
- Add a "View Full KPI Dashboard" banner card at the top linking to `/kpi`
- Keep existing token/cost charts intact (they are still useful for Fox monitoring AI costs)
- Remove the page from admin nav and replace it with the KPI Tracker link

**Why it matters:** The existing Analytics page is only about token cost, not conversion performance. The KPI Tracker replaces it as the primary performance view. Renaming prevents confusion about what each page covers.

---

### Conversations (`/conversations`, currently 1127 LOC)

**What to add:**
- "Enroll in Sequence" action button in the conversation detail panel (opens sequence selector modal)
- "Apply Trigger" manual fire button for testing trigger rules against a conversation
- Lead score indicator (0-100) displayed in the conversation header, sourced from the AI qualification engine
- Handoff button that marks the conversation as "Agent Taking Over" and opens an agent selector

**Why it matters:** Sequences and Triggers are useless if agents cannot act on them from within the conversation view. The lead score gives agents instant context before they take over from the AI.

---

### Leads (`/leads`, currently 1017 LOC)

**What to add:**
- "Enroll in Sequence" bulk action (select multiple leads, enroll all in a chosen sequence)
- Lead score column in the table with a colored pill (red/yellow/green thresholds)
- "Source" column showing how the lead entered (WhatsApp inbound / imported / manual)
- Filter by lead score range
- "Playbook" quick-action button in LeadDetailPanel that opens the Playbook page pre-filtered to the lead's stage

**Why it matters:** Leads is the highest-traffic page for agents. Sequence enrollment from lead list (not just individual conversation view) is essential for bulk re-engagement campaigns. Lead score surfaced here gives agents a queue priority signal.

---

## Sidebar Navigation Changes

### Admin Navigation (updated)

```
Dashboard          /
Leads              /leads
Conversations      /conversations
Listings           /listings
Tours              /tours
Agents             /agents
--- AI & Automation ---
Knowledge Base     /knowledge-base
Conv. Rules        /conversation-rules
Triggers           /triggers
Sequences          /sequences
Playbook           /playbook
--- Performance ---
KPI Tracker        /kpi
Token Usage        /analytics
--- Account ---
Settings           /settings
```

Section dividers implemented as non-clickable label rows in the sidebar (same pattern as existing nav but with a small uppercase label and a border-top).

### Agent Navigation (updated)

```
Dashboard          /
Leads              /leads
Conversations      /conversations
Notifications      /notifications
Playbook           /playbook
Analytics          /agent-analytics
Settings           /agent-settings
```

Agents get the Playbook (read-only, no edit mode). They do not see Knowledge Base, Triggers, Sequences, Conversation Rules, or KPI Tracker.

---

## Priority Build Order

**1. KPI Tracker** (`/kpi`)
The first question any agency owner asks before signing is "what results will I see?" and the second question after signing is "what results am I seeing?" The existing Analytics page only shows token cost, which means Wakeeli currently cannot answer either question with a real dashboard. This is the highest-leverage page for closing and retaining clients.

**2. Knowledge Base** (`/knowledge-base`)
The AI conversation engine is only as good as what it knows about the agency. Without a UI for uploading that knowledge, every new client requires a manual backend deployment. This is a prerequisite for any real onboarding. Build it second so the Onboarding Wizard has somewhere to point in step 8 and 9.

**3. Conversation Rules** (`/conversation-rules`)
The existing Settings page has a partial version of this but it is buried and incomplete. Pulling it into a dedicated page with full language/tone/timing controls makes the AI configurable without code changes. Every agency will want to customize this on day one.

**4. Triggers and Actions** (`/triggers`)
Automation is the core value proposition of the platform. Budget-based routing and inactivity-based re-engagement are the two features that will come up in every demo. Build the UI first; the execution engine in whatsapp.py can be wired up after.

**5. Follow-Up Sequences** (`/sequences`)
Directly tied to triggers. Many trigger actions point to sequences. Needs to exist before triggers can be fully configured. Also the most visible "wow" feature in a demo: "when a lead goes quiet for 48 hours, the AI automatically follows up."

**6. Onboarding Wizard** (`/onboarding`)
Required before the first paying client can self-serve. Without it, Fox has to manually configure every agency account. Build it after Knowledge Base and Conversation Rules exist, because the wizard is a UI wrapper around those pages' underlying APIs.

**7. Playbook** (`/playbook`)
Lower urgency than the automation features but high value for agent adoption. Agents need to trust the system, and a clear playbook for handling warmed leads builds that trust. Can ship with hardcoded content initially and add edit mode in a follow-up sprint.

**Enhancements (parallel with above):**
Leads and Conversations page enhancements should happen alongside items 4 and 5 (Triggers and Sequences), since the enroll/handoff buttons are what make those pages usable. Settings and Analytics updates are low-effort and can be done in the same sprint as KPI Tracker.

---

## Estimated Scope

| Item | Est. LOC |
|---|---|
| KPI Tracker (new) | 780 |
| Knowledge Base (new) | 650 |
| Conversation Rules (new) | 580 |
| Triggers and Actions (new) | 720 |
| Follow-Up Sequences (new) | 680 |
| Onboarding Wizard (new) | 890 |
| Playbook (new) | 520 |
| **New Pages Subtotal** | **4,820** |
| Leads enhancements | 150 |
| Conversations enhancements | 120 |
| Settings enhancements | 100 |
| Analytics changes | 60 |
| Sidebar nav changes (AppLayout.tsx) | 80 |
| **Enhancements Subtotal** | **510** |
| **Total Frontend** | **5,330** |

**New Backend Endpoints: 28**
- Knowledge: 5
- Conversation Rules: 2
- Triggers: 6
- Sequences: 6
- KPI: 5
- Playbook: 2
- Onboarding: 3
- Existing routes extended (settings, conversations, leads): no new endpoints, only new fields

**New DB Tables: 6**
- `knowledge_entries`
- `conversation_config`
- `trigger_rules`
- `sequences`
- `sequence_enrollments`
- `playbook` (or JSON column on `Company`)

**Build time estimate (one developer, existing codebase familiarity):**
- Pages 1-3 (KPI, Knowledge Base, Conversation Rules): 2 weeks
- Pages 4-5 (Triggers, Sequences) + enhancements: 2 weeks
- Pages 6-7 (Onboarding, Playbook) + nav changes: 2 weeks
- Backend wiring, testing, Railway deploy: 1 week
- **Total: 7 weeks to feature-complete v1**
