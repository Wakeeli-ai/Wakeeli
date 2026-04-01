# Wakeeli Miro Prototype Analysis
## Comprehensive Frontend Rebuild Reference

**Board ID:** uXjVGMGkqjU
**Total Items Analyzed:** 4,053
**Total Screens Found:** 39 (desktop and mobile)
**Analysis Date:** 2026-04-01

---

## 1. Executive Summary

The Miro board contains a complete, detailed prototype of the Wakeeli admin dashboard. It covers two user roles (Admin and Agent), a full set of desktop screens, a complete mobile application, and several supplementary screens (drawers, detail views, duplicate variants).

**Core admin desktop screens (1440px wide):**
1. Login
2. Dashboard
3. Leads
4. Conversations
5. Listings
6. Agents
7. Visits (Tours)
8. Analytics
9. Settings

**Supplementary desktop screens:**
- Agent Details Drawer (right-side panel overlaying Agents)
- Lead Detail Drawer (overlaying Leads)
- Tour Detail View (full page)
- Inbox (agent role variant of Conversations)
- My Leads (agent role variant of Leads)
- My Visits (agent role variant of Visits)
- Copy variants and alternate layouts at higher x-coordinates

**Mobile screens (623px wide, ~12 total):**
- Mobile Login
- Mobile Dashboard
- Mobile Leads Screen
- Mobile Lead Detail
- Mobile Conversations
- Mobile Listings
- Mobile Tours Calendar
- Mobile Agents
- Mobile Analytics Dashboard
- Mobile Settings
- Tour Detail Drawer (mobile)

**Key architectural note from prototype board annotation:**
> "Clicking an agent or the blue eye should open a right-side drawer"

The prototype uses a consistent layout: a fixed left sidebar (navigation), a top header bar (search, notifications, user info), and a main content area that scrolls vertically.

---

## 2. Board Item Inventory

### Item Type Breakdown
| Type | Count |
|------|-------|
| text | 2,302 |
| shape | 693 |
| mockup | 602 |
| input_button | 157 |
| image | 130 |
| input_text | 69 |
| prototyping_screen | 39 |
| input_toggle | 30 |
| input_dropdown | 27 |
| prototyping_container | 4 |
| **Total** | **4,053** |

### Container Layout
| Container ID | Name | Size | Position (canvas center) |
|-------------|------|------|------------------------|
| 3458764656519447877 | Untitled | 1600x1184 | (0, 0) |
| 3458764656560186494 | Prototype (Main) | 18790x3991 | (-4913, 1311) |
| 3458764656755952219 | Prototype (Desktop Small) | 1574x1504 | (27084, -810) |
| 3458764656757263576 | Prototype (Mobile) | 535x1339 | (26203, 3757) |

### Screen Position Map (sorted by x, all desktop screens)
| Screen Name | x | y | Width | Height | Children |
|------------|---|---|-------|--------|----------|
| Login | 2787 | 1105 | 1440 | 900 | 12 |
| Dashboard | 4853 | 1410 | 1440 | 1510 | 185 |
| Leads | 6745 | 1204 | 1440 | 1098 | 165 |
| Lead Detail Drawer | 6745 | 3201 | 1244 | 1436 | 68 |
| Conversations | 8458 | 1268 | 1440 | 1341 | 145 |
| Listings | 10108 | 1492 | 1440 | 1835 | 227 |
| Agents | 11794 | 1065 | 1440 | 981 | 149 |
| Agent Details Drawer | 11829 | 2682 | 1440 | 1092 | 177 |
| Visits | 13639 | 1169 | 1440 | 1297 | 175 |
| Analytics | 15483 | 1546 | 1440 | 2051 | 123 |
| Settings | 17299 | 1495 | 1440 | 1948 | 172 |

---

## 3. Global Layout Patterns

### Sidebar (all screens except Login)

Fixed left sidebar, approximately 160px wide.

**Top section:**
- Wakeeli logo/wordmark (bold, top-left)
- Notification badge showing "3" (top-right area)

**Navigation items (top to bottom):**
1. Dashboard
2. Leads
3. Conversations
4. Listings
5. Tours (labeled "Tours" in admin, "Property Visits" in agent role)
6. Agents
7. AI & Routing
8. Analytics
9. Settings

**Bottom section:**
- Logout (bottom of sidebar)

**Agent role nav differences:**
- "Leads" becomes "My Leads"
- "Conversations" becomes "Inbox"

### Top Header Bar (all screens except Login)

Full-width bar, approximately 56px tall.

**Left side:** Global search input (placeholder: "Search leads by phone or message...")
**Right side (left to right):**
- "New Lead" button with red badge showing "3"
- Bell notification icon with red badge "3"
- User info: "Sarah Mitchell" (name) / "AdminSM" (role label)
- User avatar initials circle "SM"
- Close/X button

---

## 4. Desktop Screen Detail

### 4.1 Login Screen
**Size:** 1440x900
**Screen ID:** 3458764656524016578

**Layout:** Split screen. Left half: large hero image (property photo). Right half: centered login form on white background.

**Text elements (top to bottom):**
- "Welcome to" (bold, large heading, navy blue: rgb(0,51,102))
- "Wakeeli" (logo text, implied from overall branding)
- "Sign in to access your real estate dashboard" (subtitle)
- "Email Address" (field label, bold)
- "Password" (field label, bold)
- "Remember me" (toggle label)
- "Forgot Password?" (bold link)

**Form fields:**
- Email input (480px wide, 50px tall)
- Password input (480px wide, 50px tall)

**Controls:**
- "Remember me" toggle
- Sign in button (480x52, no visible text label in prototype data)
- "Forgot Password?" text link

**Note:** The Wakeeli logo image is present (item 3458764656523834531) as a large property photo on the left panel.

---

### 4.2 Dashboard Screen
**Size:** 1440x1510
**Screen ID:** 3458764656554129522

**Header area:**
- Page title: "Dashboard" (bold, large)
- Subtitle: "Welcome back, Sarah! Here's what's happening today."

**KPI Cards Row (4 cards, equal width):**
| Card Label | Value | Sub-info |
|-----------|-------|---------|
| New Leads Today | 24 | vs yesterday +12% |
| Tours Booked | 12 | vs yesterday +15% |
| Deals Closed | 3 | vs yesterday +8% |
| Avg Response Time | 2.4 min | AI: 0.8min / Human: 4.2min |

**Main content area (2-column layout):**

**Left column (wider): Conversations panel**
- Section header: "Conversations"
- Filter tabs (buttons at top): All, Urgent, AI Handover, Waiting, New
- Conversation list items, each showing:
  - Avatar initials circle
  - Contact name (bold)
  - Time ago
  - Status badge (Urgent / Follow-up / Waiting / New)
  - Last message preview
  - Agent assignment indicator

