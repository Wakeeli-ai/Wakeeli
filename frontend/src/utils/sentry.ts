import * as Sentry from '@sentry/react';

export function initSentry() {
  const dsn = import.meta.env.VITE_SENTRY_DSN;

  // Skip init if no DSN is configured
  if (!dsn) {
    if (import.meta.env.DEV) {
      console.info('[Sentry] VITE_SENTRY_DSN not set. Error monitoring disabled.');
    }
    return;
  }

  Sentry.init({
    dsn,
    environment: import.meta.env.MODE,
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
