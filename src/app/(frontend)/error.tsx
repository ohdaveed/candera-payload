'use client'

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center min-h-[40vh] gap-4 px-4 text-center"
    >
      <p className="text-lg font-medium">Something went wrong.</p>
      <button
        onClick={reset}
        className="text-sm underline underline-offset-2 focus-visible:ring-2 focus-visible:ring-candera-ember-strong focus-visible:ring-offset-2 outline-none rounded-sm"
      >
        Try again
      </button>
    </div>
  )
}