Sample conversations:
- Robert Brown | AI Handover | "When can we schedule the tour? I'm available this afternoon." | 5 min ago
- Emily Johnson | Follow-up | "I have some questions about the financing options for this property." | 12 min ago
- Thomas Nguyen | 18 min ago | "Ready to submit an offer. What's the next step."
- Karen Martinez | Waiting | "Can you send me more photos of the backyard area?" | 25 min ago
- James Davis | New | "Is the property still available for viewing this weekend?" | 1 hour ago

Sample chat messages (right panel of conversations):
- "Hi, I'm interested in scheduling a tour of the downtown loft. Is it available this week?" (10:32 AM)
- "Yes, the downtown loft is available for tours this week. We have openings on Wednesday at 3 PM and Friday at 10 AM. Would either of those ti..." (10:35 AM, AI)
- "Friday at 10 AM would be perfect! Can I bring my partner along?" (10:40 AM)
- "AI is typing..." (status indicator)

**Right column: Quick Actions panel**
- Section header: "Quick Actions"
- Subtitle: "Streamline your workflow"
- Button list (5 items):
  1. View Unassigned Leads
  2. Add New Listing
  3. View Today's Tours
  4. Edit Existing Listing
  5. View Analytics Report

**Bottom section: Today's Tours**
- Section header: "Today's Tours" with "View All" link
- Tour cards showing:
  1. Modern Loft Downtown | 9:00 AM | 2847 Oak Street, Suite 301 | Sophia Chen (SC) | Agent: Michael Chen
  2. Family Home with Pool | 11:30 AM | 1542 Maple Avenue | Brandon Harris (BH) | Agent: Jessica Park
  3. Luxury Penthouse | 2:00 PM | 890 Harbor View Drive | Nicole Garcia (NG) | Agent: David Lee
  4. Suburban Townhouse | 4:30 PM | 3621 Elm Street | Alex Wilson (AW) | Agent: Sarah Mitchell

**Controls:**
- Search input (global header)
- "New Lead" button (header) with red badge "3"
- Filter toggle button (conversations panel)
- 5 Quick Action buttons
- Message input at bottom of chat panel

---

### 4.3 Leads Screen
**Size:** 1440x1098
**Screen ID:** 3458764656524016581

**Header area:**
- Page title: "Leads" (bold)
- Subtitle: "Manage and track all your property leads"
- Top-right action buttons: "Export" button, "Table View" button

**Filter bar:**
- Label: "Filters:" (bold)
- Search input (placeholder behavior)
- Second search/filter input
- 4 dropdowns (filter by various criteria)
- "Clear All" button

**Table:**
Column headers (left to right):
1. Lead Name
2. Contact
3. Source
4. Type
5. Status
6. Match Score
7. Assigned Agent
8. Last Activity

Per-row toggles visible (one toggle per row, 6 toggles shown = 6 rows).

**Sample lead data rows:**

Row 1: Emily Martinez
- Contact: +1 555-0142 / emily.m@email.com
- Source: WhatsApp (badge)
- Type: Buy (badge)
- Status: Qualified (badge)
- Match Score: 85%
- Assigned Agent: Marcus Rodriguez (MR avatar)
- Last Activity: 2 hours ago | "Viewed listing"
- Tag: Downtown Seeker

Row 2: James Wilson
- Contact: +1 555-0298 / j.wilson@email.com
- Source: Instagram (badge)
- Type: Buy (badge)
- Status: Qualifying (badge)
- Match Score: 62%
- Assigned Agent: Jennifer Chen (JC avatar)
- Last Activity: 5 hours ago | "AI follow-up sent"
- Tag: Family Home Hunter
- "View Details" action visible

Row 3: Sophia Patel
- Contact: +1 555-0876 / sophia.p@email.com
- Source: Website (badge)
- Type: Rent (badge)
- Status: Tour Booked (badge)
- Match Score: 92%
- Assigned Agent: Sarah Mitchell (SM avatar)
- Last Activity: 1 day ago | "Tour scheduled"
- Tag: Luxury Buyer

Row 4: Robert Johnson
- Contact: +1 555-0431 / rob.j@email.com
- Source: WhatsApp (badge)
- Type: Buy (badge)
- Status: New (badge)
- Match Score: 45%
- Assigned Agent: AI Routing
- Last Activity: 3 hours ago | "Initial contact"
- Tag: Investment Property

Row 5: Lisa Anderson
- Contact: +1 555-0652 / l.anderson@email.com
- Source: Website (badge)
- Type: Rent (badge)
- Status: Handed to Agent (badge)
- Match Score: 78%
- Assigned Agent: David Thompson (DT avatar)
- Last Activity: 6 hours ago | "Agent contacted"
- Tag: First-Time Buyer

**Pagination footer:** "Showing 1-5 of 47 leads" with pagination buttons (previous, numbered pages, next)

**Controls:**
- Per-row toggle (one per lead, purpose unclear from data alone, likely "Available/Contacted" or similar)
- "View Details" button per row (at least one visible)

---

### 4.4 Conversations Screen
**Size:** 1440x1341
**Screen ID:** 3458764656524016583

**Layout:** Split panel. Left: conversation list (~320px). Right: active chat view.

**Left panel - conversation list:**

Filter tabs (top, buttons):
- (implied all/ai/agent/waiting from current implementation)

Additional header controls visible:
- "AI Active" toggle button
- Contact name pill button (e.g., "Marcus Thompson")
- Status/priority pills

Conversation list items:
1. Marcus Thompson (MT) | Urgent | AI Active | "I'm interested in the 3-bedroom condo downtown. Is it still available?" | 2m ago
2. Jennifer Rodriguez (JR) | Hot | Agent: Sarah | "Thank you! I'll review the documents and get back to you." | 15m ago
3. David Kim (DK) | Cold | Waiting | "Can we schedule a tour for this weekend?" | 1h ago
4. Amanda Williams (AW) | Urgent | AI Active | "What's the HOA fee for the property on Elm Street?" | 2h ago
5. Robert Brown (RB) | Hot | Agent: Mike | "I need more information about the financing options." | 3h ago

