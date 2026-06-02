import Link from 'next/link'
import React from 'react'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-candera-obsidian px-6 text-center">
      <span className="eyebrow text-candera-ember mb-6">Lost in the Studio</span>
      <p
        className="font-display font-normal italic text-white leading-none mb-8"
        style={{ fontSize: 'clamp(6rem, 20vw, 14rem)' }}
      >
        404
      </p>
      <p className="editorial text-white/60 max-w-[380px] mb-12">
        This page drifted off — perhaps it was never poured, or quietly retired from the collection.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        <Link
          href="/products"
          className="inline-flex items-center justify-center h-[52px] px-10 text-[11px] font-bold uppercase tracking-[.3em] bg-candera-ember text-white hover:bg-candera-ember-strong transition-all duration-300 shadow-xl"
          style={{ borderRadius: 0 }}
        >
          Explore the Collection
        </Link>
        <Link
          href="/"
          className="font-sans text-[12px] font-medium uppercase tracking-[.2em] text-white/60 hover:text-white transition-colors duration-200"
        >
          Return Home
        </Link>
      </div>
    </div>
  )
}
