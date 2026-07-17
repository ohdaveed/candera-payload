'use client'

import { useId, useState } from 'react'

type Spec = { label: string; value: string }

type Props = {
  vessel?: string | null
  productType?: 'candle' | 'vintage' | 'custom'
  specifications?: Spec[] | null
}

// Labels that describe physical measurements — consolidated into one inline,
// scannable line (e.g. `4" × 3" · 15 oz`) instead of a stacked vertical list.
const MEASUREMENT_RE = /dimension|height|width|length|depth|diameter|\bsize\b|weight/i

function SectionToggle({
  label,
  open,
  onToggle,
  controlsId,
}: {
  label: string
  open: boolean
  onToggle: () => void
  controlsId: string
}) {
  return (
    <h3 className="m-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center justify-between w-full group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2 rounded-card"
        aria-expanded={open}
        aria-controls={controlsId}
      >
        <span className="text-sm font-semibold text-candera-obsidian">{label}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-candera-sage-text transition-transform duration-300 group-hover:text-candera-obsidian ${open ? 'rotate-180' : 'rotate-0'}`}
          aria-hidden="true"
        >
          <path d="M18 15l-6-6-6 6" />
        </svg>
      </button>
    </h3>
  )
}

export function ProductDetailSections({
  vessel: _vessel,
  productType: _productType = 'candle',
  specifications,
}: Props) {
  // Drawer defaults closed — technical metadata stays tucked away while the
  // story and fragrance lead the page.
  const [specsOpen, setSpecsOpen] = useState(false)
  const specsPanelId = useId()

  // Payload has no data — omit the section rather than render fabricated,
  // product-specific-looking specs (e.g. a fixed "15 oz" that may not be true).
  const displaySpecs: Spec[] = specifications && specifications.length > 0 ? specifications : []

  const measurements = displaySpecs.filter((s) => MEASUREMENT_RE.test(s.label))
  const otherSpecs = displaySpecs.filter((s) => !MEASUREMENT_RE.test(s.label))
  const measurementLine = measurements.map((m) => m.value).join(' · ')

  if (!measurementLine && otherSpecs.length === 0) return null

  return (
    <div className="flex flex-col border-t border-candera-stone/20 mt-2">
      {/* Measurements — always visible, consolidated inline */}
      {measurementLine && (
        <div className="flex items-baseline justify-between gap-6 py-5 border-b border-candera-stone/20">
          <h2 className="text-sm font-semibold text-candera-obsidian shrink-0">Measurements</h2>
          <span className="text-sm text-candera-obsidian text-right tabular-nums">
            {measurementLine}
          </span>
        </div>
      )}

      {/* Specifications — collapsible drawer for the remaining technical detail */}
      {otherSpecs.length > 0 && (
        <div className="border-b border-candera-stone/20 py-5">
          <SectionToggle
            label="Specifications"
            open={specsOpen}
            onToggle={() => setSpecsOpen((v) => !v)}
            controlsId={specsPanelId}
          />
          <div
            id={specsPanelId}
            className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${specsOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}
          >
            <div className="overflow-hidden">
              <ul className="flex flex-col pt-4 list-none">
                {otherSpecs.map(({ label, value }) => (
                  <li
                    key={label}
                    className="flex justify-between items-baseline gap-4 py-2.5 border-b border-candera-stone/10 last:border-b-0"
                  >
                    <span className="text-sm font-semibold text-candera-obsidian shrink-0">
                      {label}
                    </span>
                    <span className="text-sm text-candera-sage-text text-right">{value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
