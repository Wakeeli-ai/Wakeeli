# Wakeeli Prototype Review
**Date:** April 1, 2026
**Reviewed by:** Lexy

---

## CRITICAL FINDING: The Miro Export Does Not Contain Wakeeli Prototype Screens

Before anything else, Fox needs to know this: **the 26 PNG images in the wakeeli_rtb folder are NOT Wakeeli prototype wireframes.** They are screenshots from competitor and reference websites that Fox pinned to the Miro board as inspiration.

The actual native Miro designs (frames, wireframes, sticky notes, shapes) are stored in `canvas.json` inside the export. That file is in Miro's proprietary binary format and **cannot be read without Miro itself.** No strings, no JSON, no readable content can be extracted from it.

**What this means:** The "prototype" as Fox designed it in Miro can only be viewed by opening the board directly in Miro. To proceed with the frontend rebuild, Fox should either:
1. Share direct screenshots of the Miro frames with Lexy via Telegram
2. Grant view access to the Miro board link so the screens can be properly reviewed
3. Export individual frames as PNGs from within Miro (File > Export > Selection/Frames)

---

## Part 1: What the Miro Board Actually Contains

**Board name:** "Wakeeli's website"
**Total images:** 26 PNGs

All 26 images are screenshots from third-party products Fox used as competitive research / design inspiration:

| # | Product | What it shows |
|---|---------|---------------|
| 1 | Sendblue | Hero headline: "Enterprise-ready AI for customer service" (dark bg) |
| 2 | Sendblue | Top navigation bar with logo, Products, Resources, API, Careers |
| 3 | Sendblue | CTA: "More conversations, more conversions. Request a demo" |
| 4 | Lyro AI Agent | Chat widget demo: AI responding to "I forgot my password" |
| 5 | Sendblue | Social proof: G2 badges (High Performer x3, Users Love Us), 5.0 rating, brand logos |
| 6 | Sendblue | Forbes banner: "Up to 88% of visitors leave complex websites in seconds" |
| 7 | Sendblue | Features section: "Explore the platform" with Lead Qualification playbook UI |
| 8 | Chatbase | "An end-to-end solution for conversational AI" How it works section |
| 9 | Chatbase | "Unlock the power of AI-driven Agents" with 3 feature cards (channels, security, guardrails) |
| 10 | Sendblue | Footer: "Get started today" dark panel with company/legal/social links |
| 11 | Sendblue | Integrations carousel: HubSpot, Salesforce, Zapier, Webhooks |
| 12 | Sendblue | Forbes banner: "The average B2B SaaS website converts only 1.7% of visitors into leads" |
| 13 | Lyro AI Agent | Mobile chat widget: user says "I forgot my password" |
| 14 | Sendblue | Social proof (compact mobile view) with brand logos (iClosed, Compass) |
| 15 | Sendblue | Mobile hero: "The iMessage Solutions Partner" with Conversations UI preview |
| 16 | Chatbase | Mobile: AI Actions panel showing "Invite user" and "Escalate to human" toggles |
| 17 | Sendblue | Dark banner: "Turn Website Visitors into Meetings and Qualified Pipeline" |
| 18 | Sendblue | Mobile footer dark panel |
| 19 | Chatbase | Mobile "How it works" section text only |
| 20 | Sendblue | Mobile CTA button only |
| 21 | Chatbase | Mobile: "Unlock the power of AI-driven Agents" with multilingual support card |
| 22 | Sendblue | Mobile Forbes stat (1.7% lead conversion) |
| 23 | Sendblue | Mobile features section: "Explore the platform" with Visitor Identification active |
| 24 | Sendblue | Mobile integrations: HubSpot card only |
| 25 | Sendblue | Mobile Forbes banner (88% bounce rate) |
| 26 | Hyperbound | Headline: "Hyperbound + AI Sales Coach Scales Your Winning Behaviors" |

