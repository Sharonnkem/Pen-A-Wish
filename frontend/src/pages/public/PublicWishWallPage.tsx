import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link, useParams } from "react-router-dom";

import { PageTransition } from "@/components/animations/PageTransition";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { eventService } from "@/services/event.service";

const wallStyles = [
  {
    accent: "bg-blush-100",
    paper: "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(255,250,244,0.95)_100%)]",
    rotate: "rotate-[-2deg]",
    tape: "bg-white/80"
  },
  {
    accent: "bg-amber-200",
    paper: "bg-[linear-gradient(180deg,rgba(255,250,244,0.98)_0%,rgba(248,238,228,0.94)_100%)]",
    rotate: "rotate-[1.5deg]",
    tape: "bg-cream-100"
  },
  {
    accent: "bg-sky-200",
    paper: "bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(247,217,220,0.26)_100%)]",
    rotate: "rotate-[-1deg]",
    tape: "bg-white/75"
  },
  {
    accent: "bg-cream-100",
    paper: "bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,238,228,0.98)_100%)]",
    rotate: "rotate-[2deg]",
    tape: "bg-blush-100"
  }
] as const;

function getWallStyle(index: number) {
  return wallStyles[index % wallStyles.length];
}

export function PublicWishWallPage() {
  const { slug = "" } = useParams();
  const wallQuery = useQuery({
    enabled: Boolean(slug),
    queryFn: () => eventService.getPublicWishWallBySlug(slug),
    queryKey: ["public-wish-wall", slug]
  });

  if (wallQuery.isLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4">
        <LoadingState className="w-full" label="Arranging this Wish Wall..." />
      </main>
    );
  }

  if (wallQuery.isError || !wallQuery.data) {
    return (
      <main className="mx-auto flex min-h-screen max-w-4xl items-center px-4">
        <EmptyState
          title="Wish Wall unavailable"
          description="We could not open this public Wish Wall right now."
        />
      </main>
    );
  }

  const { event, stats, wishes } = wallQuery.data.data;

  return (
    <PageTransition>
      <main className="min-h-screen overflow-hidden bg-paper px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-[84rem] space-y-6">
          <header className="rounded-[34px] border border-white/70 bg-white/82 px-5 py-4 shadow-card sm:px-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-plum-700">
                  Public Wish Wall
                </p>
                <h1 className="mt-3 font-display text-4xl leading-tight text-charcoal-900 sm:text-[3.1rem]">
                  {event.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-charcoal-900/72 sm:text-base">
                  A scrapbook-style wall of public wishes for {event.celebrantName}.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to={`/events/${event.slug}`}>
                  <Button variant="secondary">Back to event page</Button>
                </Link>
                <Link to="/register">
                  <Button>Create your own page</Button>
                </Link>
              </div>
            </div>
          </header>

          <section className="grid gap-4 xl:grid-cols-[0.92fr_1.08fr]">
            <div className="rounded-[34px] border border-white/70 bg-plum-800 p-6 text-white shadow-card">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blush-100">
                Wish Wall story
              </p>
              <h2 className="mt-3 font-display text-3xl leading-tight">
                The heart of Pen A Wish, gathered into one keepsake wall.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/78">
                Public wishes appear here as layered paper moments instead of a plain list, keeping the celebration visual, warm, and memorable across desktop and mobile web.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
                <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Wishes</p>
                <p className="mt-3 font-display text-4xl text-plum-800">{stats.wishesCount}</p>
              </div>
              <div className="rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
                <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Memories</p>
                <p className="mt-3 font-display text-4xl text-plum-800">{stats.guestbookCount}</p>
              </div>
              <div className="rounded-[30px] border border-white/70 bg-white/84 p-5 shadow-card">
                <p className="text-xs uppercase tracking-[0.22em] text-plum-700">Gifts</p>
                <p className="mt-3 font-display text-4xl text-plum-800">{stats.giftsCount}</p>
              </div>
            </div>
          </section>

          {!wishes.length ? (
            <EmptyState
              title="No public wishes yet"
              description="When guests begin leaving wishes, they will appear here in the full public Wish Wall."
            />
          ) : (
            <section className="relative overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,250,244,0.92)_0%,rgba(248,238,228,0.9)_100%)] p-4 shadow-card sm:p-6">
              <div className="pointer-events-none absolute left-6 top-6 h-20 w-20 rounded-full bg-blush-100/70 blur-2xl" />
              <div className="pointer-events-none absolute bottom-10 right-10 h-24 w-24 rounded-full bg-gold-400/15 blur-3xl" />
              <div className="pointer-events-none absolute right-6 top-8 h-10 w-28 rotate-6 rounded-full border border-white/60 bg-white/45" />
              <div className="pointer-events-none absolute bottom-8 left-8 h-10 w-24 -rotate-12 rounded-full border border-white/50 bg-cream-100/55" />

              <div className="relative mb-6 rounded-[28px] border border-white/70 bg-white/76 px-5 py-5 shadow-[0_18px_40px_rgba(67,34,53,0.08)]">
                <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-plum-700">
                      Pen A Wish
                    </p>
                    <h2 className="mt-3 font-display text-4xl text-charcoal-900">
                      {event.title}
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-charcoal-900/68">
                      Wishes collected for {event.celebrantName} on {new Date(event.eventDate).toLocaleDateString()}.
                    </p>
                  </div>
                  <div className="grid gap-2 text-sm text-charcoal-900/68 md:text-right">
                    <p>
                      <span className="font-semibold text-charcoal-900">Event type:</span>{" "}
                      {event.eventType}
                    </p>
                    <p>
                      <span className="font-semibold text-charcoal-900">Wall mood:</span>{" "}
                      Scrapbook collage
                    </p>
                  </div>
                </div>
              </div>

              <div className="columns-1 gap-5 sm:columns-2 xl:columns-3">
                {wishes.map((wish, index) => {
                  const style = getWallStyle(index);

                  return (
                    <motion.article
                      key={wish.id}
                      initial={{ opacity: 0, y: 26, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      whileInView={{ opacity: 1, y: 0, scale: 1 }}
                      viewport={{ amount: 0.2, once: true }}
                      transition={{ delay: index * 0.04, duration: 0.32, ease: "easeOut" }}
                      className={`relative mb-5 break-inside-avoid rounded-[30px] border border-white/75 ${style.paper} ${style.rotate} p-5 shadow-[0_24px_54px_rgba(67,34,53,0.14)]`}
                    >
                      <div
                        className={`pointer-events-none absolute left-1/2 top-0 h-7 w-20 -translate-x-1/2 -translate-y-1/2 rotate-2 rounded-b-[18px] ${style.tape} shadow-[0_8px_16px_rgba(67,34,53,0.08)]`}
                      />
                      <div className="pointer-events-none absolute inset-0 rounded-[30px] bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.42),transparent_42%)]" />

                      <div className="relative">
                        <div className={`h-2 w-16 rounded-full ${style.accent}`} />
                        <div className="mt-4 flex items-start justify-between gap-4">
                          <div>
                            <p className="font-display text-2xl text-plum-800">
                              {wish.senderName}
                            </p>
                            <p className="mt-1 text-xs font-semibold uppercase tracking-[0.22em] text-charcoal-900/44">
                              Wish card
                            </p>
                          </div>
                          <p className="text-xs uppercase tracking-[0.2em] text-charcoal-900/42">
                            {new Date(wish.createdAt).toLocaleDateString()}
                          </p>
                        </div>

                        <p className="mt-5 text-[15px] leading-8 text-charcoal-900/76">
                          {wish.message}
                        </p>

                        <div className="mt-6 flex flex-wrap gap-2">
                          {(wish.reactionCounts.length ? wish.reactionCounts : []).map((reaction) => (
                            <span
                              key={`${wish.id}-${reaction.reactionType}`}
                              className="inline-flex items-center gap-2 rounded-full border border-plum-700/10 bg-white/70 px-3 py-1 text-xs font-semibold text-plum-800"
                            >
                              <span>{reaction.reactionType}</span>
                              <span>{reaction.count}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.article>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
