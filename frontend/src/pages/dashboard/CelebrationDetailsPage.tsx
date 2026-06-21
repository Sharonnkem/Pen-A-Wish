import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { eventService } from "@/services/event.service";

const fallbackImage =
  "data:image/svg+xml;utf8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='480' height='320' viewBox='0 0 480 320'%3E%3Crect width='480' height='320' fill='%23f8eee4'/%3E%3Crect x='32' y='32' width='416' height='256' rx='28' fill='%23ffffff'/%3E%3Ctext x='240' y='145' text-anchor='middle' font-family='Georgia, serif' font-size='32' fill='%23432235'%3EPen A Wish%3C/text%3E%3Ctext x='240' y='190' text-anchor='middle' font-family='Arial, sans-serif' font-size='16' fill='%235f324a'%3ECelebration details%3C/text%3E%3C/svg%3E";

export function CelebrationDetailsPage() {
  const { id = "" } = useParams();
  const navigate = useNavigate();

  const eventQuery = useQuery({
    enabled: Boolean(id),
    queryFn: () => eventService.getEventById(id),
    queryKey: ["event", id]
  });
  const eventsQuery = useQuery({
    queryFn: () => eventService.getMyEvents(),
    queryKey: ["my-events"]
  });

  const event = eventQuery.data?.data.event;
  const eventSummary = useMemo(
    () => eventsQuery.data?.data.events.find((current) => current.id === id) ?? null,
    [eventsQuery.data, id]
  );

  const shareUrl = useMemo(() => {
    if (!event) {
      return "";
    }

    if (typeof window === "undefined") {
      return `/events/${event.slug}`;
    }

    return `${window.location.origin}/events/${event.slug}`;
  }, [event]);

  if (eventQuery.isLoading || eventsQuery.isLoading) {
    return (
      <DashboardLayout
        title="Celebration details"
        subtitle="Loading your celebration page..."
      >
        <LoadingState />
      </DashboardLayout>
    );
  }

  if (eventQuery.isError || !event) {
    return (
      <DashboardLayout
        title="Celebration details"
        subtitle="We could not load that celebration right now."
      >
        <EmptyState
          title="Celebration not found"
          description="We could not load this celebration right now."
          actionLabel="Back to celebrations"
          onAction={() => navigate("/celebrations")}
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={event.title}
      subtitle="A simple overview of the celebration with quick links to the other management pages."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate(`/celebrations/${id}/edit`)}>
            Edit celebration
          </Button>
          <Button onClick={() => navigate(`/celebrations/${id}/wall`)}>
            Open Wish Wall Studio
          </Button>
        </>
      }
    >
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card
          title="Celebration summary"
          description="The key details guests see on the public event page."
        >
          <div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)]">
            <div className="space-y-3">
              <img
                alt={`${event.celebrantName} profile`}
                className="h-36 w-full rounded-[26px] object-cover shadow-card"
                src={event.profileImageUrl || event.coverImageUrl || fallbackImage}
              />
              <p className="text-sm font-medium text-charcoal-900">{event.celebrantName}</p>
            </div>
            <div className="space-y-4 text-sm leading-7 text-charcoal-900/72">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[20px] bg-cream-50 p-4">
                  <p className="text-charcoal-900/52">Event type</p>
                  <p className="mt-2 font-semibold text-charcoal-900">{event.eventType}</p>
                </div>
                <div className="rounded-[20px] bg-cream-50 p-4">
                  <p className="text-charcoal-900/52">Event date</p>
                  <p className="mt-2 font-semibold text-charcoal-900">
                    {new Date(event.eventDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="rounded-[20px] border border-plum-700/10 bg-white/72 p-4">
                <p className="text-charcoal-900/52">Description</p>
                <p className="mt-2">{event.description ?? "No description added yet."}</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="ghost" onClick={() => navigate("/celebrations")}>
                  All celebrations
                </Button>
                <Link to={`/events/${event.slug}`}>
                  <Button variant="secondary">View public page</Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    if (shareUrl) {
                      await navigator.clipboard.writeText(shareUrl);
                    }
                  }}
                >
                  Copy share link
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card
          tone="polaroid"
          title="At a glance"
          description="A quick snapshot of this celebration and the current creator workflow."
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-[20px] bg-white/72 p-4">
              <p className="text-sm text-charcoal-900/58">Visible wishes</p>
              <p className="mt-3 font-display text-3xl text-plum-800">
                {eventSummary?.wishesCount ?? 0}
              </p>
            </div>
            <div className="rounded-[20px] bg-white/72 p-4">
              <p className="text-sm text-charcoal-900/58">Public slug</p>
              <p className="mt-3 font-semibold text-charcoal-900">{event.slug}</p>
            </div>
            <div className="rounded-[20px] bg-white/72 p-4">
              <p className="text-sm text-charcoal-900/58">Cover status</p>
              <p className="mt-3 font-semibold text-charcoal-900">
                {event.coverImageUrl ? "Uploaded" : "Not added"}
              </p>
            </div>
            <div className="rounded-[20px] bg-white/72 p-4">
              <p className="text-sm text-charcoal-900/58">Gift moments</p>
              <p className="mt-3 font-display text-3xl text-plum-800">
                {eventSummary?.giftsCount ?? 0}
              </p>
            </div>
          </div>
        </Card>
      </section>
    </DashboardLayout>
  );
}
