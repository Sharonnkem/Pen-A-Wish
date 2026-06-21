import type { HTMLAttributes, PropsWithChildren, ReactNode } from "react";

import { cn } from "@/utils/cn";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    eyebrow?: string;
    title?: string;
    description?: string;
    footer?: ReactNode;
    tone?: "paper" | "polaroid" | "plum";
  }
>;

const toneClasses = {
  paper: "border-white/70 bg-white/85 text-charcoal-900",
  polaroid:
    "border-blush-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,250,244,0.98)_78%,rgba(247,217,220,0.46)_100%)] text-charcoal-900",
  plum: "border-plum-700/10 bg-plum-800 text-white"
} as const;

export function Card({
  children,
  className,
  description,
  eyebrow,
  footer,
  title,
  tone = "paper",
  ...props
}: CardProps) {
  return (
    <article
      className={cn(
        "relative h-full overflow-hidden rounded-[28px] border p-6 shadow-card backdrop-blur sm:p-7",
        toneClasses[tone],
        className
      )}
      {...props}
    >
      <div className="pointer-events-none absolute -right-10 top-0 h-28 w-28 rounded-full bg-white/20 blur-2xl" />
      {(eyebrow || title || description) && (
        <header className="relative">
          {eyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-current/70">
              {eyebrow}
            </p>
          ) : null}
          {title ? (
            <h3 className="mt-3 font-display text-[1.75rem] leading-tight sm:text-[1.9rem]">
              {title}
            </h3>
          ) : null}
          {description ? (
            <p className="mt-3 text-sm leading-7 text-current/75">{description}</p>
          ) : null}
        </header>
      )}
      <div className={cn("relative", (eyebrow || title || description) && "mt-5")}>
        {children}
      </div>
      {footer ? <footer className="relative mt-5">{footer}</footer> : null}
    </article>
  );
}
