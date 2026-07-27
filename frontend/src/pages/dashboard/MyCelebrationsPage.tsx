import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { Input } from "../../components/forms/Input";
import { LoadingState } from "../../components/common/LoadingState";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { eventService } from "../../services/event.service";
import { useToast } from "../../components/common/Toast";
import {
  getCelebrationPreviewImageUrl,
  getCelebrationShareUrl,
  openShareUrl,
  shareCelebrationInvite
} from "../../utils/share";

export function MyCelebrationsPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 6;

  const eventsQuery = useQuery({
    queryFn: () => eventService.getMyEvents(),
    queryKey: ["my-events"]
  });

  const events = eventsQuery.data?.data.events ?? [];

  const filteredEvents = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return events;
    }

    return events.filter((event) =>
      [event.title, event.celebrantName, event.eventType, event.slug].some((value) =>
        value.toLowerCase().includes(term)
      )
    );
  }, [events, search]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const currentPage = Math.min(page, totalPages);

  const visibleEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [currentPage, filteredEvents]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  return (
    <DashboardLayout
      title="My celebrations"
      subtitle="Browse every celebration you have created in a clean table with search and pagination."
      actions={<Button onClick={() => navigate("/celebrations/new")}>Create celebration</Button>}
    >
      <section className="rounded-[28px] border border-white/70 bg-white/84 p-5 shadow-card">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
          <div>
            <h2 className="font-display text-3xl text-charcoal-900">Celebration library</h2>
            <p className="mt-1 text-sm text-charcoal-900/62">
              Search by title, celebrant, event type, or slug to move quickly between pages.
            </p>
          </div>
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search celebrations"
          />
        </div>
      </section>

      {eventsQuery.isLoading ? (
        <LoadingState label="Gathering your celebration library..." />
      ) : null}

      {eventsQuery.isError ? (
        <EmptyState
          title="Unable to load celebrations"
          description="We could not fetch your celebration list right now."
          actionLabel="Try again"
          onAction={() => void eventsQuery.refetch()}
        />
      ) : null}

      {!eventsQuery.isLoading && !eventsQuery.isError && !filteredEvents.length ? (
        <EmptyState
          title={events.length ? "No matching celebrations" : "No celebrations yet"}
          description={
            events.length
              ? "Try a different search phrase to find the celebration you want."
              : "Create your first celebration to start collecting wishes, memories, and gifts."
          }
          actionLabel={events.length ? undefined : "Create celebration"}
          onAction={events.length ? undefined : () => navigate("/celebrations/new")}
        />
      ) : null}

      {!!filteredEvents.length ? (
        <div className="space-y-4">
          <Card className="overflow-hidden p-0">
            <div className="grid gap-4 p-4 lg:hidden">
              {visibleEvents.map((event) => {
                const shareUrl = getCelebrationShareUrl(event.slug);
                const eventDate = new Date(event.eventDate).toLocaleDateString();

                return (
                  <article
                    key={event.id}
                    className="rounded-[24px] border border-plum-700/10 bg-white/92 p-4 shadow-[0_14px_28px_rgba(67,34,53,0.06)]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-white/70 bg-cream-50 shadow-[0_10px_24px_rgba(67,34,53,0.08)]">
                        <img
                          alt={`${event.title} cover`}
                          className="h-full w-full object-cover"
                          src={event.coverImageUrl ?? event.profileImageUrl ?? "/pen-a-wish-og.svg"}
                        />
                        <div className="absolute right-1 top-1 h-9 w-9 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_12px_22px_rgba(67,34,53,0.2)]">
                          <img
                            alt={`${event.title} profile`}
                            className="h-full w-full rounded-full object-cover"
                            src={event.profileImageUrl ?? event.coverImageUrl ?? "/pen-a-wish-og.svg"}
                          />
                        </div>
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="min-w-0 flex-1 truncate font-display text-[1.2rem] text-charcoal-900">
                            {event.title}
                          </h3>
                          <span className="rounded-full border border-plum-700/10 bg-cream-50 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-plum-700">
                            {event.eventType}
                          </span>
                        </div>
                        <p className="mt-1 text-sm text-charcoal-900/62">
                          {event.celebrantName} · {eventDate}
                        </p>
                        <p className="mt-1 text-sm text-charcoal-900/58">
                          {event.wishesCount ?? 0} wishes · {event.giftsCount ?? 0} gifts
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button variant="secondary" size="sm" fullWidth onClick={() => navigate(`/celebrations/${event.id}`)}>
                        Open
                      </Button>
                      <Button variant="ghost" size="sm" fullWidth onClick={() => navigate(`/celebrations/${event.id}/edit`)}>
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={async () => {
                          const shared = await shareCelebrationInvite({
                            celebrantName: event.celebrantName,
                            eventType: event.eventType,
                            publicUrl: shareUrl,
                            sharePreviewImageUrl: getCelebrationPreviewImageUrl(
                              event.profileImageUrl,
                              event.coverImageUrl
                            ),
                            title: event.title
                          });

                          if (shared) {
                            return;
                          }

                          try {
                            if (navigator.clipboard?.writeText) {
                              await navigator.clipboard.writeText(shareUrl);
                              showToast({
                                title: "Share link copied",
                                description: "You can paste the celebration link anywhere you like.",
                                tone: "success"
                              });
                              return;
                            }
                          } catch {
                            // Fall through to opening the share URL.
                          }

                          openShareUrl(shareUrl);
                          showToast({
                            title: "Share link opened",
                            description: "Use the browser share sheet or copy the link from there.",
                            tone: "success"
                          });
                        }}
                      >
                        Share
                      </Button>
                      <Button variant="ghost" size="sm" fullWidth onClick={() => navigate(`/celebrations/${event.id}/wall`)}>
                        Wish Wall
                      </Button>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="hidden overflow-x-auto lg:block">
              <table className="min-w-[920px] w-full border-collapse">
                <thead>
                  <tr className="border-b border-plum-700/10 text-left text-xs font-semibold uppercase tracking-[0.22em] text-charcoal-900/48">
                    <th className="px-5 py-4">Celebration</th>
                    <th className="px-5 py-4">Details</th>
                    <th className="px-5 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-plum-700/10">
                  {visibleEvents.map((event) => {
                    const shareUrl = getCelebrationShareUrl(event.slug);
                    const eventDate = new Date(event.eventDate).toLocaleDateString();

                    return (
                      <tr key={event.id} className="align-top">
                        <td className="px-2 py-1 align-middle">
                          <div
                            className="relative overflow-hidden rounded-[8px] border border-white/70 bg-cream-50 shadow-[0_10px_24px_rgba(67,34,53,0.08)]"
                            style={{ height: 88, width: 88, minHeight: 88, minWidth: 88 }}
                          >
                            <img
                              alt={`${event.title} cover`}
                              className="h-full w-full rounded-[7px] object-cover"
                              src={event.coverImageUrl ?? event.profileImageUrl ?? "/pen-a-wish-og.svg"}
                            />
                            <div
                              className="absolute right-2 top-2 z-10 overflow-hidden rounded-full border-2 border-white bg-white shadow-[0_12px_22px_rgba(67,34,53,0.2)]"
                              style={{ height: 44, width: 44, minHeight: 44, minWidth: 44 }}
                            >
                              <img
                                alt={`${event.title} profile`}
                                className="h-full w-full rounded-full object-cover"
                                src={event.profileImageUrl ?? event.coverImageUrl ?? "/pen-a-wish-og.svg"}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="space-y-1.5">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="font-display text-[1.35rem] text-charcoal-900">{event.title}</h3>
                              <span className="rounded-full border border-plum-700/10 bg-cream-50 px-2 py-0.5 text-[0.66rem] font-semibold uppercase tracking-[0.14em] text-plum-700">
                                {event.eventType}
                              </span>
                            </div>
                            <p className="text-[0.76rem] text-charcoal-900/62">
                              {event.celebrantName} · {eventDate}
                            </p>
                            <p className="text-[0.76rem] text-charcoal-900/58">
                              {event.wishesCount ?? 0} wishes · {event.giftsCount ?? 0} gifts
                            </p>
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex min-w-[8.5rem] flex-col gap-2 xl:min-w-[9.5rem]">
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              onClick={() => navigate(`/celebrations/${event.id}`)}
                            >
                              Open
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              fullWidth
                              onClick={() => navigate(`/celebrations/${event.id}/edit`)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              fullWidth
                            onClick={async () => {
                              const shared = await shareCelebrationInvite({
                                  celebrantName: event.celebrantName,
                                  eventType: event.eventType,
                                  publicUrl: shareUrl,
                                  sharePreviewImageUrl: getCelebrationPreviewImageUrl(
                                    event.profileImageUrl,
                                    event.coverImageUrl
                                  ),
                                  title: event.title
                                });

                                if (shared) {
                                  return;
                                }

                                try {
                                  if (navigator.clipboard?.writeText) {
                                    await navigator.clipboard.writeText(shareUrl);
                                    showToast({
                                      title: "Share link copied",
                                      description: "You can paste the celebration link anywhere you like.",
                                      tone: "success"
                                    });
                                    return;
                                  }
                                } catch {
                                  // Fall through to opening the share URL.
                                }

                                openShareUrl(shareUrl);
                                showToast({
                                  title: "Share link opened",
                                  description: "Use the browser share sheet or copy the link from there.",
                                  tone: "success"
                                });
                              }}
                            >
                              Share
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              fullWidth
                              onClick={() => navigate(`/celebrations/${event.id}/wall`)}
                            >
                              Wish Wall
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {totalPages > 1 ? (
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] border border-white/70 bg-white/82 px-4 py-3 shadow-[0_12px_30px_rgba(67,34,53,0.06)]">
              <p className="text-xs uppercase tracking-[0.22em] text-charcoal-900/48">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="rounded-full border border-plum-700/10 bg-white/70 px-3 py-2 text-sm text-charcoal-900/64 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={currentPage === 1}
                  type="button"
                  onClick={() => setPage((currentValue) => Math.max(1, currentValue - 1))}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    className={
                      pageNumber === currentPage
                        ? "min-w-10 rounded-full bg-plum-800 px-3 py-2 text-sm font-semibold text-white shadow-[0_10px_20px_rgba(67,34,53,0.14)]"
                        : "min-w-10 rounded-full bg-white/70 px-3 py-2 text-sm text-charcoal-900/64 transition hover:bg-white hover:text-charcoal-900"
                    }
                    type="button"
                    onClick={() => setPage(pageNumber)}
                  >
                    {pageNumber}
                  </button>
                ))}
                <button
                  className="rounded-full border border-plum-700/10 bg-white/70 px-3 py-2 text-sm text-charcoal-900/64 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-35"
                  disabled={currentPage >= totalPages}
                  type="button"
                  onClick={() => setPage((currentValue) => Math.min(totalPages, currentValue + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </DashboardLayout>
  );
}
