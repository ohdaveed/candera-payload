'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect, useTransition } from 'react'
import { useDebounce } from '@/app/(frontend)/hooks/useDebounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const Search: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [value, setValue] = useState(query)
  const [isPending, startTransition] = useTransition()

  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    setValue(query)
  }, [query])

  function clearSearch() {
    setValue('')
    const params = new URLSearchParams(searchParams.toString())
    params.delete('q')
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => {
      router.replace(nextUrl)
    })
  }

  useEffect(() => {
    const nextQuery = debouncedValue.trim()
    const currentQuery = query.trim()

    if (nextQuery === currentQuery) {
      return
    }

    const params = new URLSearchParams(searchParams.toString())
    if (nextQuery) {
      params.set('q', nextQuery)
    } else {
      params.delete('q')
    }

    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname
    startTransition(() => {
      router.replace(nextUrl)
    })
  }, [debouncedValue, pathname, query, router, searchParams])

  return (
    <div className="w-full">
      <form
        className="mx-auto w-full max-w-[270px] sm:max-w-[360px]"
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <Label htmlFor="search" className="sr-only">
          Search
        </Label>
        <p id="search-help" className="caption text-candera-sage-text text-center mb-3">
          Search by scent note, atmosphere, or mood
        </p>
        <div className="relative">
          <Input
            id="search"
            autoComplete="off"
            name="q"
            value={value}
            aria-describedby="search-help search-status"
            aria-busy={isPending}
            onChange={(event) => {
              setValue(event.target.value)
            }}
            placeholder="Sandalwood, citrus, smoke…"
            className="h-[48px] min-h-[48px] border-candera-stone/50 bg-candera-vellum/60 px-5 py-3 text-center"
          />
          {value && (
            <button
              type="button"
              onClick={clearSearch}
              aria-label="Clear search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center text-lg leading-none text-candera-sage-text hover:text-candera-obsidian transition-all outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-sm cursor-pointer"
            >
              <span aria-hidden="true">×</span>
            </button>
          )}
        </div>
        <output
          id="search-status"
          aria-live="polite"
          className="caption text-candera-sage-text text-center mt-3 block h-4"
        >
          {isPending ? 'Searching…' : ''}
        </output>
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
