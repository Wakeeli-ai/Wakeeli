# Wakeeli: Frontend and Backend Task Breakdown

**Date:** April 6, 2026
**Prepared for:** Fox
**Purpose:** Granular, actionable sub-tasks for finalizing the Wakeeli frontend and backend before first client onboarding.
**Based on:** launch-readiness.md, launch-game-plan.md, ecosystem-game-plan.md, and full codebase review.

---

## The Three Hard Blockers

These three must be resolved before any client is onboarded. Everything else is secondary.

1. Multi-tenancy: no company_id on any table. Agency A would see Agency B's data.
2. WhatsApp not connected to Meta. The AI has no channel.
3. No billing infrastructure. No way to charge anyone.

Full sub-task breakdowns for all three are in Section C.

---

## SECTION A: BACKEND FINALIZATION

### A1. Multi-Tenancy: companies Table and company_id Everywhere

---

#### A1.1 Create the companies table

**Description:** Create the companies table with all required fields. This is the anchor for the entire multi-tenant system.

Schema:
- id: UUID primary key, default gen_random_uuid()
- name: VARCHAR NOT NULL
- slug: VARCHAR UNIQUE NOT NULL (used for routing and future subdomains)
- whatsapp_phone_number_id: VARCHAR
- whatsapp_token: TEXT (encrypted)
- whatsapp_provider: VARCHAR, default 'meta_cloud'
- plan: VARCHAR, default 'starter'
- status: VARCHAR, default 'trial' (values: trial, active, suspended, cancelled)
- trial_ends_at: TIMESTAMP
- created_at: TIMESTAMP, default NOW()

**Files involved:**
- backend/app/models.py (add Company model class)
- New Alembic migration file

**Estimated effort:** 2 hours
**Dependencies:** None
**Priority:** P0

---

#### A1.2 Add company_id as nullable FK to all tenant-scoped tables

**Description:** Add company_id UUID FK column (nullable first, to avoid downtime) to the following tables: listings, agents, conversations, messages, users, token_usage. Nullable first allows a clean backfill before adding the NOT NULL constraint.

**Files involved:**
- backend/app/models.py (update all model classes)
- New Alembic migration file

**Estimated effort:** 3 hours
**Dependencies:** A1.1
**Priority:** P0

---

#### A1.3 Insert seed company row and backfill existing data

**Description:** Insert one row into companies for the current dev/test dataset. Then backfill all existing rows in listings, agents, conversations, messages, users, token_usage with that company_id. This ensures no orphaned rows before constraints are added.

**Files involved:**
- Alembic migration file or a one-time Python seed script

**Estimated effort:** 2 hours
**Dependencies:** A1.2
**Priority:** P0

---

#### A1.4 Add NOT NULL constraints and FK references

**Description:** After backfill is confirmed complete, add NOT NULL constraints and FK references on company_id across all tables. Use NOT VALID to avoid table locks. Validate separately after.

Commands pattern:
- ALTER TABLE listings ADD CONSTRAINT listings_company_id_fk FOREIGN KEY (company_id) REFERENCES companies(id) NOT VALID;
- ALTER TABLE listings VALIDATE CONSTRAINT listings_company_id_fk;
- ALTER TABLE listings ALTER COLUMN company_id SET NOT NULL;

Repeat for all six tables.

**Files involved:**
- Alembic migration file

**Estimated effort:** 2 hours
**Dependencies:** A1.3
**Priority:** P0

---

#### A1.5 Create indexes CONCURRENTLY on all company_id columns

**Description:** Create a B-tree index CONCURRENTLY on company_id in every tenant-scoped table. Critical for query performance. Without these, every API call becomes a full table scan as data grows.

**Files involved:**
- Alembic migration file

**Estimated effort:** 1 hour
**Dependencies:** A1.4
**Priority:** P0

---

#### A1.6 Create a Postgres app role with NOBYPASSRLS

**Description:** Create a dedicated Postgres application role that has NOBYPASSRLS set. Update the DATABASE_URL in Railway to use this role instead of the postgres superuser. Superusers bypass Row Level Security silently, meaning every test run as superuser is a false negative that could mask a data breach.

Steps:
- CREATE ROLE app_user WITH LOGIN PASSWORD 'strong_password' NOBYPASSRLS;
- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
- Update Railway DATABASE_URL to use app_user credentials.

**Files involved:**
- Railway env vars
- Database setup documentation

**Estimated effort:** 2 hours
**Dependencies:** A1.4
**Priority:** P0

---

#### A1.7 Enable Row Level Security on all tenant-scoped tables

**Description:** Enable RLS on listings, agents, conversations, messages, users, token_usage. Create isolation policies for SELECT, INSERT, UPDATE, DELETE on each table using the session variable pattern.

Policy pattern for SELECT:
- CREATE POLICY tenant_isolation ON listings USING (company_id = current_setting('app.current_company_id')::uuid);

Policy pattern for INSERT (WITH CHECK clause required):
- CREATE POLICY tenant_insert ON listings WITH CHECK (company_id = current_setting('app.current_company_id')::uuid);

Critical rules:
- Use SET LOCAL (not SET). Connection pools reuse connections. SET LOCAL scopes the variable to the current transaction only. SET leaks tenant context across requests.
- Add WITH CHECK clauses on every insert policy. Otherwise inserts without company_id succeed silently and create orphaned rows visible to nobody.
- Test with app_user role, never with the postgres superuser.

**Files involved:**
- Alembic migration or separate SQL setup script

**Estimated effort:** 5 hours
**Dependencies:** A1.5, A1.6
**Priority:** P0

---

#### A1.8 Cross-tenant isolation test

**Description:** Create two fake companies (Company A and Company B) with different data in all tables. Run queries as app_user (not postgres superuser). Confirm Company A's data is completely invisible when querying as Company B, and vice versa. Test all six tenant-scoped tables. Document the test results.

**Files involved:**
- Test scripts or manual SQL verification

**Estimated effort:** 3 hours
**Dependencies:** A1.7
**Priority:** P0

---

#### A1.9 Update SQLAlchemy models to include company_id

**Description:** Add company_id field to all SQLAlchemy model classes: Listing, Agent, Conversation, Message, User, TokenUsage. Add the Company model class for the companies table with all fields defined in A1.1.

**Files involved:**
- backend/app/models.py

**Estimated effort:** 2 hours
**Dependencies:** A1.2
**Priority:** P0

---

#### A1.10 Update Pydantic schemas for company context

**Description:** Add company_id to all relevant Pydantic request and response schemas. Add CompanyCreate, CompanyUpdate, and CompanyResponse schemas. Ensure company_id is not exposed in public-facing response schemas where it should be implicit from the auth context.

**Files involved:**
- backend/app/schemas.py

