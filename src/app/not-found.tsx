import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="bg-candera-linen min-h-screen pt-40 pb-40 flex flex-col items-center justify-start">
      <div className="flex flex-col items-center text-center gap-8 px-4 max-w-2xl">
        {/* Eyebrow */}
        <span className="eyebrow">404</span>

        {/* Hero heading */}
        <h1 className="hero-heading text-candera-obsidian">The vessel you seek has burned out.</h1>

        {/* Editorial subtext */}
        <p className="editorial text-candera-sage-text max-w-md">
          It may have been retired, renamed, or never existed. Let the smoke guide you back.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mt-4">
          <Button asChild variant="cta" size="cta">
            <Link href="/products">Return to the Collection</Link>
          </Button>

          <Link
            href="/posts"
            className="font-sans text-[11px] font-bold uppercase tracking-[.25em] text-candera-sage-text hover:text-candera-obsidian transition-colors duration-200"
          >
            Explore the Journal →
          </Link>
        </div>
      </div>
    </div>
  )
}
