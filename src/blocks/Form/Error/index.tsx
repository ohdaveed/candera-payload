'use client'

import * as React from 'react'
import { useFormContext } from 'react-hook-form'

/**
 * Displays the validation error message for a named form field.
 * Reads the error state from the enclosing react-hook-form context.
 */
export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="mt-2 text-red-500 text-sm" id={`${name}-error`} role="alert">
      {(errors[name]?.message as string) || 'This field is required'}
    </div>
  )
}
