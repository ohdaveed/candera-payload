import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { SetHeaderTheme } from '@/components/SetHeaderTheme'

export default function NotFound() {
  return (
    <main className="bg-candera-vellum min-h-screen" data-page="not-found">
      <SetHeaderTheme theme="dark" />
      <div className="container flex flex-col items-center justify-center min-h-[60vh] py-28 text-center">
        <p className="eyebrow text-candera-sage-text mb-4">404 — Lost the thread</p>
        <h1 className="text-3xl md:text-4xl font-medium text-candera-obsidian mb-4">
          This page has burned out.
        </h1>
        <p className="text-base text-candera-sage-text max-w-md mb-8">
          The page you were looking for isn&apos;t here. It may have moved, or the scent has long
          since faded. Let&apos;s return you to the studio.
        </p>
        <Button asChild variant="default">
          <Link href="/">Return to the studio</Link>
        </Button>
      </div>
    </main>
  )
}