**Design patterns Fox was studying from these references:**
- Clean dark hero sections with large bold sans-serif headlines
- "More conversations, more conversions" style value prop framing
- Social proof sections (G2 badges, star ratings, client logos)
- Feature showcase with left menu + right live UI preview
- Card grids for feature comparison (3 columns)
- Dark CTA banners with Forbes-sourced statistics for urgency
- Simple mobile-first chat widget demos
- HubSpot/Salesforce/Zapier integration grids
- Conversational AI / playbook configuration UIs

---

## Part 2: Other Directories

**chatbot_framework_rtb:** Contains only a `.docx` file (`3458764517650202313.docx`) and board metadata JSON. No images. The docx may contain chatbot script documentation.

**dms_scripts_rtb:** Contains only board metadata JSON files. No images, no documents. Likely a board created but not populated with exported content.

---

## Part 3: Other Uploaded Screenshots (file_259 to file_262)

These are infrastructure/deployment screenshots, not frontend UI:

- **file_259:** Railway deployment graph showing Postgres (marked for deletion), postgres-volume, wakeeli-backend (Edited), and Wakeeli service (Online). URL: `wakeeli-ai.up.railway.app`
- **file_260:** Railway "Destructive Changes" modal confirming deletion of the Postgres service in `exciting-imagination/production`
- **file_261:** Railway "4 changes to apply" modal:
  - `wakeeli backend` repo change: `charbelk04/Wakeeli` to `Wakeeli-ai/Wakeeli`
  - `ANTHROPIC_API_KEY` variable update
  - `Postgres` will be deleted
- **file_262:** Wakeeli AI Cost Dashboard (custom built) showing Claude API spend analytics with KPI cards, Model Split, Daily Breakdown, Per-Conversation Costs. This is the live deployed analytics view.

The three `image_2026-03-29` files are personal photos of a person (portrait shots against a city skyline backdrop), not UI screens.

---

## Part 4: Current Deployed Frontend Analysis

**Tech stack:** React + TypeScript + Vite + Tailwind CSS + Lucide icons
**Router:** React Router v6
**Font:** Inter

### 4.1 Global Layout (AppLayout.tsx)

**Structure:** Classic 2-column: fixed left sidebar + scrollable right main area

**Sidebar:**
- Width: 240px (w-60)
- Color: `#1e3a5f` (Wakeeli dark navy)
- Hover state: `#2a4a7a`
- Logo: Zap icon (Lucide) + "Wakeeli" text, white
- Nav items: text-white/90, active state gets `bg-white/20`
- Bottom: Logout button

**Header (top bar):**
- Height: 56px (h-14)
- Background: white
- Contains: search bar, "New Lead" CTA button (brand-600 blue), notification bell (hardcoded badge "3"), user name + role label + avatar initials, X close button
- Note: the X close button appears to be a stray element with no functional handler

**Main content area:** `bg-slate-100` with `p-6` padding

**Brand color definitions (tailwind.config.js):**
```
brand-600: #2563eb (primary blue)
brand-700: #1d4ed8 (hover)
wakeeli-sidebar: #1e3a5f (dark navy)
wakeeli-sidebarHover: #2a4a7a
gold-500: #d4af37 (defined but unused in current code)
```

### 4.2 Navigation Structure

**Admin nav:** Dashboard, Leads, Conversations, Listings, Tours, Agents, AI & Routing, Analytics, Settings (9 items)

**Agent nav:** Same items but "Leads" becomes "My Leads", "Conversations" becomes "Inbox"

---

### 4.3 Page-by-Page Breakdown

#### Dashboard
**Layout:** 4 KPI cards in a row, then a 2/3+1/3 grid below

**KPI cards:**
- Total Listings (Building2 icon, brand blue)
- Active Conversations (MessageSquare, purple)
- With Agent (CheckCircle, emerald)
- Total Agents (UserPlus, slate)
- Each: white card, border, rounded-xl, shadow-sm

**Left panel (2/3):** Recent Conversations with a left list (w-80, avatar circles showing last 2 digits of phone number) + right placeholder area

