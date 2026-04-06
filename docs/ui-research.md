# Wakeeli UI/UX Research: Design Reference Document

**Purpose:** Actionable design reference for redesigning Wakeeli's three dashboard views (Super-Admin, Company Admin, Agent) based on the best UI/UX patterns from competing and adjacent products.

**Last Updated:** April 2026

---

## Table of Contents

1. [Super-Admin View](#1-super-admin-view)
2. [Company Admin View](#2-company-admin-view)
3. [Agent View](#3-agent-view)
4. [Product-by-Product Breakdown](#4-product-by-product-breakdown)
5. [2025-2026 UI Trends](#5-2025-2026-ui-trends)
6. [Wakeeli Design Recommendations](#6-wakeeli-design-recommendations)

---

## 1. Super-Admin View

The super-admin is Fox: the platform owner overseeing all agency clients, subscriptions, usage, and system health. This view is about control, visibility, and scale.

### Most Relevant Products

**GoHighLevel (Agency + SaaS Mode)**
GoHighLevel's agency dashboard is the closest analog to Wakeeli's super-admin panel. It has three core tabs: SaaS (subscriptions, renewals, engagement), Rebilling (billing cycles and invoices), and Summary (overall platform health snapshot). The SaaS Mode allows full white-label: custom domain, logo on every screen, branded portal that clients log into.

Key elements to steal:
- Three-tab layout: "Accounts", "Revenue", "Overview" maps cleanly to Wakeeli's needs
- Subscription metrics prominently surfaced (MRR, active accounts, churn)
- Per-account drill-down: click any client to see their usage, conversation volume, agent count
- Dark mode + light mode toggle built in
- CSS variable theming so the admin panel itself feels branded

Reference: https://blog.gohighlevel.com/highlevel-new-agency-dashboard/

**Vendasta Partner Dashboard**
Vendasta powers 60,000+ agencies and offers a white-label client portal with partner-level oversight. The partner view surfaces which clients are active, what products they are using, and campaign performance. A unified CRM shows all managed clients in a single list with status badges.

Key elements to steal:
- Client list with status badges (Active, Trial, Churned, Overdue)
- Per-client health scores or engagement indicators
- Rebrandable portal URL so each agency sees Wakeeli branding
- Revenue summary card at the top with MRR, total accounts, seats used

Reference: https://www.vendasta.com/platform/

**Stripe Dashboard**
Stripe is the gold standard for financial admin UI. Clean, scannable, and built around data. KPI cards across the top, transaction table below, side panel for details. The design system emphasizes status communication and progressive disclosure.

Key elements to steal:
- Revenue KPI cards: MRR, total revenue, active subscriptions, failed payments
- Sortable, filterable table for all accounts
- Status badges: Active, Past Due, Cancelled, Trial
- Detail side panel (no full-page navigation, just a drawer)
- Empty state design for new deployments

Reference: https://www.saasframe.io/examples/stripe-payments-dashboard

**Chatwoot Admin**
Chatwoot's multi-tenant architecture scopes all data to the `account_id`. The admin panel manages accounts, agents, inboxes, and channels. It uses a clean sidebar navigation with role-based sections.

Key elements to steal:
- Account switcher always visible in the header
- Role and permissions clearly labeled per account
- Inbox/channel health visible from the admin level
- Data isolation: admin cannot accidentally see another tenant's data

Reference: https://deepwiki.com/chatwoot/chatwoot/3-frontend-dashboard

### Super-Admin Layout Pattern

```
[Sidebar: Logo | Navigation]  [Header: Account Switcher | Profile]
[KPI Cards: MRR | Active Agencies | Total Conversations | Churn]
[Tabs: Agencies | Revenue | System Health]
[Table: Agency Name | Plan | Seats | Conv Volume | Status | Action]
[Side Panel: Agency Detail Drawer on row click]
```

---

## 2. Company Admin View

The company admin is the real estate agency owner or manager. They need to see lead flow, agent performance, AI conversation volume, booking rates, and billing. This is the primary power user view.

### Most Relevant Products

**Follow Up Boss (Real Estate CRM)**
FUB is the benchmark for real estate CRM UX. It uses a "mission control" dashboard philosophy: everything at a glance, customizable, no noise. Smart Lists dynamically update based on lead activity. The 2025 AI integration adds a knowledge graph of the CRM configuration, enabling one-click task management.

Key elements to steal:
- Customizable dashboard: drag-and-drop widget layout
- Smart Lists: leads sorted by activity score (hottest first)
- Behavioral Alerts: agent gets notified exactly when a lead is ready
- Clean pipeline view with stage counts
- Lead activity feed showing all AI conversation activity

Reference: https://www.followupboss.com/ | Review with screenshots: https://inboundrem.com/follow-up-boss-pros-and-cons/

**EliseAI (Closest product to Wakeeli)**
EliseAI is the direct analog: an AI that handles leasing conversations automatically and passes warm leads to human agents. Its CRM (EliseCRM) puts tasks, scheduling, campaigns, reporting, and AI insights in one hub. Every interaction creates a "living guest profile."

Key elements to steal:
- Guest/Lead Profile: single unified profile per lead, all channels merged
- Task routing: AI conversations routed by topic to the right agent or queue
- AI Performance Dashboard: shows what percentage of conversations the AI handled fully vs. escalated, and how long each took
- Launch Status / Setup checklist: clear visual indicator of what is connected and what is not
- In-depth analytics: Leasing AI performance, conversion funnel, response time, booking rate

Reference: https://eliseai.com/elisecrm | https://eliseai.com/platform-overview

**Lofty (formerly Chime)**
Lofty is praised for its AI-powered "digital command center." It automates lead assignment, follow-ups, and email campaigns with predictive insights. The dashboard uses behavioral data to surface who is most likely to convert.

Key elements to steal:
- Lead score badges visible on every lead card
- Smart pipelines with automation trigger indicators
- Analytics showing agent vs. AI conversion contribution
- Mobile-first CRM with full feature parity

Reference: https://lofty.com/real-estate/crm

**Respond.io (WhatsApp inbox management)**
Respond.io handles exactly what Wakeeli needs at the conversation level: multi-agent WhatsApp inbox, AI automation, lead routing, and a shared team inbox. The Flow Builder is a visual drag-and-drop automation editor.

Key elements to steal:
- Shared Inbox with conversation status: Open, Pending, Resolved, Snoozed
- Conversation assignment: assign to agent or team with one click
- Internal notes: agents can leave comments inside a conversation visible only to team
- AI summary: one-click AI-generated conversation summary for handoffs
- File attachment viewer: dedicated panel inside conversation for all shared media
- Contact profile panel on the right side of every conversation

Reference: https://respond.io/team-inbox | https://respond.io/blog/respondio-whatsapp

**HubSpot CRM**
HubSpot's dashboard is role-customizable, modular, and built with 189+ design system components. The multi-column CRM record layout (center tabs + right sidebar cards) is a proven pattern for complex data objects.

Key elements to steal:
- Multi-column record layout: main content center, metadata sidebar right
- Role-specific dashboards: admin sees revenue/pipeline, agent sees tasks/leads
- Activity feed on every record showing all touchpoints
- Inline editing: click any field to edit without leaving the view
- Customizable report widgets per team

Reference: https://www.saasui.design/application/hubspot | https://developers.hubspot.com/blog/app-cards-updates-spring-spotlight-2025

**WATI.io (WhatsApp CRM)**
WATI focuses on WhatsApp team collaboration with a clean, purpose-built UI. Broadcast performance, agent productivity, chatbot trigger analytics, and template usage are all accessible from the main dashboard.

Key elements to steal:
- Broadcast analytics: delivery rate, open rate, reply rate per template
- Agent performance table: response time, conversations handled, CSAT
- Chatbot trigger log: which flows triggered, how many times, what outcomes
- Contact labels/tags: color-coded tags visible on every conversation card

Reference: https://www.wati.io/

### Company Admin Layout Pattern

```
[Sidebar: Logo | Nav Items with icons]
[Header: Agency Name | Notifications | Profile]
[KPI Cards: Total Leads | AI Handled | Tours Booked | Conversion Rate]
[Two-column: Lead Pipeline (left) | AI Performance Stats (right)]
[Conversation Inbox: filterable, sortable, assignable]
[Listings Grid: property cards with lead count per listing]
[Agent Table: name | leads assigned | tours booked | response time]
[Analytics: charts for lead volume, response time, booking funnel]
```

---

## 3. Agent View

Agents need a stripped-down, task-focused view. No analytics they cannot act on. No settings they cannot change. Just their assigned conversations, leads to follow up on, and tours to confirm.

### Most Relevant Products

**Intercom Inbox (Industry benchmark for agent UX)**
Intercom's inbox is unanimously called the gold standard for agent experience. The three-panel layout (sidebar navigation, conversation list, conversation thread + context panel) is the proven formula. The 2025 UI adds AI Copilot that drafts replies and suggests next actions.

Key elements to steal:
- Three-panel layout: nav sidebar, conversation list, active thread + context
- Two display modes: Chat layout (message bubbles) and Table layout (bird's eye grid)
- Conversation priority indicators: SLA timers, urgent flags
- AI Copilot: draft reply suggestions, conversation summaries, lead data autofill
- Internal comments: thread within a conversation visible only to agents
- @mention teammates for instant internal collaboration
- Command+K shortcut for power users
- Right sidebar apps: configurable panels (lead info, property matches, tour scheduler)

Reference: https://www.intercom.com/customer-service-platform/inbox | UI screenshots: https://www.saasframe.io/examples/intercom-help-desk-inbox

**Trengo (WhatsApp-first omnichannel inbox)**
Trengo's black left sidebar with icon-based navigation is compact and keyboard-friendly. The AI Agent Dashboard tracks AI conversation handling with up-to-30-day windows.

Key elements to steal:
- Black sidebar with icon + label navigation (compact but readable)
- @tagging for internal collaboration within conversations
- AI escalation indicator: when AI passes to human, conversation is clearly flagged
- One-click channel switch within a conversation

Reference: https://trengo.com | AI dashboard: https://help.trengo.com/article/ai-helpmate-dashboard-explained

**Freshdesk / Freshchat**
Freshdesk's UI has been documented extensively with 24 UI screenshots publicly available on SaaSUI. It uses a clean ticket-based system with SLA timers, priority badges, and filter views.

Key elements to steal:
- Filter bar: My Open, Pending, Overdue, All Conversations
- Priority color coding: red = urgent, yellow = high, grey = normal
- SLA countdown timers visible on conversation cards
- Quick reply templates: agents can insert saved replies with one click

Reference: https://www.saasui.design/application/freshdesk

**Follow Up Boss (Agent-specific features)**
FUB's agent view in 2025 centers on Smart Lists and behavioral alerts. An agent's home screen shows exactly who to call and in what order, based on lead activity signals.

Key elements to steal:
- "Hot Leads" section at the top of the agent dashboard, auto-sorted by activity
- Call and text buttons directly on lead cards (no drilling in)
- Task queue: today's tasks in a numbered list
- Activity log per lead: all AI conversation history visible to agents

Reference: https://www.followupboss.com/

### Agent Layout Pattern

```
[Narrow Sidebar: icons only, expand on hover]
[Header: Agent Name | My Stats (conv today, tours today)]
[Left: Conversation List with status, lead name, last message, time]
[Center: Active Conversation Thread (bubble format)]
[Right: Lead Profile Panel: name, property interest, AI conversation history, tour status]
[Bottom bar: Reply field | Quick reply templates | Attach | Internal note toggle]
```

---

## 4. Product-by-Product Breakdown

### Follow Up Boss
- **Website:** https://www.followupboss.com/
- **Review with screenshots:** https://inboundrem.com/follow-up-boss-pros-and-cons/
- **What makes it great:** Mission control philosophy, Smart Lists, behavioral alerts, 250+ integrations, 2025 AI assistant with CRM knowledge graph
- **UI strengths:** Clean sidebar, customizable widget dashboard, drag-and-drop contact profiles
- **What Wakeeli should steal:** Smart list auto-sorting by lead activity, behavioral alert triggers, AI assistant panel, one-click contact actions (call, text, email)
- **Relevance:** High (company admin + agent views)

### BoldTrail (formerly kvCORE)
- **Website:** https://boldtrail.com/platform/
- **Review:** https://theclose.com/kvcore-review/
- **What makes it great:** AI-powered CRM, IDX integration, lead gen + nurture in one platform, behavioral insights for agent coaching
- **UI strengths:** Customizable admin dashboard, automation indicators, transaction management view
- **What Wakeeli should steal:** AI automation indicators on lead cards, coaching/insight widgets for admin
- **Relevance:** Medium (company admin view)

### Lofty (formerly Chime)
- **Website:** https://lofty.com/
- **CRM page:** https://lofty.com/real-estate/crm
- **App Store screenshots:** https://apps.apple.com/us/app/lofty-real-estate-platform/id1066013148
- **What makes it great:** AI-powered "digital command center," predictive lead scoring, Smart Plans automation
- **UI strengths:** Predictive conversion indicators, fully responsive across devices
- **What Wakeeli should steal:** Lead conversion probability score on each lead card, AI automation trigger badges
- **Relevance:** Medium-high (company admin view)

### EliseAI
- **Website:** https://eliseai.com/platform-overview
- **EliseCRM page:** https://eliseai.com/elisecrm
- **Demo:** https://eliseai.com/ad-demo-multifamily-leasing-ai
- **What makes it great:** Closest product to Wakeeli in function. AI handles 90% of leasing workflows. Living guest profiles. Topic-based task routing. Full performance analytics.
- **UI strengths:** AI performance analytics, Launch Status setup dashboard, guest profile cards
- **What Wakeeli should steal:** AI performance breakdown (handled vs. escalated vs. booked), launch status checklist UI, living lead profile format
- **Relevance:** Very high (all three views)

### Respond.io
- **Website:** https://respond.io/
- **Team Inbox:** https://respond.io/team-inbox
- **WhatsApp integration:** https://respond.io/integrations/whatsapp
- **What makes it great:** Best-in-class omnichannel inbox, 8 years of market leadership, preferred by Meta and TikTok for early API access. Visual Flow Builder. AI conversation summaries.
- **UI strengths:** Shared inbox with priority sorting, internal notes, AI summary button, file attachment panel, conversation context sidebar
- **What Wakeeli should steal:** Three-column inbox layout, conversation status tags (Open/Pending/Resolved), internal note threading, AI one-click summary, contact profile panel on right
- **Relevance:** Very high (agent view, company admin conversation inbox)

### WATI.io
- **Website:** https://www.wati.io/
- **Review:** https://www.linktly.com/marketing-software/wati-io-review/
- **What makes it great:** Purpose-built for WhatsApp teams, clean functional UI, drag-and-drop chatbot builder, broadcast analytics
- **UI strengths:** Left-sided inbox panel, broadcast performance dashboard, no-code flow builder
- **What Wakeeli should steal:** Broadcast analytics table (delivery/open/reply by template), chatbot trigger log, agent performance metrics table
- **Relevance:** High (company admin view, agent view)

### Trengo
- **Website:** https://trengo.com
- **AI Agent Dashboard docs:** https://help.trengo.com/article/ai-helpmate-dashboard-explained
- **Review:** https://chatimize.com/reviews/trengo/
- **What makes it great:** Black sidebar with icon-based navigation, AI agent performance tracking, omnichannel unified inbox
- **UI strengths:** Compact sidebar, @tagging for internal collaboration, AI escalation flagging
- **What Wakeeli should steal:** Black sidebar with wand/AI icon for AI settings, AI escalation badge on conversations, @mention for agent collaboration
- **Relevance:** High (agent view sidebar design)

### Intercom
- **Website:** https://www.intercom.com/
- **Inbox page:** https://www.intercom.com/customer-service-platform/inbox
- **UI screenshots:** https://www.saasframe.io/examples/intercom-help-desk-inbox
- **What makes it great:** Gold standard for inbox UX. Three-panel layout. AI Copilot. Chat + Table layout toggle. Real-time team dashboard. SLA management. Command+K power user mode.
- **UI strengths:** Multi-pane layout with progressive disclosure, cool restrained color palette, geometric sans-serif typography, understated animations, configurable right sidebar apps
- **What Wakeeli should steal:** Three-panel layout, Chat/Table toggle, AI Copilot panel, SLA countdown timers, right sidebar app slots for lead info and tour scheduler
- **Relevance:** Very high (agent view, company admin inbox)

### Freshdesk / Freshchat
- **UI screenshots (24 screenshots):** https://www.saasui.design/application/freshdesk
- **What makes it great:** Clean ticket system with SLA management, well-documented UI patterns, priority color coding
- **UI strengths:** Filter bar, priority badges, SLA countdown, quick reply templates
- **What Wakeeli should steal:** Filter bar pattern (My Open, Pending, Overdue), priority color system, quick reply template insertion
- **Relevance:** Medium-high (agent view)

### GoHighLevel
- **Agency dashboard post:** https://blog.gohighlevel.com/highlevel-new-agency-dashboard/
- **White label guide:** https://ghlvaservice.com/post/gohighlevel-white-label-guide
- **What makes it great:** Most powerful white-label SaaS platform. SaaS Mode enables full agency rebranding. Three-tab agency dashboard. Per-client drill-down. Both dark and light mode.
- **UI strengths:** Summary/SaaS/Rebilling tab pattern, per-client snapshot cards, full white-label with custom domain
- **What Wakeeli should steal:** Three-tab super-admin layout, per-agency card with status badge, subscription metrics summary, white-label domain support
- **Relevance:** Very high (super-admin view)

### Vendasta
- **Platform page:** https://www.vendasta.com/platform/
- **Business App (client portal):** https://www.vendasta.com/platform/business-app/
- **What makes it great:** White-label partner portal for 60,000+ agencies. Client-facing branded dashboard. Marketplace-style product management.
- **UI strengths:** Client list with engagement health indicators, partner branding throughout, multi-product management from one view
- **What Wakeeli should steal:** Client health score indicator on each account card, partner-level engagement overview, branded client portal concept
- **Relevance:** High (super-admin view)

### Stripe Dashboard
- **Dashboard basics:** https://docs.stripe.com/dashboard/basics
- **SaaSFrame UI screenshots:** https://www.saasframe.io/examples/stripe-payments-dashboard
- **Dribbble inspirations:** https://dribbble.com/search/stripe-dashboard
- **What makes it great:** Financial data clarity. KPI cards + filterable table + detail drawer. Garden design system. Figma kit available.
- **UI strengths:** Revenue KPI cards, status badge system, side panel detail drawer, empty state design, accessibility-first
- **What Wakeeli should steal:** Revenue summary cards (MRR, total subscriptions, failed payments), status badge system (Active/Trial/Past Due/Cancelled), detail drawer on row click, empty state for new accounts
- **Relevance:** High (super-admin view)

### HubSpot CRM
- **UI screenshots:** https://www.saasui.design/application/hubspot
- **Developer patterns:** https://github.com/HubSpot/ui-extensions-examples/tree/main/design-patterns
- **Spring 2025 updates:** https://developers.hubspot.com/blog/app-cards-updates-spring-spotlight-2025
- **What makes it great:** 189-component design system, multi-column CRM record layout, role-specific dashboards, inline editing, Figma kit
- **UI strengths:** Middle column tabs + right sidebar cards layout, activity feed on records, customizable report widgets
- **What Wakeeli should steal:** Multi-column record layout (content center + sidebar metadata), inline field editing, activity feed on lead/contact records
- **Relevance:** High (company admin view)

### Chatwoot
- **Architecture docs:** https://deepwiki.com/chatwoot/chatwoot/3-frontend-dashboard
- **Multi-tenant discussion:** https://github.com/orgs/chatwoot/discussions/4112
- **What makes it great:** Open-source, account-scoped multi-tenancy, clean channel management UI
- **UI strengths:** Account-level data isolation, inbox/channel management view, role-based access within accounts
- **What Wakeeli should steal:** Account switcher in header, clear role display per account, inbox health status from admin level
- **Relevance:** Medium-high (super-admin architecture reference)

### Zendesk
- **UI fundamentals:** https://developer.zendesk.com/documentation/apps/app-design-guidelines/ui-design-fundamentals/
- **Garden design system:** Referenced in developer docs
- **Alternatives comparison (modern UX):** https://www.usepylon.com/blog/zendesk-alternatives-modern-user-experience-2025
- **What makes it great:** Garden design system, structured help center patterns, AI-powered search
- **UI weaknesses (to avoid):** Features spread across multiple consoles creates fragmentation, navigation across admin/analytics/AI modules causes agent friction
- **What Wakeeli should steal:** Garden-style spacing and typography guidelines, segmented user path design, accessible help center layout
- **What Wakeeli should avoid:** Fragmented multi-console navigation, keep everything in one unified app
- **Relevance:** Medium (design system reference)

### Sierra Interactive
- **Website:** https://www.sierrainteractive.com/
- **CRM page:** https://www.sierrainteractive.com/our-solutions/real-estate-crm/
- **What makes it great:** Tightly bundled IDX + CRM, strong automation, integrated dialer + SMS, customizable lead routing
- **UI strengths:** Lead activity tracking, customizable routing rule UI
- **What Wakeeli should steal:** Lead activity tracking timeline, routing rule configuration UI
- **Relevance:** Medium (company admin view)

### Behance/Dribbble Reference Collections
- **Real Estate Dashboards on Dribbble:** https://dribbble.com/tags/real-estate-dashboard (200+ designs)
- **Real Estate UI on Dribbble:** https://dribbble.com/tags/real-estate-ui (400+ designs)
- **Real Estate Dashboards on Behance:** https://www.behance.net/search/projects/real%20estate%20dashboard
- **TABELA Web App (Behance):** https://www.behance.net/gallery/203814599/-TABELA-WEB-APP-UI-DESIGN-for-REAL-ESTATE-DASHBOARD
- **Real Estate Dashboard UI UX (Behance):** https://www.behance.net/gallery/165023743/Real-Estate-Dashboard-UI-UX-Design
- **SaaSFrame Dashboard Examples (166 examples):** https://www.saasframe.io/categories/dashboard

---

## 5. 2025-2026 UI Trends

### Dark Mode vs. Light Mode

Dark mode is no longer optional. Users expect it. The 2025 standard is "Dark Mode 2.0": not just inverted colors, but optimized contrast ratios adapted for different lighting environments. Trading tools like TradingView, analytics platforms, and real-time monitoring dashboards lean dark by default because it reduces eye strain during extended data review sessions.

For Wakeeli specifically: agents monitoring conversation queues all day benefit most from dark mode. Company admins reviewing analytics dashboards may prefer light mode for readability of charts and text. The best practice is to offer both and remember the preference per user.

Key reference: https://uitop.design/blog/design/top-dashboard-design-trends/ | https://dev.to/danish_khan_2d39d5ccce89b/article-title-10-modern-color-palettes-for-saas-dashboards-2026-edition-4pfm

### Sidebar Navigation Patterns

The dominant pattern in 2025 is the collapsible left sidebar:
- **Width:** 200-300px expanded, icon-only collapsed (48-64px)
- **Structure:** Logo at top, primary navigation items with icons + labels, secondary items at bottom (settings, help, profile)
- **Interaction:** Hover to expand in collapsed state, or toggle with a button
- **Active state:** Subtle background highlight, accent color on icon, bold label
- **Group headers:** Muted uppercase labels to separate navigation sections

Products doing this well: Intercom, Trengo (black sidebar), Chatwoot, GoHighLevel.

Reference: https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples | https://lollypop.design/blog/2025/december/saas-navigation-menu-design/

### Card-Based vs. Table-Based Layouts

The consensus in 2025: use both strategically, not one or the other.

**Cards work best for:**
- Lead/contact overviews where visual scanning matters
- Listing tiles with property photos
- KPI summaries at the top of dashboards
- Agent profiles

**Tables work best for:**
- Conversation queues (sortable, filterable, compact)
- Analytics data
- Billing and subscription management
- Lead lists when volume is high (50+ items)

Intercom's Chat/Table toggle is the right pattern: give the user control over which format they prefer for their workflow.

Reference: https://www.saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns

### Color Palettes for Professional Dashboards

**Dominant 2025 B2B palettes:**

1. **Navy + White + Accent:** Deep navy base (#1a2744 range), white content area, vibrant accent (electric blue, indigo, or teal for CTAs). This is exactly Wakeeli's current direction and it is correct.

2. **Stripe-Style Blurple:** Dark purple-blue (#635BFF) as primary action color, white/grey backgrounds, high contrast. Used by fintech leaders for trust.

3. **Dark Dashboard:** Near-black (#0f172a or #1e293b), dark grey panels (#1e2d3d), lighter grey cards (#263346), white text, bright accent for CTAs.

4. **Professional Light:** White (#ffffff) background, light grey panels (#f8fafc), dark navy text, a single primary accent color.

Color psychology for Wakeeli: Navy communicates trust, authority, and stability. This is exactly right for selling to conservative Lebanese real estate businesses. The accent color (a brighter blue or teal) should signal AI and automation features.

Reference: https://dev.to/danish_khan_2d39d5ccce89b/article-title-10-modern-color-palettes-for-saas-dashboards-2026-edition-4pfm | https://octet.design/colors/user-interfaces/saas-ui-design/

### Typography Trends

- **Font style:** Geometric sans-serif is dominant (Inter, DM Sans, Plus Jakarta Sans, Geist). Clean, technical, readable at small sizes.
- **Weight system:** Use Regular (400) for body, Medium (500) for labels, Semibold (600) for card titles, Bold (700) for KPI numbers.
- **Scale:** Keep to 2-3 sizes per view. 13-14px for table data, 15-16px for body, 20-24px for headings, 32-48px for KPI numbers.
- **Limit font families:** Maximum 2 (one for display/headings, one for body). Most top SaaS products use Inter for everything.

Reference: https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795

### Micro-Interactions and Animations

2025 SaaS expectations:
- Soft fade-in when new data arrives in a widget
- Hover state: subtle background shift on table rows, card lift on hover
- Chart tooltips that appear smoothly on hover
- Button loading state: spinner replaces button text during async actions
- Skeleton screens instead of spinners for full-page loads
- Toast notifications for success/error states (not modal alerts)
- Smooth panel transitions for drawers and side panels

Reference: https://medium.com/@allclonescript/20-best-dashboard-ui-ux-design-principles-you-need-in-2025-30b661f2f795 | https://uitop.design/blog/design/top-dashboard-design-trends/

### Actionable Dashboard Design

The biggest mistake identified across 2025 research: static report dashboards. Modern users expect "next best action" design.

Instead of a chart that says "Conversion rate is 12%," the dashboard should also show the action: "3 leads have not been followed up in 48 hours. Follow up now." This is what FUB's Smart Lists and behavioral alerts do. EliseAI's task routing does the same thing.

For Wakeeli: every KPI should link to the underlying action. Clicking "Tours Booked: 5" should open the tour schedule. Clicking "AI Escalated: 3" should open those three conversations.

Reference: https://uxdesign.cc/design-thoughtful-dashboards-for-b2b-saas-ff484385960d

### Three-Panel Inbox Layout (Standard Pattern)

The three-panel inbox is now an industry standard for conversation management platforms:

```
Panel 1 (Left, 250-300px): Navigation sidebar + inbox folder list
Panel 2 (Center, 350-400px): Conversation list, sortable and filterable
Panel 3 (Right, flex): Active conversation thread + context sidebar
```

The context sidebar in Panel 3 contains: contact info, conversation history, AI analysis, property matches, tour status. This is the key differentiator: surfacing the right context data next to the conversation.

Products using this pattern: Intercom, Respond.io, Freshdesk, Trengo, Zendesk.

Reference: https://www.intercom.com/help/en/articles/6258745-the-inbox-explained

---

## 6. Wakeeli Design Recommendations

Based on all research above, here are 15 concrete, prioritized design recommendations for Wakeeli's three views.

---

### Recommendation 1: Three-Panel Inbox as the Core Agent View

**Steal from:** Intercom, Respond.io

The agent view must use the three-panel inbox layout. Left panel: nav sidebar with conversation folders (Mine, Team, AI Handled, Escalated). Center panel: conversation list with lead name, last message preview, time elapsed, and a status badge. Right panel: full conversation thread with a lead context panel below (property interest, AI conversation summary, tour status).

Do not build a simple chat interface. Build a workspace.

---

### Recommendation 2: AI Performance Dashboard as a First-Class View

**Steal from:** EliseAI, WATI.io, Respond.io

Every company admin needs to answer one question: "Is my AI actually working?" Build a dedicated AI Performance tab that shows:
- Conversations fully handled by AI (%)
- Conversations escalated to agents (%)
- Average time to first AI response
- Leads qualified by AI
- Tours booked by AI vs. manual
- AI conversations by listing

This is Wakeeli's core differentiator. Make it impossible to miss.

---

### Recommendation 3: Lead Profile Cards with AI Conversation History

**Steal from:** EliseAI (living guest profiles), HubSpot (multi-column record layout)

Every lead should have a unified profile that shows all channels merged: WhatsApp history, AI conversation transcript, property interests expressed, qualification status, tour scheduled (or not). The profile uses the two-column layout: main content on the left, metadata sidebar on the right.

Agents should never have to ask a lead "what were you looking for?" The AI conversation history answers that automatically.

---

### Recommendation 4: Super-Admin Three-Tab Layout

**Steal from:** GoHighLevel, Stripe

The super-admin view should use three tabs:
1. **Agencies:** table of all client agencies with status badges, plan tier, conversation volume, and last active date
2. **Revenue:** MRR, total subscriptions, upcoming renewals, failed payments, churn metrics
3. **System:** AI uptime, WhatsApp API status, conversation volume trend

KPI cards at the top of each tab. Detail drawer on row click (no full page navigation).

---

### Recommendation 5: Collapsible Left Sidebar with Icon Navigation

**Steal from:** Intercom, Trengo (black sidebar), GoHighLevel

Navigation sidebar: 240px expanded, 64px collapsed (icon-only). Top: Wakeeli logo. Navigation items: Dashboard, Conversations, Leads, Listings, Tours, Analytics, Settings. Bottom: Help, Profile.

Use navy (#0f1729 or #1a2744) as the sidebar background. White icons. Active item: subtle blue background highlight. The AI section should have a distinct icon (spark or wand).

---

### Recommendation 6: Conversation Status Badge System

**Steal from:** Respond.io, Intercom, Freshdesk

Every conversation in the list view needs a clear status badge:
- **AI Active** (blue): AI is handling this conversation
- **Escalated** (orange): AI passed to human, agent needs to respond
- **Pending** (yellow): waiting for lead to reply
- **Tour Booked** (green): outcome achieved
- **Qualified** (teal): lead qualified, ready for agent follow-up
- **Closed** (grey): conversation ended

Status badges should be color-coded and visible without opening the conversation.

---

### Recommendation 7: Lead Heat Score on Every Card

**Steal from:** Follow Up Boss (Smart Lists), Lofty (predictive lead scoring)

Every lead card and conversation item should show a heat indicator: a colored dot or small badge showing lead engagement level (hot/warm/cold). This is derived from:
- Time since last interaction
- Number of messages exchanged
- Whether they responded to AI
- Whether they clicked a property link
- Whether they asked about price or availability

Agents see the hottest leads first. Company admins see the overall pipeline heat at a glance.

---

### Recommendation 8: KPI Cards with Clickable Drill-Down

**Steal from:** Stripe (KPI cards), EliseAI (performance analytics)

Every number on the dashboard is clickable. Clicking "Tours Booked: 12" opens the tour schedule filtered to this period. Clicking "AI Escalated: 5" opens those conversations. Clicking "Leads This Week: 47" opens the lead list filtered to this week.

Static numbers are not a dashboard. They are a report. Wakeeli needs a dashboard.

---

### Recommendation 9: Quick Reply Templates for Agents

**Steal from:** Freshdesk (quick reply insertion), Respond.io (AI draft replies)

Agents should have a library of approved message templates accessible with a single click or slash command (/). Templates for: tour confirmation, pricing inquiry follow-up, document request, qualification questions, and common objection handling.

AI should also suggest the next best reply based on conversation context (Intercom AI Copilot model).

---

### Recommendation 10: Internal Notes Threading

**Steal from:** Intercom, Respond.io, Trengo

Inside every conversation, agents need to leave internal notes visible only to the team. Notes are threaded with the conversation but visually distinct (yellow background, dashed border). Agents can @mention teammates to pull them in.

This is critical for handoff quality when AI escalates to human. The AI summary + agent note gives the next agent full context instantly.

---

### Recommendation 11: Listing Cards with Lead Count

**Steal from:** Real estate CRM patterns (FUB, Lofty)

The Listings view should use a card grid, not a table. Each card shows the property photo (Unsplash or uploaded), property name, location, price, and a lead count badge ("8 leads"). Clicking a listing opens its detail view showing all AI conversations referencing that property.

This creates a direct connection between listings and lead activity, which is unique to Wakeeli's model.

---

### Recommendation 12: Setup Checklist / Launch Status UI

**Steal from:** EliseAI (Launch Status page)

When a new agency is onboarded, show a visual setup checklist: WhatsApp connected (check), Listings uploaded (check), Agents added (check), AI trained (check), First live test (pending). Each item has a status: complete (green checkmark), in progress (blue spinner), or incomplete (red +Setup button).

This reduces onboarding drop-off and gives the company admin a clear sense of progress.

---

### Recommendation 13: Dual Mode - Light and Dark

**Steal from:** GoHighLevel, Intercom (Command+K, layout customization)

Offer both light and dark mode from day one. Remember the preference per user. Light mode: white background, dark navy sidebar, charcoal text. Dark mode: #0f172a background, #1e293b cards, #94a3b8 muted text, white primary text, bright accent blue (#3b82f6 or similar).

Wakeeli's navy brand color works in both modes: as a sidebar color in light mode, and as an accent in dark mode.

---

### Recommendation 14: Mobile-First Agent Interface

**Steal from:** Lofty (fully responsive CRM), FUB (mobile app), Respond.io (mobile app)

Real estate agents are never at a desk. They are at properties, in cars, at coffee shops. The agent view must work perfectly on mobile. Priority:
- Conversation list is swipeable
- Reply field is accessible without scrolling
- Lead profile collapses into a modal (not a sidebar) on mobile
- Tour confirmation is a single tap
- Push notifications for AI escalations

---

### Recommendation 15: Behavioral Alerts / Notification System

**Steal from:** Follow Up Boss (behavioral alerts), Intercom (SLA alerts)

Build a notification system that surfaces the right information at the right time:
- "Lead Ahmad Khalil just replied to your WhatsApp message" (agent notification)
- "AI has been handling this lead for 20 minutes without qualifying" (escalation alert)
- "3 leads have not received a reply in 2 hours" (admin alert)
- "Tour booked for tomorrow 10:00 AM" (confirmation notification)
- "Agency XYZ exceeded their conversation limit this month" (super-admin billing alert)

Notifications appear as toast messages in-app, push notifications on mobile, and in a notification tray accessible from the header.

---

## Design Inspiration Resource Links

**Product Pages and Demos:**
- Follow Up Boss: https://www.followupboss.com/
- EliseAI Platform: https://eliseai.com/platform-overview
- EliseCRM: https://eliseai.com/elisecrm
- Respond.io Team Inbox: https://respond.io/team-inbox
- Intercom Inbox: https://www.intercom.com/customer-service-platform/inbox
- GoHighLevel Agency Dashboard: https://blog.gohighlevel.com/highlevel-new-agency-dashboard/
- WATI.io: https://www.wati.io/
- Trengo: https://trengo.com
- Lofty CRM: https://lofty.com/real-estate/crm
- BoldTrail (kvCORE): https://boldtrail.com/platform/
- HubSpot CRM: https://www.saasui.design/application/hubspot
- Stripe Dashboard: https://docs.stripe.com/dashboard/basics
- Vendasta Platform: https://www.vendasta.com/platform/

**UI Screenshot Libraries:**
- SaaSFrame (166 dashboard examples): https://www.saasframe.io/categories/dashboard
- SaaSFrame Stripe: https://www.saasframe.io/examples/stripe-payments-dashboard
- SaaSFrame Intercom: https://www.saasframe.io/examples/intercom-help-desk-inbox
- SaaSUI Freshdesk (24 screenshots): https://www.saasui.design/application/freshdesk
- SaaSUI HubSpot: https://www.saasui.design/application/hubspot
- Dribbble Real Estate Dashboards: https://dribbble.com/tags/real-estate-dashboard
- Dribbble Real Estate UI: https://dribbble.com/tags/real-estate-ui
- Behance Real Estate Dashboards: https://www.behance.net/search/projects/real%20estate%20dashboard
- TABELA Real Estate Web App (Behance): https://www.behance.net/gallery/203814599/-TABELA-WEB-APP-UI-DESIGN-for-REAL-ESTATE-DASHBOARD

**Design Trend References:**
- SaaSFrame 2026 Dashboard Anatomy: https://www.saasframe.io/blog/the-anatomy-of-high-performance-saas-dashboard-design-2026-trends-patterns
- uitop.design Dashboard Trends: https://uitop.design/blog/design/top-dashboard-design-trends/
- Navbar Gallery Sidebar Examples: https://www.navbar.gallery/blog/best-side-bar-navigation-menu-design-examples
- B2B SaaS Color Palettes: https://dev.to/danish_khan_2d39d5ccce89b/article-title-10-modern-color-palettes-for-saas-dashboards-2026-edition-4pfm
- Octet SaaS UI Color Palettes: https://octet.design/colors/user-interfaces/saas-ui-design/
- B2B SaaS Design Trends 2026: https://www.designstudiouiux.com/blog/top-saas-design-trends/
- Intercom's IA Redesign Case Study: https://www.intercom.com/blog/designing-for-clarity-restructuring-intercoms-information-architecture/
- Thoughtful B2B SaaS Dashboards: https://uxdesign.cc/design-thoughtful-dashboards-for-b2b-saas-ff484385960d

**Figma Resources:**
- Stripe Design System: @stripedesign on Figma Community
- HubSpot Figma Kit: Referenced in https://developers.hubspot.com/docs/apps/legacy-apps/private-apps/build-with-projects/create-ui-extensions
- Seamly Real Estate Dashboard UI Kit: https://ui8.net/semusim-visual-creative/products/seamly---real-estate-dashboard-ui-kit

---

*End of document.*
