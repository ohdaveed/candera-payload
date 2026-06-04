import { Loader2Icon } from "lucide-react"

import { cn } from "@/utilities/ui"

/** Animated loading spinner using the Lucide Loader2 icon. */
function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin", className)}
      {...props}
    />
  )
}

export { Spinner }
