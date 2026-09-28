import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// FACE.IT Button — one `primary` per view; everything else secondary or ghost.
const primary = "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover"
const secondary = "border border-line bg-surface text-ink hover:bg-surface-sunken"
const danger = "bg-absent text-destructive-foreground hover:brightness-[.92]"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-transparent font-medium transition-colors duration-120 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] disabled:cursor-not-allowed disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary,
        secondary,
        ghost: "bg-transparent text-ink hover:bg-surface-sunken",
        danger,
        link: "h-auto border-0 bg-transparent p-0 text-signal underline underline-offset-[3px] decoration-1",
        // Legacy aliases — prefer the names above in new code
        default: primary,
        ink: primary,
        accent: primary,
        destructive: danger,
        outline: secondary,
        soft: "bg-surface-sunken text-ink hover:bg-hairline",
      },
      size: {
        sm: "h-control-sm px-3 text-[13px]",
        default: "h-control-md px-4 text-sm",
        md: "h-control-md px-4 text-sm",
        lg: "h-control-lg px-6 text-[15px]",
        xl: "h-control-lg px-6 text-[15px]",
        icon: "h-control-md w-control-md p-0 text-ink-muted hover:text-ink",
        "icon-sm": "h-control-sm w-control-sm p-0 text-ink-muted hover:text-ink",
      },
      block: {
        true: "w-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, loading = false, disabled, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, block, className }))}
        ref={ref}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && !asChild ? (
          <>
            <span
              aria-hidden="true"
              className="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
            />
            {children}
          </>
        ) : (
          children
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
