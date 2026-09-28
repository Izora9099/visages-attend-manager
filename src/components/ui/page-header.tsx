import * as React from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

/** Top of every screen: eyebrow, H1, description, actions. */
export function PageHeader({ eyebrow, title, description, actions, className }: PageHeaderProps) {
  return (
    <header
      className={cn(
        "mb-8 flex flex-wrap items-end justify-between gap-6 border-b border-hairline pb-8",
        className
      )}
    >
      <div className="flex max-w-prose flex-col gap-2">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1 className="text-heading-1 text-balance text-ink md:text-display-l">{title}</h1>
        {description && (
          <p className="max-w-[560px] text-body-l text-pretty text-ink-muted">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </header>
  );
}