**Right panel - chat thread (Marcus Thompson):**
- Header: "Marcus Thompson" | "Online" status | "Urgent" badge
- Chat messages (oldest to newest):
  - MT: "Hi, I'm looking for a 3-bedroom condo in the downtown area. Do you have anything available?" (10:32 AM)
  - AI: "Hello Marcus! Yes, we have several 3-bedroom condos available in downtown. I can show you some great options. What's your budget range?" (10:33 AM)
  - MT: "I'm looking at around $400,000 to $500,000. Preferably something with parking included." (10:35 AM)
  - AI: "Perfect! I have a beautiful 3-bedroom condo at 245 Market Street that fits your criteria. It's priced at $475,000 and includes 2 parking spots..." (10:36 AM, AI)
  - MT: "Yes please! And what's the square footage?" (10:37 AM)
  - AI: (10:38 AM, AI) - continued response
  - AI: "The condo is 1,850 square feet with an open floor plan. It features hardwood floors, stainless steel appliances, and a private balcony with city views..." (10:39 AM, AI)
  - MT: "That looks amazing! I'm interested in the 3-bedroom condo downtown. Is it still available?" (10:42 AM)
  - "AI is typing..." (status indicator at bottom)

**Bottom action bar (right panel):**
- Message input (597px wide)
- "Assign Agent" button
- "View Full Conversation" button
- "End Chat" / action button

**Top controls (right panel header):**
- Contact name header
- Online status pill
- Action buttons (4 visible in header area: ~65-82px wide buttons)

---

### 4.5 Listings Screen
**Size:** 1440x1835
**Screen ID:** 3458764656524016584

**Layout:** Split. Left: listing detail panel (~400px). Right: listing grid (property cards).

**Left panel - Listing Details:**

Section header: "Listing Details"

**Listing stats header (2 stats):**
- For Sale: 24
- For Rent: (count implied)

**Status badges:** Active, Hot (shown on listings)

**Core Property Info section:**
- Property ID: ID84390439
- Property Type: Single Family
- Year Built: 2018
- Bedrooms: 4
- Bathrooms: 3
- Area (m2): 140 sqm
- Address: (shown in listing cards)

**Pricing & Financials section:**
- List Price: $425,000
- Price per sq ft: $173
- Est. Monthly: $2,340

**Amenities section:**
- Hardwood Floors
- Central AC
- Garage
- Fireplace
- Deck
- Fenced Yard

**AI Matching Rules section:**
- "Matches buyers looking for family homes in Springfield area"
- "Suitable for first-time homebuyers with $400-450K budget"
- "Ideal for families with 2-3 children seeking good school district"

**Tour Availability section:**
- Tuesday, March 19: Available | 2:00 PM - 4:00 PM
- Thursday, March 21: Available | 10:00 AM - 12:00 PM
- Saturday, March 23: 2 Booked | 1:00 PM - 5:00 PM

**Right side - Listing grid:**

Shows listing cards in a grid layout (appears 2-column). Each card shows:
- Property image (or placeholder)
- Status badge (Active, Hot Listing, Pending, Inactive)
- Address line 1 (bold): e.g., "847 Maple Avenue"
- City/state: "Springfield, IL 62704"
- Price: e.g., "$425,000"
- Bedrooms count
- Bathrooms count
- Square footage: "2,450 sq ft"
- Views: "1,247" / "2,891"
- {CITY} and {AREA / NEIGHBORHOOD} placeholders (template fields for dynamic content)

**Sample listings in grid:**
1. 847 Maple Avenue | Springfield, IL 62704 | $425,000 | 4 bed, 3 bath, 2,450 sq ft | Views: 1,247 | Active + Hot
2. 1523 Lakeshore Drive | Madison, WI 53703 | $875,000 | 5 bed, 4 bath, 3,850 sq ft | Views: 2,891 | Hot
3. 392 Victorian Lane | Portland, OR 97201 | $649,900 | 4 bed, 2.5 bath, 2,890 sq ft | Views: 856 | Pending
4. 2801 Downtown Plaza, Unit 15C | Seattle, WA 98101 | $725,000 | 3 bed, 2 bath, 1,680 sq ft | Views: 1,523 | Active
5. 6742 Mountain Ridge Road | Denver, CO 80202 | $1,125,000 | 6 bed, 5 bath, 4,920 sq ft | Views: 3,104 | Active
6. 215 Craftsman Court | Austin, TX 78701 | $385,000 | 3 bed, 2 bath, 1,840 sq ft | Views: 412 | Inactive

**Header controls:**
- Search/filter input
- "Add Listing" button (with icon)
- Filter buttons: (implied from filter bar)
- "View All" link

**Note:** Listing title shown as "Listing TITLE" (template placeholder text) and city as "{CITY}" in some places, confirming these are dynamic fields.

---

### 4.6 Agents Screen
**Size:** 1440x981
**Screen ID:** 3458764656524016585

**Header area:**
- Page title: "Agents" (bold)
- Subtitle: "Manage your team, track performance, and optimize lead assignments"
- Action buttons: "Add Agent" button, "Filter" button
- Filter dropdowns (2 visible)

**KPI Cards Row (4 cards):**
| Card Label | Value | Sub-info |
|-----------|-------|---------|
| Total Agents | 24 | +2 this month |
| Active Now | 18 | 75% availability |
| Avg Response Time | 8m | -2m improvement |
| Avg Conversion | 34% | +5% this quarter |

**Availability status tabs:**
- Available (18) - button/tab
- On Break (3) - button/tab
- Offline (3) - button/tab

**Agent table:**

Column headers:
1. Agent
2. Role
3. Status
4. Total Assigned Leads
5. Live Load: Today
6. Conversion Rate
7. Avg Response
8. (Actions - implied from drawer feature)

**Sample agent rows:**

Row 1: (name not shown in text, ID visible as "JW" initials)
- Role: Senior Agent
- Status: Available
- Total Assigned Leads: 47
- Live Load Today: 19
- Conversion Rate: 42%
- Avg Response: 5m 32s

Row 2: (MC initials)
- Role: Senior Agent
- Status: Available
- Total Assigned Leads: 52
- Live Load Today: 23
- Conversion Rate: 39%
- Avg Response: 6m 18s

Row 3: (ER initials)
- Role: Agent
- Status: Available
- Total Assigned Leads: 38
- Live Load Today: 20
- Conversion Rate: 35%
- Avg Response: 7m 45s

Row 4: (DT initials)
- Role: Agent
- Status: On Break
- Total Assigned Leads: 41
- Live Load Today: 15
- Conversion Rate: 33%
- Avg Response: 9m 12s

Row 5: (SP initials)
- Role: Agent
- Status: Available
- Total Assigned Leads: 29
- Live Load Today: 6
- Conversion Rate: 28%
- Avg Response: 11m 03s

**Pagination:** "Showing 5 of 24 agents" with pagination controls (previous, 1, 2, 3, next button, page size selector)

**Prototype note:** Clicking an agent OR a "blue eye" icon should open the Agent Details Drawer as a right-side panel.

---

