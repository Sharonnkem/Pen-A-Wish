import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { CelebrationCard } from "@/components/cards/CelebrationCard";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { Input } from "@/components/forms/Input";
import { LoadingState } from "@/components/common/LoadingState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { eventService } from "@/services/event.service";

export function MyCelebrationsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
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

  return (
    <DashboardLayout
      title="My celebrations"
      subtitle="Browse every celebration you have created, with search and action-ready cards that stay clean across desktop and mobile."
      actions={
        <Button onClick={() => navigate("/celebrations/new")}>Create celebration</Button>
      }
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
        <div className="grid gap-5 xl:grid-cols-2">
          {filteredEvents.map((event) => (
              <CelebrationCard
                key={event.id}
                event={event}
                onDelete={async (eventId) => {
                  await eventService.deleteEvent(eventId);
                  void eventsQuery.refetch();
                }}
                onGenerateWall={(eventId) => navigate(`/celebrations/${eventId}/wall`)}
              />
            ))}
          </div>
      ) : null}
    </DashboardLayout>
  );
}