**Estimated effort:** 2 hours
**Dependencies:** A1.9
**Priority:** P0

---

### A2. Auth System: Remove Hardcoded Credentials

---

#### A2.1 Seed initial admin user in the database

**Description:** Create a database seeder or Alembic migration that inserts the first admin user with a secure hashed password. The password must be set via a FIRST_ADMIN_PASSWORD environment variable in Railway, not hardcoded anywhere. This user gets the admin role and is scoped to a seed company.

**Files involved:**
- New seed script: backend/scripts/seed_admin.py
- Or: new Alembic migration

**Estimated effort:** 2 hours
**Dependencies:** A1.1 (admin user must have a company_id)
**Priority:** P0

---

#### A2.2 Remove hardcoded admin and agent credentials from auth.py and config.py

**Description:** Delete the AdminUser and AgentUser mock classes from auth.py. Remove the ADMIN_USERNAME and ADMIN_PASSWORD settings from config.py. Update the login endpoint to only authenticate against the database. Every user must exist in the users table.

**Files involved:**
- backend/app/routes/auth.py
- backend/app/config.py

**Estimated effort:** 3 hours
**Dependencies:** A2.1 (DB user must exist before removing hardcoded fallback)
**Priority:** P0

---

#### A2.3 Add company_id to JWT payload

**Description:** Update JWT token generation in auth.py to include company_id in the token claims. The token payload must carry: user_id, role, company_id. Every subsequent request carries the company context without an extra DB lookup.

**Files involved:**
- backend/app/routes/auth.py

**Estimated effort:** 2 hours
**Dependencies:** A1.1
**Priority:** P0

---

#### A2.4 Update get_current_user dependency to extract company_id

**Description:** Update the get_current_user FastAPI dependency to decode company_id from the JWT payload and attach it to a request-scoped context object. This context object is then passed into all route handlers that need company-scoped data.

**Files involved:**
- backend/app/routes/auth.py
- New backend/app/dependencies.py

**Estimated effort:** 2 hours
**Dependencies:** A2.3
**Priority:** P0

---

#### A2.5 Set a strong JWT secret key in Railway

**Description:** Generate a strong random secret (minimum 32 bytes, cryptographically random) and set it as JWT_SECRET_KEY in Railway env. The current fallback to ADMIN_PASSWORD is insecure and must be removed from config.py.

**Files involved:**
- backend/app/config.py (remove fallback)
- Railway env vars

**Estimated effort:** 1 hour
**Dependencies:** None
**Priority:** P0

---

### A3. Backend Role Enforcement

---

#### A3.1 Create role-checking FastAPI dependency

**Description:** Create a require_admin() FastAPI dependency function that reads the current user's role from the JWT context. If the role is not 'admin', return HTTP 403 Forbidden. This is the core building block for all backend role enforcement.

**Files involved:**
- backend/app/dependencies.py

**Estimated effort:** 2 hours
**Dependencies:** A2.4
**Priority:** P0

---

#### A3.2 Apply role enforcement to all admin-only endpoints

**Description:** Add the require_admin() dependency to every endpoint that is currently admin-only on the frontend. This covers: all of /api/agents (GET, POST, PUT, DELETE), /api/analytics/costs, and admin operations in /api/listings (DELETE) and /api/conversations (assign, status update for non-own conversations).

**Files involved:**
- backend/app/routes/agents.py
- backend/app/routes/analytics.py
- backend/app/routes/listings.py
- backend/app/routes/conversations.py

**Estimated effort:** 3 hours
**Dependencies:** A3.1
**Priority:** P0

---

#### A3.3 Filter all GET endpoints by company_id

**Description:** Update every GET endpoint to filter results by current_user.company_id. No endpoint should return data from any other company. Affected endpoints: all listings queries, all agents queries, all conversations queries, all messages queries, analytics/costs, and any future endpoints.

**Files involved:**
- backend/app/routes/listings.py
- backend/app/routes/agents.py
- backend/app/routes/conversations.py
- backend/app/routes/analytics.py

**Estimated effort:** 6 hours
**Dependencies:** A2.4
**Priority:** P0

---

#### A3.4 Enforce company_id on all write operations

**Description:** Update every POST, PUT, and DELETE endpoint to automatically inject company_id from the request context into the data being written. No endpoint should allow a row to be created without a company_id. No endpoint should allow updating or deleting a row belonging to a different company.

**Files involved:**
- backend/app/routes/listings.py
- backend/app/routes/agents.py
- backend/app/routes/conversations.py

**Estimated effort:** 4 hours
**Dependencies:** A2.4
**Priority:** P0

---

#### A3.5 Set company_id session variable before every DB query

**Description:** Create a database session dependency that calls SET LOCAL app.current_company_id = '{company_id}' at the start of every transaction. This is the application-layer complement to the database-layer RLS policy. Both must be in place for complete isolation.

**Files involved:**
- backend/app/database.py
- backend/app/dependencies.py

**Estimated effort:** 2 hours
**Dependencies:** A1.7, A2.4
**Priority:** P0

---

### A4. Session State Persistence

---

#### A4.1 Add session_state column to conversations table

**Description:** Add a session_state JSON column to the conversations table. This column stores the full SessionState object: stage, classification, user_info, property_info. This replaces the in-memory dict in agent.py that is currently lost on every server restart.

**Files involved:**
- backend/app/models.py
- New Alembic migration

**Estimated effort:** 2 hours
**Dependencies:** None (independent of multi-tenancy)
**Priority:** P1

---

#### A4.2 Update agent.py to load and save session from DB

**Description:** At the start of every process_user_message() call, load the SessionState from conversations.session_state JSON column. At the end of each call, save the updated SessionState back to the DB. Remove the global in-memory session dict.

**Files involved:**
- backend/app/services/agent.py
- backend/app/services/session.py

**Estimated effort:** 5 hours
**Dependencies:** A4.1
**Priority:** P1

---

#### A4.3 Handle missing or null session state gracefully

**Description:** If a conversation exists but session_state is null (legacy rows before this feature), initialize a fresh SessionState rather than crashing. Treat it as a new conversation.

**Files involved:**
- backend/app/services/agent.py

**Estimated effort:** 1 hour
**Dependencies:** A4.2
**Priority:** P1

---

### A5. WhatsApp Integration Finalization

---

#### A5.1 Add HMAC-SHA256 webhook signature verification

**Description:** Meta signs every POST to the webhook with the App Secret in the X-Hub-Signature-256 header. Add verification logic to the webhook handler. Reject any request that fails signature verification with HTTP 403. This is required for security and Meta compliance.

Implementation: compute HMAC-SHA256 of the raw request body using the App Secret. Compare with the header value using hmac.compare_digest() to prevent timing attacks.

