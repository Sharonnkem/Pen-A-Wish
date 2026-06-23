import type { PropsWithChildren } from "react";
import { Link } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { PageTransition } from "../../components/animations/PageTransition";
import { appConfig } from "../../config/app";

type AuthShellProps = PropsWithChildren<{
  eyebrow: string;
  subtitle: string;
  title: string;
}>;

export function AuthShell({
  children,
  eyebrow,
  subtitle,
  title
}: AuthShellProps) {
  return (
    <PageTransition>
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-3xl gap-6">
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
