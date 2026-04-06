import React from 'react'
import ReactDOM from 'react-dom/client'
import * as Sentry from '@sentry/react'
import App from './App.tsx'
import { initSentry } from './utils/sentry.ts'
import './index.css'

// Initialize Sentry before React renders
initSentry()

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-slate-800 mb-2">Something went wrong</h1>
        <p className="text-slate-500 text-sm mb-6">
          An unexpected error occurred. The team has been notified.
        </p>
        {import.meta.env.DEV && error?.message && (
          <pre className="text-left text-xs bg-red-50 border border-red-200 rounded p-3 text-red-700 mb-6 overflow-auto">
            {error.message}
          </pre>
        )}
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-brand-600 text-white rounded-md text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          Reload page
        </button>
      </div>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Sentry.ErrorBoundary fallback={({ error }) => <ErrorFallback error={error as Error} />}>
      <App />
    </Sentry.ErrorBoundary>
  </React.StrictMode>,
)
