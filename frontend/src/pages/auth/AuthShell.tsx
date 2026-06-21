import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { PageTransition } from "@/components/animations/PageTransition";
import { appConfig } from "@/config/app";

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle: string;
  title: string;
}>;

const notes = [
  "Create a wall of love for your special day.",
  "Invite friends to leave wishes, memories, and gifts.",
  "Turn heartfelt messages into a beautiful keepsake."
];

export function AuthShell({
  children,
  eyebrow,
  subtitle,
  title
}: AuthShellProps) {
  return (
    <PageTransition>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <section className="relative overflow-hidden rounded-[36px] border border-white/65 bg-[linear-gradient(135deg,#432235_0%,#6d4056_48%,#eab1b8_100%)] p-8 text-white shadow-card sm:p-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,250,244,0.18),transparent_32%)]" />
            <div className="relative flex h-full flex-col justify-between gap-10">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blush-100">
                  {appConfig.appName}
                </p>
                <h1 className="mt-5 max-w-xl font-display text-4xl leading-tight sm:text-5xl">
                  Welcome back to a more beautiful way to celebrate together.
                </h1>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {notes.map((note, index) => (
                  <div
                    key={note}
                    className="rounded-[26px] border border-white/14 bg-white/10 p-4 backdrop-blur"
                    style={{
                      transform: `rotate(${index === 1 ? "-2deg" : `${index + 1}deg`})`
                    }}
                  >
                    <p className="font-display text-xl">Note {index + 1}</p>
                    <p className="mt-3 text-sm leading-6 text-white/82">{note}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="flex items-center">
            <Card
              tone="paper"
              className="w-full border-white/70 bg-white/90 p-7 sm:p-8"
              eyebrow={eyebrow}
              title={title}
              description={subtitle}
            >
              {children}
              <p className="mt-6 text-center text-sm text-charcoal-900/60">
                <Link className="font-medium text-plum-800" to="/privacy-policy">
                  Privacy Policy
                </Link>
                <span className="mx-2 text-charcoal-900/35">•</span>
                <Link className="font-medium text-plum-800" to="/terms-of-service">
                  Terms of Service
                </Link>
              </p>
            </Card>
          </section>
        </div>
      </main>
    </PageTransition>
  );
}
