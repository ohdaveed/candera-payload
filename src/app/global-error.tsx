'use client'

import { useEffect } from 'react'

/**
 * Root error boundary. Unlike `(frontend)/error.tsx`, this catches failures in
 * the root layout itself and therefore must render its own `<html>`/`<body>`.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <html lang="en">
      <body>
        <div
          role="alert"
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            gap: '1rem',
            padding: '1rem',
            textAlign: 'center',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <p style={{ fontSize: '1.125rem', fontWeight: 500 }}>Something went wrong.</p>
          <button
            onClick={reset}
            style={{
              fontSize: '0.875rem',
              textDecoration: 'underline',
              textUnderlineOffset: '2px',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  )
}
