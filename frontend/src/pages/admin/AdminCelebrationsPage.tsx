import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Card } from "@/components/cards/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Input } from "@/components/forms/Input";
import { adminService } from "@/services/admin.service";

export function AdminCelebrationsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [eventTypeInput, setEventTypeInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedEventType, setAppliedEventType] = useState("");
  const [page, setPage] = useState(1);

  const eventsQuery = useQuery({
    queryFn: () =>
      adminService.getCelebrations({
        eventType: appliedEventType || undefined,
        page,
        pageSize: 12,
        q: appliedSearch || undefined
      }),
    queryKey: ["admin-events", page, appliedSearch, appliedEventType]
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setAppliedEventType(eventTypeInput.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setEventTypeInput("");
    setAppliedSearch("");
    setAppliedEventType("");
    setPage(1);
  }

  const events = eventsQuery.data?.data.events ?? [];
  const pagination = eventsQuery.data?.data.pagination;

  return (
    <AdminLayout
      title="Celebrations"
      subtitle="Review created celebration pages, creator ownership, event types, and participation signals without leaving the admin room."
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by title, celebrant, slug, or owner"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Input
              value={eventTypeInput}
              onChange={(event) => setEventTypeInput(event.target.value)}
              placeholder="Filter by event type"
            />
          }
        />

        {eventsQuery.isLoading ? <LoadingState label="Loading celebrations..." /> : null}

        {eventsQuery.isError ? (
          <EmptyState
            title="Unable to load celebrations"
            description="We could not fetch celebration records right now."
            actionLabel="Try again"
            onAction={() => void eventsQuery.refetch()}
          />
        ) : null}

        {!eventsQuery.isLoading && !eventsQuery.isError && !events.length ? (
          <EmptyState
            title="No celebrations found"
            description="Try a different title, owner, slug, or event type filter."
          />
        ) : null}

        {!!events.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {events.map((event, index) => (
              <Card
                key={event.id}
                tone={index % 3 === 0 ? "polaroid" : "paper"}
                eyebrow={event.eventType}
                title={event.title}
                description={`Celebrant: ${event.celebrantName}`}
              >
                <div className="grid gap-3 text-sm leading-7 text-charcoal-900/72">
                  <p>Owner: <span className="font-semibold text-charcoal-900">{event.owner.name}</span> ({event.owner.email})</p>
                  <p>Event date: {new Date(event.eventDate).toLocaleDateString()}</p>
                  <p>Slug: /events/{event.slug}</p>
                  <p>Wishes: <span className="font-semibold text-charcoal-900">{event.wishesCount}</span></p>
                  <p>Gifts: <span className="font-semibold text-charcoal-900">{event.giftsCount}</span></p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {pagination ? <AdminPagination meta={pagination} onPageChange={setPage} /> : null}
      </div>
    </AdminLayout>
  );
}