### 4.7 Agent Details Drawer
**Size:** 1440x1092
**Screen ID:** 3458764656611969039

This overlays the Agents screen as a right-side panel.

**Drawer header:**
- "Agent Details" heading
- Close button (X)

**Agent profile section:**
- Agent name: "Jessica Williams" (bold)
- Initials avatar: "JW"
- Role: "Senior Agent"

**Shared KPI bar (same as Agents screen):**
- Total Agents: 24 | Active Now: 18 | Avg Response Time: 8m | Avg Conversion: 34%

**Agent Personal Information section:**
- Full Name: Jessica Marie Williams
- Birth Date: March 15, 2000 (26 years old)
- Personal Email: j.williams.personal@gmail.com
- Company Email: jessica.williams@wakeeli.com
- Phone Number: 71 701038
- Area(s) Covered: Beirut, Achrafieh

**Agent Summary section:**
- Role: Senior Agent
- Status: Available
- Working Hours: Mon-Fri, 9:00 AM - 6:00 PM

**Performance Snapshot section:**
- "Past 30 Days" sub-header
- Leads Handled: 47
- Conversion Rate: 42%
- Avg Response Time: 5m 32s
- Tours Booked: 23

**Background agent table** (the Agents list remains visible behind/alongside):
Same table data as Agents screen with rows for Jessica Williams, Michael Chen, Emily Rodriguez, David Thompson, Sophia Patel.

**Actions:**
- Filter/sort dropdowns (2)
- Navigation buttons (previous/next, page size)
- One large CTA button at bottom (y=1066, 235x53 - likely "Assign Lead" or "View All Conversations")

---

### 4.8 Visits (Tours) Screen
**Size:** 1440x1297
**Screen ID:** 3458764656524016588

**Header area:**
- Page title: "Property Tours" (admin) / "Property Visits" (agent)
- Subtitle: "Manage and schedule property tours with leads"
- Date range selector: "March 18-24, 2024"
- View toggle buttons: Day | Month (Week view active by default in current frontend)
- "Schedule Tour" button

**Calendar grid (main content):**

Column headers: Time | Mon 18 | Tue 19 | Wed 20 | Thu 21 | Fri 22 | Sat 23 | Sun 24

Time rows with tour entries:
- 9:00 AM - 10:00 AM: Tue 19: Marcus Rodriguez (Sunset Villa Estates)
- 10:00 AM - 11:00 AM: Tue 19: Patricia O'Brien (Riverside Luxury Lofts) | Wed 20: Christine Anderson (Lakefront Residences)
- 11:00 AM - 12:00 PM: Wed 20: Robert Jackson (Mountain View Estates) | Thu 21: Jennifer Kim (agent)
- 1:00 PM - 1:30 PM: Wed 20: Gregory Thompson (no property listed - likely a cancelled/blocked slot)
- 2:00 PM - 3:00 PM: Mon 18: Latoya Washington (Harbor View Condos)
- 3:00 PM - 4:00 PM: Wed 20: Amanda Foster (Parkside Townhomes)

**Right sidebar (2 panels):**

Panel 1: Upcoming Tours
- Header: "Upcoming Tours" | "View All" link | Count badge: "8"
- Tour items:
  1. Sunset Villa Estates | Marcus Rodriguez | Mar 19, 9:00 AM | Status: Scheduled (JK - Jennifer Kim assigned)
  2. Riverside Luxury Lofts | Patricia O'Brien | Mar 20, 10:00 AM | Status: Scheduled (MC - Michael Chen assigned)
  3. Parkside Townhomes | Amanda Foster | Mar 20, 3:00 PM | Status: Scheduled (SM assigned)
  4. Mountain View Estates | Robert Jackson | Mar 21, 11:00 AM | Status: Pending (ED - Emily Davis assigned)

Panel 2: Tour Statistics (dropdown filter)
- Completed: 24 | +12%
- Pending: 8
- No-show: 3 | +1
- Canceled: 5 | -2

Panel 3: Agent Availability
- Jennifer Kim (JK) | Available | 3 tours today
- Michael Chen (MC) | Available | 1 tour today
- David Martinez (DM) | Busy | 2 tours today
- Sarah Mitchell (SM) | Available | 2 tours today
- Emily Davis (ED) | Available | 1 tour today

---

### 4.9 Analytics Screen
**Size:** 1440x2051
**Screen ID:** 3458764656524016590

**Header area:**
- Page title: "Analytics Dashboard" (bold)
- Subtitle: "Performance metrics and insights for your real estate operations"
- 3 dropdown filters (date range selectors)

**KPI Cards Row (4 cards):**
| Card Label | Value | Change |
|-----------|-------|--------|
| Total Leads | 1,847 | +12.4% vs last period |
| Tours Booked | 542 | +5.8% vs last period |
| Avg Response Time | 4.2m | +18.3% vs last period |
| Tours to Deals Ratio | 5.2% | -22.1% vs last period |

**Charts section (2-column layout):**

Chart 1: "Leads Per Source" (bar/pie chart)
- WhatsApp: 687 leads (37.2%)
- Social Media: 512 leads (27.7%)
- Website: 389 leads (21.1%)
- Other: 259 leads (14.0%)

Chart 2: "Tours to Deals Ratio" (line/trend chart)

**Second row charts:**

Chart 3: "Tours Booked by Agent" (bar chart - data values not text, shown as graphical)

Chart 4: "Response Time Distribution"
- Under 15 mins: 42%
- 15 mins - 1 hour: 31%
- 1-3 hours: 18%
- Over 3 hours: 9%

**AI vs Agent Performance Comparison table:**

Table header: "AI vs Agent Performance Comparison" | "Export Report" button

| Metric | AI Assistant | Human Agent |
|--------|-------------|-------------|
| Average Response | 1.8m | 4.3m |
| (AI is 58% faster) | (baseline) | |
| AI Qualification | 72.4% | |
| Agent Qualification | | 66.2% |
| AI Qualification vs Agent: +6.2% | | |

**AI Volume stats (bottom):**
- AI Handled Conversations: 1,284 (69.5% of total conversations)
- AI to Agent Handoffs: 147 (11.4% of AI conversations)

---

### 4.10 Settings Screen
**Size:** 1440x1948
**Screen ID:** 3458764656524016591

**Header area:**
- Page title: "Settings" (bold)
- Subtitle: "Manage your company profile, integrations, user permissions, and billing preferences"

**Top navigation cards (3 cards, horizontal row):**
1. Company Profile | "Basic information" | arrow icon
2. Integrations | "3 active connections" | arrow icon
3. User Settings | "Roles & Permissions" | arrow icon

**Company Profile section:**

Header: "Company Profile" | "Save Changes" button

