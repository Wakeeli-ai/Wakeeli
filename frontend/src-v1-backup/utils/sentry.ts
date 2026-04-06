import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN || 'https://0007ac81b4b02f3da250958b56576ec6@o4511172005527552.ingest.de.sentry.io/4511172028858448';

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
    sendDefaultPii: true,
    // Capture 10% of transactions for performance monitoring
    tracesSampleRate: 0.1,
    // Don't record sessions unless there's an error (saves quota)
    replaysSessionSampleRate: 0,
    // Capture full replay on errors
    replaysOnErrorSampleRate: 1.0,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ],
  });
}

export { Sentry };
