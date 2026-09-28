import * as React from "react"

import { cn } from "@/lib/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "flex min-h-[88px] w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-sm leading-[22px] text-ink transition-colors duration-120 placeholder:text-ink-muted hover:border-ink-muted focus-visible:border-signal focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:bg-surface-sunken disabled:text-ink-muted",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = "Textarea"

export { Textarea }
