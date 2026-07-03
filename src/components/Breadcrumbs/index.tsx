import Link from 'next/link'

type Crumb = {
  label: string
  href?: string
}

type Props = {
  items: Crumb[]
  className?: string
}

export function Breadcrumbs({ items, className = '' }: Props) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center gap-2 text-xs font-bold uppercase tracking-[.3em] ${className}`}
    >
      {items.map((item, i) => {
        const isLast = i === items.length - 1
        return (
          <span key={i} className="flex items-center gap-2">
            {item.href ? (
              <Link
                href={item.href}
                className="hover:opacity-60 transition-opacity rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-candera-ember focus-visible:ring-offset-2"
              >
                {item.label}
              </Link>
            ) : (
              <span className="opacity-40" aria-current="page">
                {item.label}
              </span>
            )}
            {!isLast && (
              <span className="opacity-30 select-none" aria-hidden="true">
                /
              </span>
            )}
          </span>
        )
      })}
    </nav>
  )
}
