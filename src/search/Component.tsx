'use client'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import React, { useState, useEffect } from 'react'
import { useDebounce } from '@/utilities/useDebounce'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'

export const Search: React.FC = () => {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const query = searchParams.get('q') ?? ''
  const [value, setValue] = useState(query)

  const debouncedValue = useDebounce(value)

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
    <div>
      <form
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
          value={value}
          onChange={(event) => {
            setValue(event.target.value)
          }}
          placeholder="Search…"
        />
        <button type="submit" className="sr-only">
          submit
        </button>
      </form>
    </div>
  )
}
