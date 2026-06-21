import type { ReactNode } from "react";

import { Button } from "@/components/common/Button";
import { cn } from "@/utils/cn";

type EmptyStateProps = {
  actionLabel?: string;
  className?: string;
  description: string;
  onAction?: () => void;
  title: string;
  visual?: ReactNode;
};

export function EmptyState({
  actionLabel,
  className,
  description,
  onAction,
  title,
  visual
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "rounded-[30px] border border-dashed border-plum-700/18 bg-white/76 px-6 py-10 text-center shadow-card sm:px-8 sm:py-12",
        className
      )}
    >
      <div className="mx-auto flex max-w-md flex-col items-center">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-[radial-gradient(circle_at_top,#f7d9dc_0%,#fffaf4_72%)] text-3xl shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
          {visual ?? <span aria-hidden="true">*</span>}
        </div>
        <h3 className="font-display text-3xl text-plum-800">{title}</h3>
        <p className="mt-3 text-sm leading-7 text-charcoal-900/70">{description}</p>
        {actionLabel && onAction ? (
          <Button className="mt-6" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </div>
    </div>
  );
}