Input fields (5):
1. Company Name
2. Email Address
3. Phone Number
4. Address
5. Website

**Time Zone dropdown** (separate field below)

**Integrations section:**

Header: "Integrations" | "Add New Integration" button

Active integrations listed:
1. WhatsApp Business | Active (badge) | Connected 3 days ago | Messages handled: 2,847
2. Meta (Facebook) | Active (badge) | Connected 1 week ago | Lead imports: 1,452
3. Website Widget | Active (badge) | Connected 2 weeks ago | Chat sessions: 3,921

"Add New Integration" button | "Connect more platforms" subtitle

**User Roles & Permissions section:**

Header: "User Roles & Permissions" | "Add User" button

User rows:
1. Sarah Mitchell (SM) | Admin | sarah.mitchell@wakeeli.com | Full Access, Billing, User Management
2. James Rodriguez (JR) | Manager | james.rodriguez@wakeeli.com | Leads, Listings, Billing
3. Emily Chen (EC) | Agent | emily.chen@wakeeli.com | Leads, Tours, Analytics
4. Marcus Thompson (MT) | Agent | marcus.thompson@wakeeli.com | Conversations, Tours, Settings

**Notifications section:**

Header: "Notifications"

Toggle items:
1. New Lead Alerts (toggle) | "Get notified of new leads instantly"
2. Tour Reminders (toggle) | "Reminders before scheduled tours"
3. Weekly Reports (toggle) | "Performance summary every week"

---

### 4.11 Lead Detail Drawer
**Size:** 1244x1436
**Screen ID:** 3458764656577436321

This is the drawer that opens when clicking a lead in the Leads table.

**Drawer layout:** Left section (lead info/AI analysis) and right panel (matched listings).

**Lead header:**
- Lead name: Emily Martinez (bold)
- Tag: Downtown Seeker
- Status: Qualified Lead

**Tab navigation:** Profile | Notes

**AI Match Scores:**
- Overall Match Score: 85%
- Budget Match: 90%
- Location Match: 85%
- Property Type Match: 95%
- Engagement Score: 75%

**Lead Information section:**
- Created: May 15, 2023
- Assigned: Marcus Rodriguez
- Source: WhatsApp Campaign
- Contact: +1 555-0142 | emily.m@email.com | Connected via WhatsApp

**Lead Preferences:**
- Budget Range: $750,000 - $1,200,000
- Preferred Locations: Downtown, Midtown, Riverside
- Property Type: Condominium, Apartment
- Bedrooms: 2-3 Bedrooms
- Bathrooms: 2+ Bathrooms
- Additional Requirements: Parking, Gym, Doorman

**AI Insights section:**
- "Emily is highly interested in downtown properties with city views. Based on her browsing patterns, she's most active in the evenings and responds..."
- "Recommended next step: Schedule an in-person tour of The Westbrook Residences, as it matches 85% of her criteria."

**Matched Listings section:**
- Header: "Matched Listings" | "View All (12)" link
- Showing 1-5 of 47 leads (pagination)

Sample listings:
1. Park Avenue Heights bed- | Rent | $1,050,000
2. The Westbrook Residences | Downtown | Rent | $85,000

**Actions section:**
- 3 CTA buttons at bottom
- "Reassign Lead" button

**Notes tab:**
- Notes text area (359x70 input field)

---

## 5. Mobile Screens

### 5.1 Mobile Login
**Size:** 623x1107
**Screen ID:** 3458764656624931585

**Text elements:**
- "Welcome to" (bold)
- "Sign in to access your real estate dashboard"
- "Email Address" (bold)
- "Password" (bold)
- "Remember me" (toggle)
- "Forgot Password?" link

**Controls:**
- Email input
- Password input
- Remember me toggle
- Sign in button (543x80)
- Wakeeli logo/branding at top

---

### 5.2 Mobile Dashboard
**Size:** 623x3559
**Screen ID:** 3458764656624931583

**Header:** "Dashboard" (bold) | Hamburger menu / bottom nav

**Welcome message:** "Welcome back, Sarah! Here's what's happening today."

**KPI cards (stacked vertically):**
1. New Leads Today: 24 | +12%
2. Tours Booked: 12 | +15% vs yesterday
3. Deals Closed: 3 | +8% vs yesterday

**Quick Actions section:**
- "Quick Actions" heading
- "Streamline your workflow" subtitle
- 4 action buttons (stacked full-width, 545x73)

**Conversations section:**
- "Conversations" heading | "View All" link
- Lead items: Sophia Chen (SC) | Robert Brown (RB) | Emily Johnson (EJ) | Thomas Nguyen (TN) | Karen Martinez (KM) | James Davis (JD)
- Status tags: Urgent / Follow-up / Hot / Active / Cold
- Message previews

**Today's Tours section:**
- 9:00 AM: Alex Wilson (AW) | 2847 Oak Street, Suite 301 | Modern Loft Downtown
- 10:45 AM: Nicole Garcia (NG) | 3621 Elm Street | Suburban Townhouse
- 2:00 PM: Brandon Harris (BH) | 890 Harbor View Drive | Luxury Penthouse

---

### 5.3 Mobile Leads Screen
**Size:** 623x1673
**Screen ID:** 3458764656624931584

**Header:** Top navigation (logo, hamburger)

**Filter controls:**
- 4 filter dropdowns (top bar)
- Search input
- Secondary filter input
- "Clear All" button

**Lead cards (stacked):**

Card 1: Emily Martinez (EM)
- Match: 92% | Tag: Downtown Seeker | Status: Qualified
- Source: WhatsApp | Type: Buy
- Assigned: Marcus Rodriguez | 6 hours ago

Card 2: Jennifer Chen (JC)
- Match: 85% | Tag: Luxury Buyer | Status: Qualifying
- Source: Website | Type: Rent
- Assigned: Sarah Mitchell | 2 hours ago

Card 3: David Thompson (DT)
- Match: 78% | Tag: First-Time Buyer | Status: Tour Booked
- Source: WhatsApp | Assigned: AI Routing | 3 hours ago
- Type: Rent

Card 4: Sophia Patel (SP)
- Match: 72% | Tag: Family Home Hunter | Status: New
- Source: Instagram | Type: Rent
- Assigned: Emily Chen | 5 hours ago

Card 5: Robert Johnson (RJ)
- Match: 65% | Tag: Investment Property | Status: Initial Contact
- Source: Website | Type: Rent
- Assigned: AI Routing | 1 day ago

---

### 5.4 Mobile Lead Detail
**Size:** 623x3156
**Screen ID:** 3458764656624931586

**Header:** "Lead Details" (bold)

**Lead profile:**
- Emily Martinez (EM) | Downtown Seeker | Qualified Lead

