import { Badge } from '@/components/ui/badge'
import { cn } from '@/utilities/ui'

const tagClassMap: Record<string, string> = {
  'Limited Batch': 'bg-candera-ember-strong text-white border-transparent',
  'Bestseller': 'bg-candera-obsidian text-white border-transparent',
  'New Release': 'bg-candera-rose-strong text-white border-transparent',
}

export function ProductTagBadge({ tag, className }: { tag: string; className?: string }) {
  return (
    <Badge
      className={cn(
        'text-[10px] font-bold uppercase tracking-[.25em] px-4 py-2 shadow-xl rounded-none',
        tagClassMap[tag] ?? 'bg-candera-obsidian text-white border-transparent',
        className,
      )}
    >
      {tag}
    </Badge>
  )
}
