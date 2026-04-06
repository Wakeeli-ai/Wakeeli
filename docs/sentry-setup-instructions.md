# Sentry Error Monitoring: Setup Instructions

Sentry is already integrated in the frontend code. You just need a DSN to activate it.

## Step 1: Create a free Sentry account

Go to https://sentry.io and sign up for a free account.

Free tier includes: 5,000 errors/month, 10,000 performance transactions/month. More than enough for early-stage Wakeeli.

## Step 2: Create a new project

1. In the Sentry dashboard, click "Create Project"
2. Select "React" as the platform
3. Give it a name: "wakeeli-frontend"
4. Click "Create Project"

## Step 3: Copy your DSN

After creating the project, Sentry will show you a DSN that looks like this:

```
https://abc123xyz@o123456.ingest.sentry.io/789012
```

Copy that value.

## Step 4: Add the DSN to Railway

1. Go to your Railway project
2. Open the Wakeeli service
3. Go to Variables
4. Add a new variable:
   - Name: `VITE_SENTRY_DSN`
   - Value: your DSN from Step 3

## Step 5: Rebuild and redeploy

The frontend must be rebuilt with the DSN baked in (Vite embeds env vars at build time, not runtime).

Run this from your local machine or CI:

```bash
cd frontend
VITE_API_URL=/api VITE_SENTRY_DSN=your_dsn_here npm run build
cp -r dist/* ../backend/frontend_dist/
git add -A && git commit -m "Activate Sentry monitoring" && git push
```

Railway will auto-deploy from main.

## What is already configured

| Setting | Value | Notes |
|---------|-------|-------|
| `tracesSampleRate` | 0.1 | Captures 10% of transactions for performance |
| `replaysSessionSampleRate` | 0 | No session recordings unless there's an error |
| `replaysOnErrorSampleRate` | 1.0 | Full replay captured on every error |
| Environment | auto | Uses Vite's MODE (production or development) |

## What you get

- Every unhandled JS error is reported to Sentry with full stack trace
- Users see a clean "Something went wrong" page instead of a white screen
- Session replay on errors lets you see exactly what the user did before it crashed
- Performance traces on 10% of page loads

## Verifying it works

Once deployed with the DSN set, you can trigger a test error from the browser console:

```js
throw new Error("Sentry test error")
```

It should appear in your Sentry dashboard within a few seconds.
