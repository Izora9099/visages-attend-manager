import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";

type Direction = "up" | "down" | "flat";
type Tone = "good" | "bad" | "neutral";

interface StatCardProps {
  label: string;
  /** Pre-formatted value ("1,284", "87.4%"). */
  value: React.ReactNode;
  hint?: string;
  /** `positive` is the legacy shape; prefer direction + tone. */
  delta?: { value: string; direction?: Direction; tone?: Tone; positive?: boolean };
  icon?: React.ReactNode;
  emphasis?: boolean;
  /** Legacy alias for `emphasis`. */
  accent?: boolean;
  className?: string;
}

const DeltaIcon = { up: ArrowUpRight, down: ArrowDownRight, flat: Minus };

export function StatCard({ label, value, hint, delta, icon, emphasis, accent, className }: StatCardProps) {
  const emph = emphasis ?? accent;
  const direction: Direction = delta?.direction ?? (delta?.positive === false ? "down" : "up");
  const tone: Tone = delta?.tone ?? (delta?.positive === undefined ? "neutral" : delta.positive ? "good" : "bad");
  const Arrow = DeltaIcon[direction];

  return (
    <div
      className={cn(
        "relative min-w-0 rounded-lg border border-hairline bg-surface p-5 shadow-xs transition-shadow duration-200 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {icon && (
          <div
            aria-hidden="true"
            className={cn(
              "grid h-8 w-8 place-items-center rounded-md border border-hairline text-ink-muted [&_svg]:h-4 [&_svg]:w-4",
              emph && "border-transparent bg-signal-soft text-signal-strong"
            )}
          >
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="text-metric text-ink">{value}</div>
        {delta && (
          <span
            className={cn(
              "num inline-flex items-center gap-0.5 text-xs font-medium",
              tone === "good" && "text-present",
              tone === "bad" && "text-absent",
              tone === "neutral" && "text-ink-muted"
            )}
          >
            <Arrow aria-hidden="true" className="h-3 w-3" />
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-caption text-ink-muted">{hint}</p>}
    </div>
  );
}