**Files involved:**
- backend/app/routes/whatsapp.py
- backend/app/config.py (add WHATSAPP_APP_SECRET setting)

**Estimated effort:** 3 hours
**Dependencies:** None (implement now, before Meta credentials are live)
**Priority:** P0

---

#### A5.2 Add retry logic with exponential backoff for message sending

**Description:** The send_whatsapp_message() logic in whatsapp.py has no retry logic. Silent failures mean lost leads with no trace. Add: 3 retry attempts with exponential backoff (1s, 2s, 4s), structured error logging on failure, and a failed_messages log or DB record for any message that exhausts retries.

**Files involved:**
- backend/app/routes/whatsapp.py
- Or a new backend/app/services/whatsapp_sender.py to separate the sending logic

**Estimated effort:** 4 hours
**Dependencies:** None
**Priority:** P1

---

#### A5.3 Set production WhatsApp credentials in Railway

**Description:** Set the following in Railway production environment: WHATSAPP_TOKEN (permanent system user token, not the 24-hour temporary dashboard token), WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_VERIFY_TOKEN, WHATSAPP_APP_SECRET.

**Files involved:**
- Railway env vars
- backend/app/config.py (verify all four are in Settings)

**Estimated effort:** 1 hour
**Dependencies:** Meta Business Verification approved, C2.7
**Priority:** P0

---

#### A5.4 Configure and verify the webhook URL in Meta

**Description:** Set the webhook URL in Meta App Dashboard to https://[yourdomain]/api/whatsapp/webhook. Complete the verification handshake. Note: the webhook verification (GET /webhook challenge) must succeed before Meta sends any real messages.

**Files involved:**
- Meta Developer Console (no code changes)

**Estimated effort:** 1 hour
**Dependencies:** A5.3, custom domain live and pointing to Railway
**Priority:** P0

---

#### A5.5 Manually register webhook event subscriptions

**Description:** After adding the WhatsApp phone number in Meta App Dashboard, manually register the WABA event subscription. Adding a phone number does NOT automatically subscribe the app to webhook events in Meta's current dashboard. If skipped, webhooks silently fail to fire even when the URL shows as verified.

**Files involved:**
- Meta App Dashboard (no code changes)

**Estimated effort:** 30 minutes
**Dependencies:** A5.4
**Priority:** P0

---

#### A5.6 Submit 6 WhatsApp template messages for approval

**Description:** Submit all 6 required template messages to Meta for approval. Templates are required for outbound messages (when Wakeeli initiates contact, not when replying within the 24-hour window).

Templates to submit (both English and Lebanese Arabic versions):
1. FIRST_CONTACT: new inbound lead greeting
2. TOUR_CONFIRMATION: tour confirmed with address, date, time, agent name
3. TOUR_REMINDER_24H: 24-hour reminder with confirm/reschedule options
4. TOUR_REMINDER_1H: 1-hour reminder
5. FOLLOW_UP_AFTER_TOUR: post-visit follow-up
6. NEW_LISTING_ALERT: alert for matched lead when new listing is added

Templates typically approve within a few hours. Allow 24 to 48 hours.

**Files involved:**
- Meta App Dashboard (no code changes)
- Draft templates stored in docs for reference

**Estimated effort:** 3 hours
**Dependencies:** A5.4
**Priority:** P0

---

#### A5.7 Implement backend functions to send approved template messages

**Description:** Create backend service functions for sending each of the 6 approved templates. These are needed for tour confirmations, reminders, and new listing alerts. Use the template names and variable parameter format required by Meta Graph API.

**Files involved:**
- backend/app/services/whatsapp_sender.py (new file, or extend routes/whatsapp.py)

**Estimated effort:** 4 hours
**Dependencies:** A5.6 (template IDs assigned after approval)
**Priority:** P1

---

#### A5.8 End-to-end live test with real phone

**Description:** Send a real message from a real phone to the Wakeeli WhatsApp number. Verify: message received by webhook, AI processes it, response sent back to the phone, conversation logged in DB, session state saved. Test both text messages and voice messages. Test in Lebanese Arabic.

**Files involved:**
- No code changes (verification and testing only)

**Estimated effort:** 3 hours
**Dependencies:** A5.5
**Priority:** P0

---

### A6. API Security Hardening

---

#### A6.1 Add rate limiting with slowapi

**Description:** Install slowapi and apply rate limits to all API endpoints. Priority targets: POST /api/whatsapp/webhook (unprotected from flood), POST /api/auth/login (brute force protection, max 5 attempts per minute per IP), and all other endpoints (max 60 requests per minute per IP).

**Files involved:**
- backend/app/main.py
- backend/app/routes/whatsapp.py
- backend/app/routes/auth.py
- backend/requirements.txt

**Estimated effort:** 4 hours
**Dependencies:** None
**Priority:** P1

---

#### A6.2 Restrict CORS to production domain

