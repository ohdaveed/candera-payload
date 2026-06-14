import Image from 'next/image'
import Link from 'next/link'
import { formatDateTime } from '@/utilities/formatDateTime'

interface ArticleCardProps {
  title: string
  slug: string
  excerpt?: string | null
  date?: string | null
  imageUrl?: string | null
  imageAlt?: string | null
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  title,
  slug,
  excerpt,
  date,
  imageUrl,
  imageAlt,
}) => (
  <Link href={`/posts/${slug}`} className="block group">
    <article className="flex flex-col h-full">
      <div className="relative w-full overflow-hidden bg-candera-ash aspect-[4/3]">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={imageAlt || ''}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-1000 group-hover:scale-105 motion-reduce:transition-none"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-candera-ash">
            <span className="text-candera-stone/40 text-xs uppercase tracking-widest">
              No image
            </span>
          </div>
        )}
      </div>

      <div className="pt-5 pb-3 flex-1 flex flex-col">
        {date && (
          <time
            className="font-sans text-xs font-semibold uppercase tracking-[.14em] text-candera-stone/70 mb-2"
            dateTime={date}
          >
            {formatDateTime(date)}
          </time>
        )}

        <h3 className="font-display text-lg font-normal not-italic leading-[1.2] text-candera-obsidian m-0 mb-0.5 group-hover:text-candera-ember-strong transition-colors">
          {title}
        </h3>

        {excerpt && (
          <p className="font-serif italic text-sm text-candera-sage-text leading-[1.55] line-clamp-2 m-0">
            {excerpt}
          </p>
        )}

        <div className="mt-auto pt-6">
          <span className="text-sm font-bold uppercase tracking-[.2em] text-candera-sage-text border-b border-candera-sage-text/40 pb-px group-hover:text-candera-ember-strong group-hover:border-candera-ember-strong transition-colors">
            Read →
          </span>
        </div>
      </div>
    </article>
  </Link>
)