**Right panel (1/3):** Quick Actions - a wakeeli-sidebar colored card (navy) with 5 link buttons using `bg-white/15` glass effect

**Status badge colors:** new=blue, qualified=emerald, handed_off=purple, closed=slate

**Data:** Live from API

---

#### Leads
**Layout:** Header row with title + Export/Table View buttons, then filter row, then full-width data table

**Table columns:** checkbox, Lead (avatar+phone), Contact, Source, Type, Status, Assigned Agent, Last Activity

**Filters:** Type (Buy/Rent), Status dropdown, Agent dropdown, Clear button

**Behavior:** Row click opens LeadDetailPanel slide-over (right-side panel). Currently uses phone number for avatar initials and display name since there's no real user name data.

**Issues:**
- Avatar shows last 2 digits of phone number as initials (not ideal for identity)
- "Contact" column shows phone + "WhatsApp" (redundant with Source)
- No pagination (just "Showing 1-N of N")
- No real search integration on this page (search comes via URL param from header)

---

#### Conversations
**Layout:** Left panel (w-96) + right panel flex

**Left panel:** Filter tabs (All, AI, Agent, Waiting) + scrollable conversation list. Each item: avatar circle (last 2 digits phone), name, date, status badge, message preview

**Right panel:** Header (phone, last active, status badge) + scrollable message thread. User messages: brand-600 blue bubble right-aligned. AI messages: white card left-aligned with border. Timestamp shown below each message.

**Polling:** Auto-refreshes every 10 seconds

**Issues:**
- No way to type/send a reply from the UI
- No agent assignment action from this view
- No human takeover button visible in conversation view

---

#### Listings
**Layout:** 3-column card grid (responsive: 1 on mobile, 2 on md, 3 on lg)

**Card structure:**
- Top: 192px gray placeholder image area (Home icon centered)
- Listing type badge (top-left): purple="For Rent", brand="For Sale"
- Price badge (top-right): white/90 backdrop rounded pill
- Body: title, location (MapPin), size/beds/baths/furnishing row, ID + delete button

**Add listing form:** Expands inline above the grid. 2-column layout with many fields:
- Title, Listing Type, Property ID, Property Type, Category, City, Bedrooms, Bathrooms, Built-up area, Plot area, Area/Neighborhood, Furnishing, Building name, Floor number, Parking, Property age, View, Condition, Sale/Rent price (conditional), Rental duration, Security deposit, Negotiable, Description

**Issues:**
- Yellow debug banner at top showing API URL (must be removed before production)
- `alert()` used for error handling (should use toast/inline error)
- No image upload functionality
- No edit listing functionality (only add/delete)
- No search or filter on listings

---

#### Agents
**Layout:** 3-column card grid (responsive)

**Card structure:** Avatar circle (User icon), name, Priority badge (brand-600 bg-brand-50 pill), phone, email (optional), territories as pill chips, specialties

**Add agent form:** 2-column grid. Fields: Full Name, Phone, Email, Territories (comma-separated), Specialty (Rent/Buy only), Priority (1-10)

**Issues:**
- No edit functionality
- No performance data per agent (leads assigned, conversion rate)
- No availability/schedule toggle

---

#### Tours
**Layout:** Weekly calendar grid (left 2/3) + upcoming list + stats (right 1/3)

**Calendar:** 7 columns (Mon-Sun) x 6 time rows (9am-3pm). Colored event blocks (emerald=confirmed, amber=pending, red=conflict)

**Upcoming Tours list:** Property thumbnail placeholder + name + lead name + date/time

**Tour Statistics:** Completed (24, +12%), Pending (8), No-show (3), Canceled (5)

**Critical issue:** ALL DATA IS HARDCODED MOCK DATA. The calendar, upcoming tours, and statistics are all static placeholder values. This page has no API integration.

---

#### AI & Routing
**Status:** Placeholder only. Shows a Bot icon and "AI & Routing configuration coming soon." Nothing functional.

---