**Description:** Change CORS allow_origins from ["*"] to the specific production domain (e.g., https://wakeeli.app). Wildcard CORS is a security issue in production. Keep localhost entries for the development environment only.

**Files involved:**
- backend/app/main.py

**Estimated effort:** 1 hour
**Dependencies:** Custom domain registered
**Priority:** P1

---

#### A6.3 Move admin reset endpoint behind authentication

**Description:** The /admin/reset-listings endpoint in main.py is completely unprotected. Any anonymous caller can reset all listings. Move this behind a require_admin() dependency or remove it entirely since it was labeled a "one-time reset utility."

**Files involved:**
- backend/app/main.py

**Estimated effort:** 1 hour
**Dependencies:** A3.1
**Priority:** P0

---

### A7. Error Handling and Monitoring

---

#### A7.1 Add Sentry to backend

**Description:** Install sentry-sdk[fastapi]. Initialize Sentry with the project DSN in main.py. Set environment tag (production vs. staging). Add traces_sample_rate for performance monitoring. This gives Fox visibility into crashes and errors in production without waiting for a client to complain.

**Files involved:**
- backend/app/main.py
- backend/requirements.txt
- Railway env vars (SENTRY_DSN)

**Estimated effort:** 2 hours
**Dependencies:** Sentry account created, project DSN generated
**Priority:** P1

---

#### A7.2 Add structured error response format

**Description:** Standardize all API error responses. Currently some endpoints return bare HTTPException strings and others return JSON objects. Define a standard error envelope: {"error": "message", "code": "ERROR_CODE", "details": {}}. Add exception handlers in main.py for HTTPException and general Exception.

**Files involved:**
- backend/app/main.py (add exception handlers)
- All route files (update HTTPException usages for consistency)

**Estimated effort:** 4 hours
**Dependencies:** None
**Priority:** P2

---

#### A7.3 Add request logging middleware

**Description:** Add a middleware to main.py that logs: HTTP method, path, response status code, and response time for every request. Use Python logging (not print statements) so logs appear in Railway's log viewer.

**Files involved:**
- backend/app/main.py

**Estimated effort:** 2 hours
**Dependencies:** None
**Priority:** P2

---

#### A7.4 Set up UptimeRobot monitoring

**Description:** Create a free UptimeRobot account. Add an HTTP monitor for the production domain (check every 5 minutes). Configure alerts to Fox's email and Telegram. Also add a monitor for the WhatsApp webhook health endpoint if one is created.

**Files involved:**
- UptimeRobot dashboard (no code changes)

**Estimated effort:** 1 hour
**Dependencies:** Custom domain live
**Priority:** P1

---

### A8. Company Onboarding API (Super-Admin)

---

#### A8.1 Create company CRUD endpoints

**Description:** Create API endpoints for Fox to manage companies in the super-admin panel. Endpoints needed: POST /api/admin/companies (create new company), GET /api/admin/companies (list all companies with usage stats), GET /api/admin/companies/{id} (get single company), PATCH /api/admin/companies/{id} (update company details), POST /api/admin/companies/{id}/suspend (suspend company), POST /api/admin/companies/{id}/activate (manually activate for cash/wire clients).

All endpoints require Fox's super-admin role.

**Files involved:**
- New backend/app/routes/admin.py
- backend/app/models.py (Company model)
- backend/app/schemas.py (Company schemas)

**Estimated effort:** 6 hours
**Dependencies:** A1.1, A3.1
**Priority:** P0

---

#### A8.2 Create first admin user provisioning endpoint

**Description:** Endpoint for Fox to provision the first admin user for a new company: POST /api/admin/companies/{id}/users. Creates a user with admin role scoped to that company_id. Generates a temporary password. Triggers an invitation email (see A8.3). Returns user credentials summary (not the password plaintext).

**Files involved:**
- backend/app/routes/admin.py
- backend/app/services/email.py (new)

**Estimated effort:** 4 hours
**Dependencies:** A8.1, A8.3
**Priority:** P0

---

#### A8.3 Implement email service with Resend

**Description:** Create a backend email service using the Resend API. Required email templates: agent invitation (with password setup link), admin provisioning notification, tour confirmation, tour reminder. Resend free tier covers 3,000 emails per month, sufficient for early stage.

**Files involved:**
- New backend/app/services/email.py
- backend/requirements.txt (add resend)
- Railway env vars (RESEND_API_KEY, FROM_EMAIL)

**Estimated effort:** 4 hours
**Dependencies:** Resend account created
**Priority:** P1

---

#### A8.4 Agent invitation flow

**Description:** When an admin creates a new agent in the dashboard (POST /api/agents), automatically send an invitation email to the agent's email address. The email includes a one-time password setup link. No agent should receive credentials via WhatsApp or manual copy-paste. Requires A8.3 (email service) to be built first.

**Files involved:**
- backend/app/routes/agents.py
- backend/app/services/email.py

**Estimated effort:** 4 hours
**Dependencies:** A8.3
**Priority:** P1

---

### A9. Billing Infrastructure

---

#### A9.1 Create Paddle account and submit documents

**Description:** Go to paddle.com and create a seller account. Submit required Lebanese company documents: commercial registration (Segel Tejari), owner ID, business address proof, USD bank account details. Paddle explicitly supports Lebanon as a seller country. Typical approval time: 1 to 3 business days.

**Files involved:**
- Paddle dashboard (no code)

**Estimated effort:** 2 hours (document prep) + waiting period
**Dependencies:** Lebanese company registration complete
**Priority:** P0

---

#### A9.2 Add billing fields to companies table

**Description:** Add billing-related columns to the companies table: paddle_customer_id (VARCHAR), paddle_subscription_id (VARCHAR), billing_plan (VARCHAR: starter/growth/agency), billing_status (VARCHAR: trial/active/suspended/cancelled), trial_ends_at (TIMESTAMP), subscription_activated_at (TIMESTAMP), billing_cycle_anchor (DATE).

**Files involved:**
- backend/app/models.py
- New Alembic migration

**Estimated effort:** 2 hours
**Dependencies:** A1.1
**Priority:** P0

---

#### A9.3 Create Paddle webhook endpoint

**Description:** Create POST /api/webhooks/paddle. Verify Paddle webhook signature (Paddle-Signature header). Handle these events: subscription.activated (set company.billing_status = active), subscription.cancelled (set billing_status = suspended after 7-day grace period), transaction.completed (log payment), transaction.payment_failed (send alert email to Fox).

**Files involved:**
- New backend/app/routes/billing.py
- backend/app/main.py (register the router)

**Estimated effort:** 6 hours
**Dependencies:** A9.1 approved, A9.2
**Priority:** P0

---

#### A9.4 Manual activation endpoint for cash and wire clients

**Description:** For Lebanese clients who pay via wire transfer or cash: Fox uses a super-admin endpoint to manually activate their account after confirming payment. PATCH /api/admin/companies/{id}/activate sets billing_status = active and logs the activation with a reason field (e.g., "manual invoice #001, wire received").

**Files involved:**
- backend/app/routes/admin.py

**Estimated effort:** 2 hours
**Dependencies:** A8.1
**Priority:** P0

---

#### A9.5 Account suspension enforcement in AI pipeline

**Description:** When a WhatsApp message arrives for a company with billing_status = suspended or trial_ends_at in the past, the AI must not process the message. Return a polite message to the lead ("This number is temporarily unavailable, please contact the agency directly.") and log the failed attempt. Do not crash or throw unhandled errors.

**Files involved:**
- backend/app/routes/whatsapp.py
- backend/app/services/agent.py

**Estimated effort:** 3 hours
**Dependencies:** A9.2, A1.1
**Priority:** P1

---

### A10. Missing Backend Endpoints

---

#### A10.1 Create tours CRUD endpoints

**Description:** The tours table is referenced in ecosystem-game-plan.md and is part of the product, but no /api/tours route file exists. Create: GET /api/tours (list tours, filtered by company_id and optionally by agent_id), POST /api/tours (create tour), PATCH /api/tours/{id} (update status: scheduled/completed/cancelled/no_show), GET /api/tours/{id} (get single tour).

**Files involved:**
- New backend/app/routes/tours.py
- backend/app/models.py (add Tour model if not present)
- backend/app/schemas.py (Tour schemas)
- backend/app/main.py (register router)

**Estimated effort:** 6 hours
**Dependencies:** A3.1
**Priority:** P1

---

#### A10.2 Create lead conversion analytics endpoint

**Description:** Create GET /api/analytics/funnel that returns conversion counts for each pipeline stage: total conversations, contacted, qualified, matched, tour_booked, tour_completed, closed_won. Used by the frontend analytics dashboard funnel chart.

**Files involved:**
- backend/app/routes/analytics.py

**Estimated effort:** 4 hours
**Dependencies:** A3.3
**Priority:** P2

---

#### A10.3 Create dashboard summary endpoint

**Description:** Create GET /api/analytics/summary that returns the KPI card data for the Dashboard page: total_leads (count of conversations), qualified_leads (count where status = qualified), tours_booked (count from tours table), conversion_rate (tours_booked / total_leads as percentage). Scoped by company_id.

**Files involved:**
- backend/app/routes/analytics.py

**Estimated effort:** 3 hours
**Dependencies:** A3.3
**Priority:** P1

---

## SECTION B: FRONTEND FINALIZATION

### B1. Replace Mock Data with Real API Calls

---

#### B1.1 Wire Leads page to real API

**Description:** Leads.tsx currently shows 15 hardcoded mock Lebanese profiles. Replace with real API calls to GET /api/conversations (which stores lead data). Wire the search bar to pass query params. Wire pagination if the endpoint supports it. LeadDetailPanel must load and update data via API.

**Files involved:**
- frontend/src/pages/Leads.tsx
- frontend/src/api.ts (add getLeads, updateLead functions)

**Estimated effort:** 5 hours
**Dependencies:** A3.3 (company-filtered API)
**Priority:** P1

---

#### B1.2 Wire Conversations page to real API

**Description:** Conversations.tsx must pull the conversation list and individual message threads from real API endpoints. Wire status update (PATCH /api/conversations/{id}/status) and agent assignment (PATCH /api/conversations/{id}/assign) to real API calls. Real-time message updates are not required for launch (poll every 30 seconds as a temporary solution).

**Files involved:**
- frontend/src/pages/Conversations.tsx
- frontend/src/api.ts

**Estimated effort:** 5 hours
**Dependencies:** A3.3
**Priority:** P1

---

#### B1.3 Wire Listings page to real API

**Description:** Listings.tsx must pull from GET /api/listings. Wire all CRUD operations: create, update, delete. Remove Unsplash placeholder photos from the API/mock layer (real photo upload is handled in B9.5). Show a placeholder image when no photo is available.

**Files involved:**
- frontend/src/pages/Listings.tsx
- frontend/src/api.ts

**Estimated effort:** 4 hours
**Dependencies:** A3.3
**Priority:** P1

---

#### B1.4 Wire Agents page to real API

**Description:** Agents.tsx must pull from GET /api/agents. Wire all CRUD: create agent, update agent (territories, specialties, active status), delete agent. Show a pending invitation badge for agents who have not yet set their password (once invitation flow is built).

**Files involved:**
- frontend/src/pages/Agents.tsx
- frontend/src/api.ts

**Estimated effort:** 3 hours
**Dependencies:** A3.3
**Priority:** P1

---

#### B1.5 Wire Dashboard KPI cards to real API

**Description:** Dashboard.tsx KPI cards (total leads, qualified leads, booked tours, conversion rate) must call GET /api/analytics/summary. Replace all hardcoded numbers. Wire the recent leads and recent conversations tables to real API data.

**Files involved:**
- frontend/src/pages/Dashboard.tsx
- frontend/src/api.ts (add getDashboardSummary function)

**Estimated effort:** 4 hours
**Dependencies:** A10.3 (summary endpoint)
**Priority:** P1

---

#### B1.6 Wire Tours page to real API

**Description:** Tours.tsx must pull from GET /api/tours. Wire tour status updates (PATCH /api/tours/{id}). Show upcoming tours sorted by date. Show overdue tours (scheduled_at in the past but still in SCHEDULED status) highlighted.

**Files involved:**
- frontend/src/pages/Tours.tsx
- frontend/src/api.ts (add getTours, updateTourStatus functions)

**Estimated effort:** 4 hours
**Dependencies:** A10.1 (tours endpoint), A3.3
**Priority:** P1

---

### B2. Loading States

---

#### B2.1 Add skeleton loading to all data tables

**Description:** Every page that fetches data (Leads, Conversations, Listings, Tours, Agents, Dashboard) must show a skeleton loading state while the API call is in flight. Create a reusable SkeletonTable component with configurable rows and columns. Do not show blank pages or unresponsive UI while loading.

**Files involved:**
- New frontend/src/components/SkeletonTable.tsx
- frontend/src/pages/Leads.tsx
- frontend/src/pages/Conversations.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Tours.tsx
- frontend/src/pages/Agents.tsx
- frontend/src/pages/Dashboard.tsx

**Estimated effort:** 4 hours
**Dependencies:** None (can be built independently)
**Priority:** P2

---

#### B2.2 Add loading state to login form

**Description:** The Sign In button must show a spinner and be disabled while the auth request is in flight. Prevents double-submit and gives the user feedback that something is happening.

**Files involved:**
- frontend/src/pages/LoginPage.tsx

**Estimated effort:** 1 hour
**Dependencies:** None
**Priority:** P2

---

#### B2.3 Add loading state to all form submit buttons

**Description:** Every form submit button (create listing, add agent, update status, assign agent) must show a loading state and be disabled while the request is in flight. Create a reusable LoadingButton component or use a consistent pattern.

**Files involved:**
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx
- frontend/src/pages/Conversations.tsx
- New frontend/src/components/LoadingButton.tsx (optional reusable component)

**Estimated effort:** 3 hours
**Dependencies:** None
**Priority:** P2

---

### B3. Error States

---

#### B3.1 Add global API error handling with toast notifications

**Description:** Add an Axios response interceptor in api.ts that catches all API errors and shows a toast notification. Rules: 401 errors trigger auto-logout and redirect to /login. 403 errors show "You don't have permission to do that." 500 errors show "Something went wrong. Try again." Install a toast library (react-hot-toast or sonner) and add the Toaster component to App.tsx.

**Files involved:**
- frontend/src/api.ts
- frontend/src/App.tsx (add Toaster)
- frontend/package.json (add toast library)

**Estimated effort:** 4 hours
**Dependencies:** None
**Priority:** P1

---

#### B3.2 Add error states to all data fetch views

**Description:** If an API call fails on any page (network error, server error), show a meaningful error state: an icon, a short error message, and a "Try again" button that re-triggers the fetch. Not a blank page. Not a spinning loader that never resolves.

**Files involved:**
- frontend/src/pages/Leads.tsx
- frontend/src/pages/Conversations.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Tours.tsx
- frontend/src/pages/Agents.tsx

**Estimated effort:** 4 hours
**Dependencies:** B3.1
**Priority:** P2

---

#### B3.3 Display server-side validation errors on forms

**Description:** All forms (create listing, add agent, login) must display server-side validation errors below the relevant field. Currently errors may be swallowed by the Axios error handler and never shown to the user. Map API error responses to field-level error displays.

**Files involved:**
- frontend/src/pages/LoginPage.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx

**Estimated effort:** 3 hours
**Dependencies:** B3.1
**Priority:** P2

---

### B4. Empty States

---

#### B4.1 Add empty states to all data views

**Description:** Every data view needs a meaningful empty state when there is no data. Each empty state should include: an icon relevant to the section, a short "No [items] yet" message, and a call-to-action that guides the user on what to do next.

Empty state text for each section:
- Leads: "No leads yet. Connect your WhatsApp number to start receiving leads automatically."
- Conversations: "No conversations yet. Your first lead will appear here as soon as they message on WhatsApp."
- Listings: "No listings yet. Add your first property to get started."
- Agents: "No agents yet. Invite your first agent to join the dashboard."
- Tours: "No tours scheduled yet. Tours appear here once leads book viewings."

**Files involved:**
- frontend/src/pages/Leads.tsx
- frontend/src/pages/Conversations.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx
- frontend/src/pages/Tours.tsx
- New frontend/src/components/EmptyState.tsx (reusable component)

**Estimated effort:** 4 hours
**Dependencies:** B1.1 through B1.6 (needs real API data to know when to show empty state)
**Priority:** P2

---

### B5. Form Validation

---

#### B5.1 Add client-side validation to all forms

**Description:** Add required field validation and format validation to all forms before submission. The goal is to catch obvious errors before hitting the API.

Login form: username and password both required (non-empty).
Listing form: listing_type required, property_type required, city required, price required and must be a positive number, bedrooms must be a non-negative integer if provided.
Agent form: name required, phone required, phone must match Lebanese format (+961xxxxxxxx or 0xxxxxxxx).

Show inline errors below the relevant field. Do not use browser alert() dialogs.

**Files involved:**
- frontend/src/pages/LoginPage.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx

**Estimated effort:** 5 hours
**Dependencies:** None
**Priority:** P2

---

### B6. Mobile Responsiveness

---

#### B6.1 Make the navigation sidebar mobile-friendly

**Description:** On screens smaller than 768px, the sidebar must collapse. Implement a hamburger menu button in the top header that toggles a mobile drawer. The drawer slides in from the left, contains the full nav, and closes when a nav item is tapped. The current sidebar renders as a full fixed-width column on small screens, making the main content unusable.

**Files involved:**
- frontend/src/layouts/AppLayout.tsx

**Estimated effort:** 6 hours
**Dependencies:** None
**Priority:** P1

---

#### B6.2 Make data tables responsive with card layouts

**Description:** All data tables (Leads, Listings, Agents, Tours) need responsive layouts. On screens smaller than 768px, switch from a horizontal table to a vertical card layout for each row. Each card shows the most important fields prominently. Less important fields collapse into a "View details" tap.

**Files involved:**
- frontend/src/pages/Leads.tsx
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx
- frontend/src/pages/Tours.tsx

**Estimated effort:** 8 hours
**Dependencies:** B6.1
**Priority:** P1

---

#### B6.3 Make conversation view mobile-friendly

**Description:** Conversations.tsx uses a split-panel layout: list on the left, message thread on the right. On mobile, these must stack. Show the conversation list by default. When the user taps a conversation, replace the view with the message thread. Add a back button (chevron left) to return to the list. The current layout makes the thread panel unusable on small screens.

**Files involved:**
- frontend/src/pages/Conversations.tsx

**Estimated effort:** 5 hours
**Dependencies:** B6.1
**Priority:** P1

---

#### B6.4 Make Dashboard page responsive

**Description:** Dashboard KPI cards should stack vertically on mobile (2 per row on tablet, 1 per row on very small screens). Recent tables should be scrollable or switch to card layouts. Charts should resize to fit the container width.

**Files involved:**
- frontend/src/pages/Dashboard.tsx

**Estimated effort:** 3 hours
**Dependencies:** B6.1
**Priority:** P1

---

#### B6.5 Test on real mobile devices

**Description:** After B6.1 through B6.4 are done, test the full dashboard on iPhone Safari and Android Chrome. Fix any touch targets smaller than 44px, any horizontal overflow, any z-index or overlay issues. Test landscape orientation as well.

**Files involved:**
- All frontend pages (fixes applied where needed)

**Estimated effort:** 4 hours
**Dependencies:** B6.1, B6.2, B6.3, B6.4
**Priority:** P1

---

### B7. Auth and Route Guard Polish

---

#### B7.1 Add JWT expiry auto-logout

**Description:** When a JWT expires (30-day default), the frontend currently shows broken API calls instead of redirecting to login. Add a check: if any API call returns 401, automatically clear the token from localStorage and redirect to /login. Also add a token expiry check on app load (decode the JWT and check the exp claim before rendering).

**Files involved:**
- frontend/src/api.ts
- frontend/src/App.tsx or frontend/src/contexts/RoleContext.tsx

**Estimated effort:** 2 hours
**Dependencies:** None
**Priority:** P1

---

#### B7.2 Consolidate auth state to a single source of truth

**Description:** The frontend currently uses two separate localStorage flags: 'token' (the JWT) and 'wakeeli_authenticated' ('1' flag). This is redundant and creates subtle bugs. Consolidate to a single auth state: the JWT token. If token is present and not expired, user is authenticated. Remove the 'wakeeli_authenticated' flag.

**Files involved:**
- frontend/src/App.tsx
- frontend/src/contexts/RoleContext.tsx (if this file exists)
- frontend/src/api.ts

**Estimated effort:** 2 hours
**Dependencies:** B7.1
**Priority:** P2

---

### B8. Analytics Page

---

#### B8.1 Verify analytics page with real cost data

**Description:** Analytics.tsx calls GET /api/analytics/costs which already works. Verify that the summary cards (total spend, API calls, conversations, avg cost, cache hit rate), the daily breakdown chart, the per-conversation table, and the model split breakdown all render correctly with real production data. Fix any display bugs.

**Files involved:**
- frontend/src/pages/Analytics.tsx

**Estimated effort:** 2 hours
**Dependencies:** None (endpoint already exists)
**Priority:** P2

---

#### B8.2 Add lead conversion funnel chart

**Description:** Add a funnel visualization to the Analytics page showing the conversion pipeline: Total Leads, Contacted, Qualified, Listings Shown, Tours Booked, Tours Completed, Closed Won. Call GET /api/analytics/funnel (see A10.2). Use Recharts (already likely in the project) for the visualization.

**Files involved:**
- frontend/src/pages/Analytics.tsx
- frontend/src/api.ts (add getFunnelAnalytics function)

**Estimated effort:** 5 hours
**Dependencies:** A10.2
**Priority:** P2

---

### B9. Production Polish

---

#### B9.1 Add Sentry to frontend

**Description:** Install @sentry/react. Initialize Sentry with the project DSN in main.tsx. Wrap the App component with Sentry.withErrorBoundary(). Set user context (role, company slug, not PII) when the user logs in. This catches unhandled React errors and sends them to the Sentry dashboard.

**Files involved:**
- frontend/src/main.tsx
- frontend/package.json

**Estimated effort:** 2 hours
**Dependencies:** Sentry account created, A7.1 done first so both use the same Sentry project
**Priority:** P1

---

#### B9.2 Remove all console.log statements from production build

**Description:** Search all frontend src files for console.log, console.error, and console.warn. Remove them or wrap in if (import.meta.env.DEV) guards. Production builds should not leak internal state to the browser console.

**Files involved:**
- All frontend/src files

**Estimated effort:** 1 hour
**Dependencies:** None
**Priority:** P2

---

#### B9.3 Add confirmation dialogs for destructive actions

**Description:** Delete listing and delete agent (and any future delete actions) must show a confirmation dialog before proceeding. Pattern: "Are you sure you want to delete [name]? This cannot be undone." Two buttons: "Cancel" (default focus) and "Delete" (red, destructive). No silent destructive actions.

**Files involved:**
- frontend/src/pages/Listings.tsx
- frontend/src/pages/Agents.tsx
- New frontend/src/components/ConfirmDialog.tsx

**Estimated effort:** 3 hours
**Dependencies:** None
**Priority:** P2

---

#### B9.4 Add page titles for browser tab

**Description:** Each page should set the document.title so the browser tab shows: "Dashboard | Wakeeli", "Leads | Wakeeli", "Conversations | Wakeeli", etc. Add a favicon.ico to the public folder.

**Files involved:**
- frontend/src/pages/*.tsx (add useEffect with document.title)
- frontend/index.html (add favicon link tag)
- frontend/public/ (add favicon.ico)

**Estimated effort:** 2 hours
**Dependencies:** None
**Priority:** P3

---

#### B9.5 Add real listing photo upload

**Description:** Replace Unsplash placeholder photos with actual image upload. Add a file input to the listing creation and edit form. On upload, POST the file to a backend endpoint. Backend stores the file in Cloudflare R2 or returns a Railway-hosted URL. Store the URL in listings.photos array.

This requires: a new POST /api/listings/{id}/photos backend endpoint, Cloudflare R2 or equivalent storage configured, and frontend file input with preview.

**Files involved:**
- frontend/src/pages/Listings.tsx
- backend/app/routes/listings.py (add photo upload endpoint)
- New backend/app/services/storage.py (Cloudflare R2 or local storage)

**Estimated effort:** 8 hours
**Dependencies:** B1.3
**Priority:** P2

---

#### B9.6 Production build verification and deploy

**Description:** Run the production build with VITE_API_URL=/api npm run build. Copy frontend/dist/* to backend/frontend_dist/. Deploy to Railway staging branch first. Verify the full app works end-to-end on staging: login, view leads, view conversations, create listing. Only after staging passes, deploy to production.

**Files involved:**
- frontend/package.json
- Railway staging and production environments

**Estimated effort:** 2 hours
**Dependencies:** All P0 and P1 frontend tasks
**Priority:** P0

---

## SECTION C: THE THREE HARD BLOCKERS IN DETAIL

### BLOCKER 1: Multi-Tenancy

Full sub-task breakdown is in Section A1 through A3.

**Critical path (must execute in this order):**
A1.1 (companies table) then A1.2 (add company_id columns) then A1.3 (backfill) then A1.4 (constraints) then A1.7 (RLS) then A3.3 and A3.4 in parallel (filter all queries and writes by company_id).

**Total estimated effort:** 49 hours across A1, A2, and A3.
**Target completion:** End of Week 3 (April 21, 2026).

---

### BLOCKER 2: WhatsApp Meta Business API Connection

---

#### C2.1 Register Meta Business Manager account

**Description:** Go to business.facebook.com. Create or confirm the Meta Business Manager account for Wakeeli. This is the starting point for WhatsApp Business API access.

**Files involved:** Meta Business Dashboard (no code)
**Estimated effort:** 1 hour
**Dependencies:** None
**Priority:** P0

---

#### C2.2 Submit Lebanese business verification documents

**Description:** Submit three documents to Meta Business Manager for business verification:
1. Commercial register extract (Segel Tejari) from the Lebanese Ministry of Justice
2. Tax registration number from Ministry of Finance (Raqam al-Kayd al-Daribiy)
3. Business utility bill showing company name and address

All three together produces the strongest submission. Lebanese Arabic documents are accepted. Review timeline: 2 to 30 days depending on Meta's workload. Start this immediately.

**Files involved:** Meta Business Dashboard (no code)
**Estimated effort:** 2 hours (gathering and uploading documents)
**Dependencies:** Lebanese company registration complete
**Priority:** P0

---

#### C2.3 Create WhatsApp Business App in Meta Developer Console

**Description:** Go to developers.facebook.com and create a new App. Select WhatsApp as the product. Note the App Secret (needed for webhook HMAC verification). Get the temporary test WhatsApp number and phone number ID for development.

**Files involved:** Meta Developer Console (no code)
**Estimated effort:** 1 hour
**Dependencies:** C2.1
**Priority:** P0

---

#### C2.4 Register and verify a permanent WhatsApp Business phone number

**Description:** Add and verify a dedicated phone number for Wakeeli's WhatsApp Business account. Recommendation: start with one shared Wakeeli number used for all clients. Per-agency dedicated numbers are a V2 feature. The number gets a PHONE_NUMBER_ID that goes in the Railway env vars.

**Files involved:** Meta App Dashboard (no code)
**Estimated effort:** 2 hours
**Dependencies:** C2.3
**Priority:** P0

---

#### C2.5 Get permanent system user token

**Description:** In Meta Business Manager, create a System User (not a personal account). Generate a permanent access token for that system user. This token does not expire, unlike the 24-hour dashboard token. Store as WHATSAPP_TOKEN in Railway env. Never commit this token to the codebase.

**Files involved:** Railway env vars
**Estimated effort:** 1 hour
**Dependencies:** C2.3
**Priority:** P0

---

#### C2.6 Set webhook URL and complete verification handshake

**Description:** In Meta App Dashboard, set the webhook URL to https://[yourdomain]/api/whatsapp/webhook and the verify token to match WHATSAPP_VERIFY_TOKEN in Railway env. Meta will send a GET request with a hub.challenge parameter. The backend must return it. Confirm verification succeeds.

**Files involved:** Meta App Dashboard, Railway env vars
**Estimated effort:** 1 hour
**Dependencies:** C2.5, A5.4, custom domain live
**Priority:** P0

---

#### C2.7 Manually register webhook event subscriptions

**Description:** In Meta App Dashboard, after adding the phone number, navigate to the Webhooks section and manually subscribe to messages events. This is a separate step from webhook URL verification and is commonly skipped. Without this, Meta verifies the URL but never sends real messages to it.

**Files involved:** Meta App Dashboard (no code)
**Estimated effort:** 30 minutes
**Dependencies:** C2.6
**Priority:** P0

---

#### C2.8 Activate 360dialog if Meta exceeds 14 days

**Description:** If Meta verification is not approved by April 14, immediately apply to 360dialog as a backup WhatsApp Business Solution Provider. 360dialog's embedded signup activates a WABA in under 5 minutes at approximately 50 EUR per month per number. The codebase already supports multiple WhatsApp providers. Once Meta approves, switch back to Meta direct and stop paying 360dialog.

Steps: create a 360dialog account, complete their embedded signup, get credentials (API key, phone number ID), add a 360dialog provider option to config.py, update the whatsapp.py sender to use the 360dialog API format.

**Files involved:**
- backend/app/config.py
- backend/app/routes/whatsapp.py (or services/whatsapp_sender.py)

**Estimated effort:** 4 hours
**Dependencies:** None (can execute immediately if Meta delays)
**Priority:** P0 (conditional: if Meta is not approved by April 14)

---

**Total estimated effort for WhatsApp blocker:** 11 hours of work (plus Meta's review waiting time of 2 to 30 days)
**Action required now:** Submit Meta verification documents today (April 6, 2026). This is the longest external dependency in the entire project.

---

### BLOCKER 3: Billing Infrastructure

Sub-tasks A9.1 through A9.5 in Section A cover the technical work.
Tasks C3.1 and C3.2 below cover the business-side steps.

---

#### C3.1 Apply for Paddle seller account

**Description:** Go to paddle.com and create a seller account. Submit required documents: commercial registration, owner ID, business address proof, USD bank account details. Paddle explicitly supports Lebanon as a seller country. Typical approval: 1 to 3 business days.

**Files involved:** Paddle Dashboard (no code)
**Estimated effort:** 2 hours
**Dependencies:** Lebanese company registration complete
**Priority:** P0

---

#### C3.2 Create subscription plans in Paddle

**Description:** Once approved, create three subscription plans in Paddle:
- Starter: $99 per month, up to 3 agents, 100 leads per month
- Growth: $249 per month, up to 10 agents, 500 leads per month
- Agency: $499 per month, unlimited agents, unlimited leads

Note each plan's Paddle Price ID. These are used in the Paddle billing integration.

**Files involved:** Paddle Dashboard (no code)
**Estimated effort:** 1 hour
**Dependencies:** C3.1 approved
**Priority:** P0

---

#### C3.3 If Paddle is rejected: register UK company and use Stripe

**Description:** If Paddle rejects the Lebanese application: register a UK company via Companies House (GBP 50, 2 to 3 days, fully remote). Open a Wise Business account in the company's name (free, no UK residency required). Sign up for Stripe under the UK entity. Stripe supports UK companies fully. Total additional time: 1 week. Total additional cost: under $200.

Stripe uses the same webhook pattern as Paddle. The billing.py webhook handler needs minimal changes to swap providers.

**Files involved:**
- backend/app/routes/billing.py (minor updates for Stripe event names)

**Estimated effort:** 1 week for company registration + 6 hours for Stripe integration
**Dependencies:** Paddle rejection confirmed
**Priority:** P0 (conditional)

---

**Total estimated effort for billing blocker:** 16 hours of backend work + document preparation time
**Fallback:** If Paddle is not approved by April 14, begin UK company registration immediately and run Stripe integration in parallel.

---

## SUMMARY TABLES

### Backend Task Summary

| Task Group | Tasks | Priority | Total Effort |
|------------|-------|----------|--------------|
| Multi-tenancy: DB layer | A1.1 through A1.10 | P0 | 22 hours |
| Auth: remove hardcoded creds | A2.1 through A2.5 | P0 | 10 hours |
| Role enforcement and company filtering | A3.1 through A3.5 | P0 | 17 hours |
| Session state persistence | A4.1 through A4.3 | P1 | 8 hours |
| WhatsApp finalization | A5.1 through A5.8 | P0/P1 | 17 hours |
| API security hardening | A6.1 through A6.3 | P0/P1 | 6 hours |
| Error handling and monitoring | A7.1 through A7.4 | P1/P2 | 9 hours |
| Company onboarding API | A8.1 through A8.4 | P0/P1 | 18 hours |
| Billing infrastructure | A9.1 through A9.5 | P0/P1 | 13 hours |
| Missing endpoints | A10.1 through A10.3 | P1/P2 | 13 hours |

**Total backend effort: approximately 133 hours (17 to 22 working days)**

---

### Frontend Task Summary

| Task Group | Tasks | Priority | Total Effort |
|------------|-------|----------|--------------|
| Replace mock data with real API | B1.1 through B1.6 | P1 | 25 hours |
| Loading states | B2.1 through B2.3 | P2 | 8 hours |
| Error states and handling | B3.1 through B3.3 | P1/P2 | 11 hours |
| Empty states | B4.1 | P2 | 4 hours |
| Form validation | B5.1 | P2 | 5 hours |
| Mobile responsiveness | B6.1 through B6.5 | P1 | 26 hours |
| Auth and route guard polish | B7.1 through B7.2 | P1/P2 | 4 hours |
| Analytics page | B8.1 through B8.2 | P2 | 7 hours |
| Production polish | B9.1 through B9.6 | P0/P2/P3 | 18 hours |

**Total frontend effort: approximately 108 hours (14 to 18 working days)**

---

### Hard Blocker Summary

| Blocker | Key Tasks | Internal Effort | External Wait |
|---------|-----------|-----------------|---------------|
| Multi-tenancy | A1.1 through A1.10, A2, A3 | 49 hours | None |
| WhatsApp Meta API | C2.1 through C2.8, A5.1 through A5.8 | 11 hours | 2 to 30 days Meta review |
| Billing infrastructure | C3.1 through C3.3, A9.1 through A9.5 | 16 hours | 1 to 3 days Paddle approval |

---

### Priority Distribution

| Priority | Meaning | Task Count |
|----------|---------|------------|
| P0 | Hard blocker: nothing ships without this | 31 tasks |
| P1 | Critical: must be done before or immediately after first client | 27 tasks |
| P2 | Important: should be done before second client | 22 tasks |
| P3 | Nice to have: post-launch polish | 2 tasks |

---

*Generated: April 6, 2026*
*Update this document as tasks are completed. Mark completed tasks with a date.*