**Match scores:**
- AI Confidence: 92%
- Overall Match: 85%

**Lead info:**
- Created: May 15, 2023
- Source: WhatsApp Campaign
- Assigned: Marcus Rodriguez
- Contact: +1 555-0142 | emily.m@email.com

---

### 5.5 Mobile Conversations
**Size:** 623x1678
**Screen ID:** 3458764656624931587

Conversation list with avatars, contact names, preview snippets, and status badges. Standard mobile chat list UI.

---

### 5.6 Mobile Listings
**Size:** 623x3920
**Screen ID:** 3458764656624931588

Full listing cards with property photos, price, bed/bath/sqft details.

---

### 5.7 Mobile Tours Calendar
**Size:** 623x2542
**Screen ID:** 3458764656624931590

Calendar-style tour scheduler with upcoming tour list and tour statistics (matching desktop layout but scrollable mobile format).

---

### 5.8 Mobile Agents
**Size:** 623x2150
**Screen ID:** 3458764656624931591

Agent cards in mobile format.

---

### 5.9 Mobile Analytics Dashboard
**Size:** 623x3856
**Screen ID:** 3458764656643523560 (and copy at 3458764656674891673)

KPI cards + chart visualizations in stacked mobile layout.

---

### 5.10 Mobile Settings
**Size:** 623x3949
**Screen IDs:** 3458764656643523594 (and copy at 3458764656674891799)

Stacked settings sections in mobile format.

---

### 5.11 Tour Detail Drawer (Mobile)
**Size:** 380x1232
**Screen ID:** 3458764656757221310

**Text:**
- "Tour Details" (bold)
- Date & Time | "Confirmed" (bold, badge)
- "March 15, 2024 at 2:00 PM" (bold)
- Property | "Sunset Vista Apartments" (bold)
- "4523 Maple Street, Unit 304, Austin, TX 78701"
- Lead | "Marcus Rodriguez" (bold)
- marcus.rodriguez@email.com
- (512) 847-2936
- "Shortcuts" (bold section)
- "Actions" (bold section)

**8 action buttons** (Shortcuts: 3 | Actions: 5)

---

## 6. Secondary Desktop Screens (Supplements / Agent Role Variants)

### Tour Detail View (Full Page)
**Size:** 1440x1372 | Screen ID: 3458764656755640960

A full-page version of the tour detail side panel. Left side shows tour list (same data as Visits calendar right sidebar). Right side shows detailed tour info:
- Selected tour: Sunset Villa Estates | Confirmed
- Address: 2847 Paradise Avenue, Beverly Hills, CA 90210
- Date & Time: March 19, 2024 at 9:00 AM
- Duration: 1 hour
- Lead: Marcus Rodriguez | (310) 555-0142 | marcus.rodriguez@email.com
- Special Requests: "Interested in viewing the master suite and outdoor entertainment area. Prefers morning tours."
- "Shortcuts" section (3 buttons)
- "Agent Actions" section (5 buttons)

---

### Inbox (Agent Role - Conversations Variant)
**Size:** 1440x1221 | Screen ID: 3458764656678326473

Agent's view of conversations. Shows only conversations assigned to this agent. Layout identical to Conversations screen.

---

### My Leads (Agent Role)
**Size:** 623x1673 | Screen ID: 3458764656674893243

Mobile variant of leads filtered to "My Leads".

---

### My Visits (Agent Role)
**Size:** 1440x1297 | Screen ID: 3458764656674891400

The "Property Visits" version of the Tours screen for agents. Identical layout to the admin Tours screen but labeled "Property Visits".

**Unique to this screen:**
- Column header "Week" toggle: Day | Month visible
- "Edit Availability" button (agent-specific)
- Title: "Property Visits" not "Property Tours"

**Tour calendar entries same as admin Visits screen.**

---

### Wakeeli Tours (Desktop Small Container - 1574px)
**Size:** 1574x1504 | Container: 3458764656755952219

A slightly wider desktop variant showing the Tour Detail View layout. Same data as Tour Detail View screen but in a slightly different breakpoint format.

**Notable**: This container has its own prototyping_screen child with a full sidebar nav and tour detail panel.

---

## 7. Complete Text Content Inventory

### Navigation Labels (across all screens)
- Dashboard
- Leads / My Leads (agent)
- Conversations / Inbox (agent)
- Listings
- Tours / Property Visits (agent)
- Agents
- AI & Routing
- Analytics
- Settings
- Logout

### Page Titles and Subtitles
| Screen | Title | Subtitle |
|--------|-------|---------|
| Login | "Welcome to" + Wakeeli | "Sign in to access your real estate dashboard" |
| Dashboard | Dashboard | "Welcome back, Sarah! Here's what's happening today." |
| Leads | Leads / My Leads | "Manage and track all your property leads" |
| Conversations | Conversations / Inbox | (agent: "Leads and conversations that need your attention") |
| Listings | Property Listings | "Manage your property portfolio" |
| Agents | Agents | "Manage your team, track performance, and optimize lead assignments" |
| Visits | Property Tours / Property Visits | "Manage and schedule property tours with leads" |
| Analytics | Analytics Dashboard | "Performance metrics and insights for your real estate operations" |
| Settings | Settings | "Manage your company profile, integrations, user permissions, and billing preferences" |

### Button Labels (all screens)
- Sign In (Login)
- Export (Leads)
- Table View (Leads)
- Clear All (Leads filters)
- View Details (Leads row)
- Add Agent (Agents)
- Filter (Agents)
- Save Agent (Agents form)
- Cancel (forms)
- Edit Availability (Tours - agent)
- Schedule Tour (Tours)
- Export Report (Analytics)
- Save Changes (Settings)
- Add Integration (Settings)
- Add User (Settings)
- Reassign Lead (Lead Drawer)
- View All (various sections)
- New Lead (header)

### Status Badge Labels
- Qualified
- Qualifying
- Tour Booked
- New
- Handed to Agent
- Initial Contact
- Active
- Hot Listing
- Hot (conversation)
- Pending
- Inactive
- Urgent
- Follow-up
- Waiting
- Cold
- AI Active
- Agent (conversation filter)
- Confirmed (tour)
- Scheduled (tour)
- No-show (tour)
- Canceled (tour)
- Available (agent)
- On Break (agent)
- Offline (agent)
- Busy (agent)
- Admin (role badge)
- Manager (role badge)
- Agent (role badge)
- Senior Agent (role badge)
- Online (conversation)

---

## 8. Navigation Structure

