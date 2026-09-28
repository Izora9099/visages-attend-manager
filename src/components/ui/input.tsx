import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-control-md w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors duration-120 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-ink placeholder:text-ink-muted hover:border-ink-muted focus-visible:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
