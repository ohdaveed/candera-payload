'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/app/(frontend)/hooks/useDebounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const Search: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [value, setValue] = useState(query)

  const debouncedValue = useDebounce(value, 300)

  useEffect(() => {
    setValue(query)
  }, [query])

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
    router.replace(nextUrl)
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
        <Input
          id="search"
          autoComplete="off"
          name="q"
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Sandalwood, citrus, smoke…"
          className="h-[48px] min-h-[48px] border-candera-stone/50 bg-candera-vellum/60 px-5 py-3 text-center"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
