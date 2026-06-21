import { ApiStatusCard } from "@/components/common/ApiStatusCard";
import { appConfig } from "@/config/app";

const checklist = [
  "React + TypeScript + Vite frontend scaffold",
  "Tailwind CSS foundation and design tokens",
  "Fetch-based API client wired to environment config",
  "Express + TypeScript backend foundation",
  "Shared workspace structure for future features"
];

export function FoundationPage() {
  return (
    <main className="min-h-screen px-6 py-10 sm:px-8 lg:px-12">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-white/60 bg-white/80 p-8 shadow-card backdrop-blur sm:p-10">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-plum-700">
            Pen A Wish
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-charcoal-900 sm:text-5xl">
            Full-stack foundation ready for the celebration platform build.
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-charcoal-900/75 sm:text-lg">
            This setup follows the source-of-truth Phase 1 scope only. Feature
            screens, payment flows, dashboards, and event experiences will be
            layered on top of this structure in later phases.
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {checklist.map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-blush-100 bg-cream-50 px-4 py-4 text-sm text-charcoal-900/80"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.3fr_0.9fr]">
          <div className="rounded-[28px] border border-plum-700/10 bg-white/85 p-7 shadow-card">
            <h2 className="font-display text-2xl text-plum-800">
              Workspace Notes
            </h2>
            <dl className="mt-5 grid gap-4 text-sm text-charcoal-900/80 sm:grid-cols-2">
              <div className="rounded-3xl bg-cream-50 p-4">
                <dt className="font-semibold text-charcoal-900">Frontend</dt>
                <dd className="mt-2">React, TypeScript, Vite, Tailwind CSS</dd>
              </div>
              <div className="rounded-3xl bg-cream-50 p-4">
                <dt className="font-semibold text-charcoal-900">Backend</dt>
                <dd className="mt-2">Node.js, Express, TypeScript</dd>
              </div>
              <div className="rounded-3xl bg-cream-50 p-4">
                <dt className="font-semibold text-charcoal-900">API Base</dt>
                <dd className="mt-2 break-all">{appConfig.apiBaseUrl}</dd>
              </div>
              <div className="rounded-3xl bg-cream-50 p-4">
                <dt className="font-semibold text-charcoal-900">App Name</dt>
                <dd className="mt-2">{appConfig.appName}</dd>
              </div>
            </dl>
          </div>

          <ApiStatusCard />
        </section>
      </div>
    </main>
  );
}

