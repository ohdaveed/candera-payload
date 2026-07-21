import clsx from 'clsx'

interface Props {
  className?: string
  loading?: 'lazy' | 'eager'
  priority?: 'auto' | 'high' | 'low'
}

export const Logo = (props: Props) => {
  const { className } = props

  return (
    <span
      className={clsx('font-display font-bold text-xl tracking-[-0.04em] uppercase', className)}
    >
      CANDERA
    </span>
  )
}

interface MoonMarkProps {
  size?: number
  className?: string
}

// CSS-drawn crescent — a circle masked by an inset box-shadow, no SVG asset.
// Visibility is gated purely via CSS (`.logo-icon-moon` in theme.css), not JS,
// to match how every other skin-scoped visual change in this codebase works.
export const MoonMark = ({ size = 22, className }: MoonMarkProps) => (
  <span
    aria-hidden="true"
    className={clsx('logo-icon-moon inline-block rounded-full', className)}
    style={{
      width: size,
      height: size,
      boxShadow: `inset -${Math.round(size * 0.28)}px -${Math.round(size * 0.1)}px 0 0 currentColor`,
    }}
  />
)

export const LogoIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-label="C"
  >
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" strokeDasharray="4 4" />
    <path
      d="M12 7V17M12 7L9 10M12 7L15 10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
)
