import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
  delta?: { value: string; positive?: boolean };
  icon?: React.ReactNode;
  accent?: boolean;
  className?: string;
}

export function StatCard({ label, value, hint, delta, icon, accent, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-lg border border-hairline bg-card p-5 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        accent && "ring-1 ring-accent/20",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {icon && (
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-md border border-hairline text-muted-foreground transition-colors group-hover:text-foreground",
            accent && "border-accent/30 text-accent bg-accent-soft"
          )}>
            {icon}
          </div>
        )}
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <div className="display-serif text-4xl leading-none num font-light">
          {value}
        </div>
        {delta && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 text-xs font-medium num",
              delta.positive ? "text-success" : "text-destructive"
            )}
          >
            {delta.positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta.value}
          </span>
        )}
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    </div>
  );
}