### Admin Role Navigation
```
Dashboard
Leads
  + Lead Detail Drawer (opens on row click)
Conversations
  + Active chat panel (right side, auto-loads on conversation select)
Listings
  + Listing Detail Panel (left side, opens on card click)
Tours (Property Tours)
  + Tour Detail View (full page OR right-side drawer)
Agents
  + Agent Details Drawer (opens on row click OR blue eye icon)
AI & Routing (no prototype screen found)
Analytics
Settings
```

### Agent Role Navigation
```
Dashboard
My Leads (filtered to assigned leads)
Inbox (filtered conversations)
Listings (same as admin)
Tours (labeled "Property Visits")
  + Edit Availability action
Agents (same as admin)
AI & Routing
Analytics
Settings
```

### Breadcrumb / Context Pattern
All screens show "Agent Details" / "Tour Details" as section header in drawer/overlay views, indicating a breadcrumb-style header in drawers.

---

## 9. Component Patterns

### Button Styles

**Primary (blue/brand):**
- Background: brand blue
- Text: white
- Used for: "Add Agent", "Schedule Tour", "Save Changes", "Add Listing"
- Sizes: 115x36 (header small), 143x38 (page actions), varies

**Secondary (outlined):**
- Border: brand blue or slate
- Text: brand blue or slate
- Used for: "Export", "Add Integration", "Filter"

**Tab/filter buttons:**
- Active state: brand blue background, white text
- Inactive: slate-100 background, slate text
- Examples: All / AI Only / Agent / Waiting (Conversations filter)

**Status filter tabs (Agents):**
- "Available (18)" / "On Break (3)" / "Offline (3)"
- Pill style

**Pagination buttons:**
- Previous, numbered pages, next, page size selector
- Small: ~30-38px height

**Quick Action buttons (Dashboard):**
- Full width cards in dark sidebar panel
- White/semi-transparent background on dark blue

### Form Field Patterns

**Standard input:**
- Height: 38-50px
- Border: slate-300
- Focus ring: brand color
- Border radius: rounded-lg (8px)

**Dropdown/select:**
- Same styling as input
- Native select element (from Miro input_dropdown type)

**Toggle switches:**
- Used for: "Remember me" (Login), per-row in Leads table, notification settings
- Standard toggle component

### Card Patterns

**KPI stat card:**
- White background, rounded-xl
- Border: slate-200
- Shadow: sm
- Padding: p-5
- Metric value: text-2xl bold
- Label: text-sm slate-500

**Lead card (mobile):**
- White background, rounded card
- Avatar circle (initials) left
- Name, tag, match%, source, status, agent, time
- Status/source as colored badges

**Listing card:**
- Property image top (h-48)
- Type badge overlay (For Rent/For Sale)
- Price badge overlay (top-right)
- Address, city, bed/bath/sqft row
- Amenity chips

**Conversation list item:**
- Avatar circle (initials)
- Name + time right-aligned
- Status badge
- Message preview truncated

**Agent row (table):**
- Initials avatar
- Name, email, role, status, stats columns
- Status colored badge
- Clickable row (opens drawer)

### Color Palette (from prototype data)

