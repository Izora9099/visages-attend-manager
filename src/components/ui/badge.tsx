import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Check, Clock, Minus, X } from "lucide-react"

import { cn } from "@/lib/utils"

// FACE.IT Badge — small label. For attendance states use StatusPill.
const badgeVariants = cva(
  "inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded-full px-2.5 text-xs font-medium",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-ink",
        outline: "bg-transparent text-ink shadow-[inset_0_0_0_1px_var(--line)]",
        signal: "bg-signal-soft text-signal-strong",
        present: "bg-present-soft text-present",
        late: "bg-late-soft text-late",
        absent: "bg-absent-soft text-absent",
        excused: "bg-excused-soft text-excused",
        // Legacy aliases
        default: "bg-surface-sunken text-ink",
        secondary: "bg-surface-sunken text-ink",
        accent: "bg-signal-soft text-signal-strong",
        success: "bg-present-soft text-present",
        warning: "bg-late-soft text-late",
        destructive: "bg-absent-soft text-absent",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
  live?: boolean
}

function Badge({ className, variant, dot, live, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {(dot || live) && (
        <span aria-hidden="true" className={cn("h-1.5 w-1.5 rounded-full bg-current", live && "fi-live-dot")} />
      )}
      {children}
    </div>
  )
}

export type AttendanceStatus = "present" | "late" | "absent" | "excused"

const STATUS: Record<AttendanceStatus, { label: string; Icon: React.ElementType }> = {
  present: { label: "Present", Icon: Check },
  late: { label: "Late", Icon: Clock },
  absent: { label: "Absent", Icon: X },
  excused: { label: "Excused", Icon: Minus },
}

/** Attendance status: glyph + word + tint. Never colour alone. */
function StatusPill({
  status,
  children,
  className,
}: {
  status: AttendanceStatus
  children?: React.ReactNode
  className?: string
}) {
  const { label, Icon } = STATUS[status] ?? STATUS.absent
  return (
    <span className={cn(badgeVariants({ variant: status }), className)}>
      <Icon aria-hidden="true" className="h-3 w-3" strokeWidth={2.5} />
      {children ?? label}
    </span>
  )
}

export { Badge, StatusPill, badgeVariants }