#### Analytics
**Layout:** Header with days selector (7/14/30), then KPI cards, Model Split bars, Daily Breakdown table, Per-Conversation Costs table

**KPI cards:** Total Spend, Avg Cost/Conversation, Cache Hit Rate, Total API Calls

**Model Split:** Progress bar visualization per Claude model

**Daily Breakdown table:** Date, Cost, API Calls, Cache Hit Rate (with mini inline bar)

**Per-Conversation Costs table:** Sortable columns. Conversation ID (truncated, monospace), Cost, Calls, Input Tokens, Output Tokens, Time Range

**Data:** Live from API (`/analytics/costs` endpoint)

**This is the "Wakeeli AI Cost Dashboard" visible in file_262 screenshot.**

---

#### Settings
**Layout:** Header, role switcher row (demo only), 3 quick-action cards, then 2-column: Company Profile form + Integrations list

**Role switcher:** Toggles between Admin/Agent view (development feature, should not be in production UI)

**Quick action cards:** Company Profile (brand-50), Integrations (emerald-50), User Settings (amber-50) - all are buttons that don't navigate anywhere yet

**Company Profile form:** Company Name, Email, Phone, Address, Website - all inputs, no persistence

**Integrations list:** WhatsApp Business (2,847 messages), Meta/Facebook (1,452 imports), Website Widget (3,921 sessions) - ALL HARDCODED

---

## Part 5: Gap Analysis (What's Missing vs. What Exists)

Since the actual Wakeeli prototype wireframes cannot be read from the exported files, this section documents what's clearly incomplete or problematic in the current frontend:

### Functional Gaps

| Area | Current State | Status |
|------|--------------|--------|
| Tours page | 100% hardcoded mock data | Not functional |
| AI & Routing | Empty placeholder | Not started |
| Settings | Forms don't save | Not functional |
| Reply to conversation | No input to send messages | Missing |
| Agent assignment | No UI action visible | Missing |
| Listings images | Gray placeholder only | Missing |
| Edit listings | No edit, only add/delete | Missing |
| Edit agents | No edit, only add/delete | Missing |
| Pagination | Not implemented anywhere | Missing |
| Real user names | Phone number used everywhere | Design gap |
| Notifications bell | Hardcoded "3" badge | Fake |
| New Lead badge | Hardcoded "3" | Fake |

### Design/Polish Issues

| Issue | Location | Notes |
|-------|----------|-------|
| Yellow debug banner | Listings | Shows API URL - remove immediately |
| `alert()` for errors | Listings | Replace with toast or inline error |
| Role switcher visible | Settings | Dev-only, hide in production |
| X button in header | AppLayout | Appears non-functional, purpose unclear |
| Hardcoded integrations data | Settings | Shows fake numbers |
| Phone number as identity | Leads, Conversations | No real name shown for contacts |
| Static week dates in Tours | Tours | "March 18-24, 2024" - past date hardcoded |

### Solid Foundations

| Area | Notes |
|------|-------|
| Global layout | Clean sidebar + header structure, works well |
| Brand colors | Consistent use of brand-600 (blue) and wakeeli-sidebar (navy) |
| Card component | Rounded-xl, border-slate-200, shadow-sm used consistently |
| Status badges | Consistent color system (blue=new, emerald=qualified, purple=handed_off, slate=closed) |
| Conversations page | Split panel layout works. Real data. Auto-refresh. |
| Dashboard KPIs | Live data, clean cards |
| Analytics | Fully functional, live data, sortable table |
| Responsive basics | Grid columns collapse properly on smaller screens |
| Tailwind setup | Well-configured with custom brand colors |

---

## Part 6: Design Language Extracted from Reference Images

Based on what Fox pinned as inspiration on the Miro board, here are the design patterns he was drawn to:

**Typography:**
- Very large, heavy headlines (60px+) for hero/landing sections
- Clean sans-serif (similar to Inter or Geist) for body
- High contrast: white text on dark, dark text on white

