'use client'

import { useFormContext } from 'react-hook-form'

export const Error = ({ name }: { name: string }) => {
  const {
    formState: { errors },
  } = useFormContext()
  return (
    <div className="mt-2 text-destructive text-sm" id={`${name}-error`} role="alert">
      {(errors[name]?.message as string) || 'This field is required'}
    </div>
  )
}
