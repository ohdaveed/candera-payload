import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'

const tagClassMap: Record<string, string> = {
  'Limited Batch': 'bg-candera-ember-strong text-candera-vellum border-transparent',
  Bestseller: 'bg-candera-obsidian text-candera-vellum border-transparent',
  'New Release': 'bg-candera-rose-strong text-candera-vellum border-transparent',
}

export function ProductTagBadge({ tag, className }: { tag: string; className?: string }) {
  return (
    <Badge
      className={cn(
        'relative z-10 text-xs font-bold uppercase tracking-[.25em] px-4 py-2 shadow-xl rounded-none',
        tagClassMap[tag] ?? 'bg-candera-obsidian text-candera-vellum border-transparent',
        className,
      )}
    >
      {tag}
    </Badge>
  )
}