**Color palette direction (from references):**
- Dark navy/black hero sections (like Sendblue's `#0f0f14` almost-black)
- Teal/dark-green accent buttons (not pure blue like current brand-600)
- White content sections with very light gray dividers
- CTA buttons: dark fill with white text, rounded pill shape

**Layout patterns:**
- Full-width hero with centered text + single CTA
- Left list + right feature preview (2-column feature sections)
- 3-column feature card grids with colored/gradient backgrounds
- Horizontal scrollable integration logos
- Chat widget demos embedded in context

**Interaction style:**
- Card hover shadows
- Smooth transitions
- Minimalist icon usage

**Note:** The existing frontend uses `#2563eb` (bright blue) as the primary brand color. The references Fox pinned lean toward darker, more premium palette choices. This may be intentional and worth confirming.

---

## Part 7: Questions for Fox

These are the critical items that need clarification before rebuilding:

1. **The actual prototype:** The Miro board's native wireframes (if you drew any in Miro) are in the encrypted canvas.json. Can you share screenshots of the actual Wakeeli app frames you designed? Or export them individually from Miro as PNGs?

2. **Brand color:** The references you pinned use dark teal/dark-green CTA buttons. Should the new frontend keep the current `#2563eb` (blue) brand color, or shift to something closer to what you were referencing?

3. **Lead identity:** Right now contacts are identified only by phone number. Is there a plan to integrate name/email data from WhatsApp profiles, or should we design a manual "add lead info" flow?

4. **Conversations reply:** Should agents be able to reply to leads directly from the dashboard? Or is that handled separately in WhatsApp?

5. **Human takeover:** How does an agent "take over" a conversation from the AI? Is there a button/flow for this that should appear in the Conversations or Leads page?

6. **Tours:** Is the tour scheduling feature supposed to be real (integrated with a calendar API / WhatsApp scheduling flow)? Or is it purely a visual calendar for agents to track tours they book manually?

7. **Listings images:** Should agents be able to upload property photos, or is this out of scope for now?

8. **AI & Routing:** What should this page actually do? Configure the AI prompt? Set routing rules (which agent gets which lead type/territory)? Both?

9. **Settings persistence:** Should the Company Profile form actually save to the backend? And what happens with the role switcher in production - is there real auth with different roles?

10. **Landing page vs. dashboard:** The Miro board is named "Wakeeli's website" and the references are marketing/landing page screenshots. Is the rebuild focused on the admin dashboard (what's currently built), the public-facing website, or both?

---

## Part 8: Effort Assessment

Given what's currently built and the gaps identified:

**If rebuilding only the current dashboard to match a new prototype:**

| Area | Effort |
|------|--------|
| Reskin global layout (colors, fonts, spacing) | Small (1-2 days) |
| Tours page with real data | Medium (2-3 days) |
| AI & Routing configuration page | Medium-Large (3-5 days, depends on scope) |
| Settings with real persistence | Medium (2-3 days) |
| Conversations reply + agent takeover | Medium (2-3 days) |
| Listings with image upload + edit | Medium (2-3 days) |
| Agents with performance data | Small-Medium (1-2 days) |
| Leads with real names + better UX | Small (1-2 days) |
| Remove debug code, fix hardcoded values | Small (0.5 days) |
| **Total estimate** | **~3-4 weeks** |

**If building a new public-facing Wakeeli website (separate from dashboard):**
That would be a separate project entirely. The references pinned are all marketing/landing page screenshots, suggesting Fox may want a polished website in addition to the admin dashboard.

---

## Summary

The Miro board contains 26 competitor/inspiration screenshots, not Wakeeli UI mockups. The actual prototype lives in Miro's binary canvas format which can't be read externally. The current frontend is a partially functional React app with solid foundations (layout, color system, live data on Dashboard/Conversations/Analytics) but significant gaps (Tours is all fake data, AI & Routing is empty, Settings doesn't save, no reply functionality).

**Immediate action needed:** Fox should share the actual Miro prototype frames directly so the rebuild can be properly spec'd.