| Element | Color |
|---------|-------|
| Brand/primary (buttons, links, active nav) | Blue (#003366 or similar navy) |
| Success/Available | Emerald green |
| Warning/Pending/On Break | Amber |
| Error/No-show/Urgent | Red |
| Cold/Canceled | Slate/gray |
| Hot badge | Red/hot pink |
| Sidebar background | Dark navy blue |
| Page background | Slate-100/50 |
| Cards | White |
| Header bar | White |
| Nav text (inactive) | White/90 opacity on dark bg |
| Nav text (active) | White, highlighted background |

---

## 10. Comparison with Existing Frontend

### What the Prototype Has vs. What Exists

#### Login Page
**Prototype:** Split-screen with hero image left, form right. "Welcome to Wakeeli" heading in navy. Email/password/remember-me/forgot-password.
**Existing (LoginPage.tsx):** Not read but exists.
**Gaps:** Current implementation likely matches broadly but may be missing: branded hero image panel, proper color on heading, forgot password link.

#### AppLayout / Sidebar
**Prototype:** Has "Wakeeli" logo text (with Zap icon implied). Sidebar shows exact nav labels. Notification badge "3" on top. User info: name + role label + initials circle.
**Existing (AppLayout.tsx):** Matches well. Has Zap icon, Wakeeli text, same nav items, notification bell, user avatar.
**Gaps:**
- Current header has a `+` "New Lead" button but no specific badge count wired to real data
- Prototype bell/notification has badge "3" hardcoded - current code matches this
- Current code has an unexplained `X` close button in the header (prototype position unclear)

#### Dashboard
**Prototype KPIs:** New Leads Today, Tours Booked, Deals Closed, Avg Response Time
**Existing KPIs:** Total Listings, Active Conversations, With Agent, Total Agents
**Gap - SIGNIFICANT:** The prototype and current frontend show completely different KPI metrics. Prototype is lead-conversion-focused (leads/tours/deals/response time). Current is system-stats-focused (listings, conversations, agents).

**Prototype Conversations widget:** Shows actual chat messages inline with read/reply capability
**Existing:** Shows conversation list but just links to /conversations
**Gap:** Current is simpler - prototype has a full mini-chat UI inline on dashboard.

**Prototype Quick Actions:** 5 actions (View Unassigned Leads, Add New Listing, View Today's Tours, Edit Existing Listing, View Analytics Report)
**Existing:** Same 5 actions - matches.

**Prototype Today's Tours:** Shows 4 tours with time, address, lead name, agent name
**Existing:** Does NOT have this section at all
**Gap - SIGNIFICANT:** Missing Today's Tours section on dashboard.

#### Leads
**Prototype columns:** Lead Name, Contact, Source, Type, Status, Match Score, Assigned Agent, Last Activity
**Existing columns:** Lead (avatar+name), Contact, Source, Type, Status, Assigned Agent, Last Activity
**Gap:** Missing "Match Score" column. Existing uses phone number as "Lead" identifier, prototype uses actual names.

**Prototype lead data:** Shows real names (Emily Martinez, James Wilson), match scores (85%, 62%), lead tags (Downtown Seeker, Family Home Hunter), rich contact info.
**Existing:** Shows phone numbers, basic status. No match scores or tags.

**Prototype filter bar:** 4 dropdowns + 2 search inputs + Clear All
**Existing:** 3 selects (type, status, agent) + Clear button
**Gap:** Missing additional filter dropdowns.

**Prototype row toggle:** Per-row toggle switch
**Existing:** Per-row checkbox (for bulk selection)
**Gap:** Prototype has a toggle per row not in current code.

#### Conversations
**Prototype:** Shows lead name (not phone), status badges (Urgent/Hot/Cold), agent assignment pill, online indicator, full conversation history with timestamp labels, "AI is typing..." indicator.
**Existing:** Shows phone number as identifier, basic status badge, full message history (good), basic filter tabs.
**Gap:** Current uses phone numbers instead of names. Missing: online indicator, urgency/priority tags on conversations, "AI is typing" indicator.

#### Listings
**Prototype:** Two-panel: left detail panel + right card grid. Detail panel has: Core Property Info, Pricing & Financials, Amenities, AI Matching Rules, Tour Availability.
**Existing:** Top "Add Listing" form + card grid only. No detail panel.
**Gap - SIGNIFICANT:** Entire listing detail panel is missing. The split-panel layout does not exist. The current card grid is similar but clicking a card does nothing (no detail drawer).

**Prototype listing cards:** Show status badges (Active, Hot, Pending), views count, richer info.
**Existing:** Similar card format but no views count, no Hot/Pending status badges.

#### Agents
**Prototype:** Table view with KPI bar, status filter tabs (Available/On Break/Offline), paginated agent table with performance metrics (conversion rate, live load, avg response), clickable rows opening a drawer.
**Existing:** Card grid layout (completely different from prototype table), "Add Agent" form, delete button on cards.
**Gap - SIGNIFICANT:** Prototype uses a table layout; existing uses a card grid. Prototype has rich performance metrics per agent; existing shows basic info only. Prototype has a detail drawer; existing has nothing equivalent.

#### Tours/Visits
**Prototype:** Calendar grid (week view) with tour blocks, right panel with upcoming list + stats + agent availability. View toggle (Day/Month buttons).
**Existing:** Calendar grid (good match), upcoming tours list (good match), tour statistics (good match). Has week/day/month view toggle.
**Gap:** Missing "Agent Availability" right panel. Calendar data is hardcoded mock - prototype shows same mock data. Existing frontend has this as mostly static/mock.

#### Analytics
**Prototype:** "Analytics Dashboard" title, lead source breakdown, response time distribution, AI vs human comparison table, AI volume stats.
**Existing:** "AI Cost Dashboard" - completely focused on Claude API costs, model split, daily breakdown, per-conversation costs.
**Gap - SIGNIFICANT:** These are two entirely different analytics dashboards. Prototype = business analytics (leads, conversions, agent performance). Existing = technical/cost analytics (API usage). Both are needed but serve different purposes.

#### Settings
**Prototype:** Company Profile form (5 fields), Integrations (3 active, add button), User Roles table (4 users with permissions), Notification toggles (3).
**Existing:** Similar structure but missing: User Roles table, Notification toggles. Has a "Switch view (demo)" role-switcher widget not in prototype.
**Gap:** Missing User Roles & Permissions table and Notification settings.

#### AI & Routing
**No prototype screen found** for AI & Routing. The navigation item exists in all screens but no dedicated prototype screen was identified in the board data.

---

## 11. Images Analysis

50 unique images were identified and downloaded. Most are placeholder/mock property photos used in listing cards, lead avatars, and screen headers. They appear to be stock images used as visual stand-ins in the prototype.

Key image resource groups:
- Resource 3458764517585706830: Mobile app header/logo image (used across mobile screens)
- Resource 3458764517589062819-833: Tour/property detail images (7 variants used in Tour Detail View)
- Resource 3458764517585380302-3: Lead avatar photos (Mobile Lead Detail)
- Resource 3458764517582771546: Login hero image (large, 720x900)
- Resources 3458764517584124202-611: Listing card photos (multiple variants)
- Resources 3458764517584102602-3: Small listing card thumbnails

---

## 12. Open Questions / Ambiguities for Fox

1. **AI & Routing screen is missing from the board.** Navigation item exists but no screen was designed. Is this intentional (feature TBD) or was it accidentally not included?

2. **Analytics: two separate views needed?** The existing frontend has AI cost analytics (Claude API costs). The prototype has business analytics (leads/conversions/agent performance). These serve different purposes. Should both live under "Analytics" with tabs, or should costs be under Settings?

3. **Lead names vs. phone numbers.** The prototype uses full names (Emily Martinez, James Wilson). The database model stores user_phone as the lead identifier. How should the frontend display leads? Is the name stored somewhere? The current conversations model only has user_phone.

4. **Match Score.** The prototype shows match scores (85%, 92%, etc.) prominently on lead rows and cards. The existing backend does not appear to calculate or store match scores in the conversations model. Is this a planned feature or should this be pulled from user_requirements?

5. **Lead tags/personas.** The prototype shows tags like "Downtown Seeker", "Luxury Buyer", "Family Home Hunter" on lead rows. These are not in the current database schema. Where do these come from?

6. **Listing detail panel trigger.** The prototype shows a left-side listing detail panel. What triggers it? Clicking a listing card? Clicking "View Details"? The behavior is unclear from static prototype data.

7. **The unnamed screen (ID 3458764656577436321, x=6745, y=3201).** This is the Lead Detail Drawer positioned below the Leads screen. It is 1244px wide (not 1440px). Does this open as a full side drawer or does it replace/overlay the page? The width difference is unusual.

8. **Conversations: lead names.** The prototype uses real names (Marcus Thompson, Jennifer Rodriguez) in the conversation list. But the backend only has phone numbers. Is name resolution expected from the AI session state?

9. **Tours screen: mock vs. live data.** The current Tours.tsx uses fully hardcoded mock data (same mock data as in the prototype). Is this expected to remain static for launch, or does Tours need a backend endpoint?

10. **Mobile app scope.** There are 12 complete mobile screens in the prototype. Is the mobile UI a separate app/PWA or a responsive version of the same admin dashboard? The mobile screens have a bottom navigation style not visible in the desktop layout.

11. **"Hot" listing vs "Active" listing distinction.** Both are status values. "Hot Listing" appears as a separate badge. Is "Hot" determined by AI, by view count, or manually set?

12. **User permissions granularity.** The Settings screen shows permissions per user (Full Access / Billing / User Management / Leads / Listings / Tours / Conversations / Analytics / Settings). The current RoleContext only has admin/agent. Does the full permissions model need to be implemented?

13. **Notification toggles (Settings).** Three notification types shown: New Lead Alerts, Tour Reminders, Weekly Reports. What channels do these use? Email? WhatsApp? In-app?

14. **"Edit Availability" button (agent Tours view).** Clicking this should let agents set their available hours/days. No design for this sub-screen was found in the prototype.

15. **The "3" notification badge.** This appears hardcoded as "3" across all screens in the prototype. Is this just mock data, or should it reflect real-time unread count?

---

*Report generated from 4,053 Miro items across 39 screens. All text content captured exactly as written in the prototype.*
