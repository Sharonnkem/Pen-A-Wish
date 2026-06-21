import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminFilterBar } from "../../components/admin/AdminFilterBar";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { Card } from "../../components/cards/Card";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { Select, SelectOption } from "../../components/forms/Select";
import { adminService } from "../../services/admin.service";

export function AdminReportsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "reviewed" | "resolved">("all");
  const [page, setPage] = useState(1);

  const reportsQuery = useQuery({
    queryFn: () =>
      adminService.getReports({
        page,
        pageSize: 12,
        q: appliedSearch || undefined,
        status
      }),
    queryKey: ["admin-reports", page, appliedSearch, status]
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setStatus("all");
    setPage(1);
  }

  const reports = reportsQuery.data?.data.reports ?? [];
  const pagination = reportsQuery.data?.data.pagination;

  return (
    <AdminLayout
      title="Reports"
      subtitle="Review reported records and keep a clear line of sight on open moderation work across celebrations, wishes, and guestbook entries."
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by reason, celebration title, or wish message"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <SelectOption value="all">All statuses</SelectOption>
              <SelectOption value="open">Open</SelectOption>
              <SelectOption value="reviewed">Reviewed</SelectOption>
              <SelectOption value="resolved">Resolved</SelectOption>
            </Select>
          }
        />

        {reportsQuery.isLoading ? <LoadingState label="Loading reports..." /> : null}

        {reportsQuery.isError ? (
          <EmptyState
            title="Unable to load reports"
            description="We could not fetch reports right now."
            actionLabel="Try again"
            onAction={() => void reportsQuery.refetch()}
          />
        ) : null}

        {!reportsQuery.isLoading && !reportsQuery.isError && !reports.length ? (
          <EmptyState
            title="No reports found"
            description="Try a different status filter or search phrase."
          />
        ) : null}

        {!!reports.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {reports.map((report, index) => (
              <Card
                key={report.id}
                tone={report.status === "open" ? "polaroid" : "paper"}
                className={index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}
                eyebrow={report.status}
                title={report.event?.title ?? "Unlinked report"}
                description={report.reason}
              >
                <div className="space-y-3 text-sm leading-7 text-charcoal-900/72">
                  {report.wish ? <p>Wish excerpt: {report.wish.message ?? "Unavailable"}</p> : null}
                  {report.guestbookEntryId ? <p>Guestbook entry ID: {report.guestbookEntryId}</p> : null}
                  <p>Created {new Date(report.createdAt).toLocaleString()}</p>
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
