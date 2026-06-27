import type { PropsWithChildren, ReactNode } from "react";

import { Button } from "../common/Button";
import { cn } from "../../utils/cn";

type PublicEventLayoutProps = PropsWithChildren<{
  className?: string;
  coverSlot?: ReactNode;
  ctaSlot?: ReactNode;
  description: string;
  title: string;
}>;

export function PublicEventLayout({
  children,
  className,
  coverSlot,
  ctaSlot,
  description,
  title
}: PublicEventLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-paper px-4 py-4 sm:px-6", className)}>
      <div className="mx-auto max-w-6xl space-y-6">
        <section className="overflow-hidden rounded-[36px] border border-white/70 bg-white/85 shadow-card">
          <div className="relative min-h-[320px] bg-[linear-gradient(135deg,#432235_0%,#7b4760_52%,#eab1b8_100%)] p-6 sm:p-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.22),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(255,250,244,0.28),transparent_36%)]" />
            {coverSlot ?? (
              <div className="absolute inset-x-6 bottom-6 top-6 rounded-[30px] border border-white/20 bg-white/8 backdrop-blur-[2px]" />
            )}
            <div className="relative z-10 flex h-full flex-col justify-between gap-10 pb-24 sm:pb-0">
              <div className="flex items-start justify-between gap-4">
                <span className="rounded-full bg-white/14 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white">
                  Public Event Page
                </span>
                <div className="flex gap-2">
                  <span className="h-3 w-3 rounded-full bg-white/70" />
                  <span className="h-3 w-3 rounded-full bg-gold-400" />
                </div>
              </div>

              <div className="ml-auto max-w-3xl text-right">
                <h1 className="font-display text-4xl leading-tight text-white sm:text-5xl">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/82 sm:text-base">
                  {description}
                </p>
                <div className="mt-6 flex flex-wrap justify-end gap-3 max-sm:flex-col max-sm:items-start max-sm:justify-start">
                  {ctaSlot ?? (
                    <>
                      <Button>Leave a wish</Button>
                      <Button variant="secondary" className="bg-white/88">
                        Send a gift
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <div>{children}</div>
      </div>
    </div>
  );
}
