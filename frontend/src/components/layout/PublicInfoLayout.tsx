import type { PropsWithChildren, ReactNode } from "react";
import { Link } from "react-router-dom";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/common/Button";

type PublicInfoLayoutProps = PropsWithChildren<{
  actions?: ReactNode;
  eyebrow: string;
  subtitle: string;
  title: string;
}>;

export function PublicInfoLayout({
  actions,
  children,
  eyebrow,
  subtitle,
  title
}: PublicInfoLayoutProps) {
  return (
    <PageTransition>
      <main className="min-h-screen bg-paper px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[82rem] space-y-6">
          <header className="rounded-[34px] border border-white/70 bg-white/82 px-5 py-4 shadow-card sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <Link to="/" className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-full border border-plum-800/12 bg-white text-[0.95rem] font-semibold text-plum-800 shadow-[0_8px_20px_rgba(67,34,53,0.06)]">
                  P
                </span>
                <div>
                  <p className="text-[1.05rem] font-medium tracking-[0.02em] text-plum-800">
                    Pen A <span className="font-display italic text-[1.06rem]">Wish</span>
                  </p>
                  <p className="mt-1 text-sm text-charcoal-900/62">Premium celebration platform</p>
                </div>
              </Link>

              <div className="flex flex-wrap gap-3">
                <Link to="/">
                  <Button variant="ghost">Home</Button>
                </Link>
                <Link to="/contact">
                  <Button variant="secondary">Contact</Button>
                </Link>
                <Link to="/register">
                  <Button>Create your page</Button>
                </Link>
              </div>
            </div>
          </header>

          <section className="relative overflow-hidden rounded-[38px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.94)_0%,rgba(248,238,228,0.92)_62%,rgba(247,217,220,0.62)_100%)] px-6 py-8 shadow-card sm:px-8 sm:py-10">
            <div className="pointer-events-none absolute inset-y-0 right-0 w-64 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.7),transparent_58%)]" />
            <div className="relative flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
              <div className="max-w-3xl">
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
                  {eyebrow}
                </p>
                <h1 className="mt-4 font-display text-4xl leading-tight text-charcoal-900 sm:text-[3.2rem]">
                  {title}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-8 text-charcoal-900/72 sm:text-base">
                  {subtitle}
                </p>
              </div>
              {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
            </div>
          </section>

          <section className="rounded-[32px] border border-white/70 bg-white/84 p-6 shadow-card sm:p-8">
            {children}
          </section>
        </div>
      </main>
    </PageTransition>
  );
}
