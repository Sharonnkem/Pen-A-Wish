import { useQuery } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Card } from "@/components/cards/Card";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { Select, SelectOption } from "@/components/forms/Select";
import { adminService } from "@/services/admin.service";
import { formatNairaFromKobo } from "@/utils/currency";

export function AdminGiftsPage() {
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<"all" | "pending" | "success" | "failed">("all");
  const [page, setPage] = useState(1);

  const giftsQuery = useQuery({
    queryFn: () =>
      adminService.getGifts({
        page,
        pageSize: 12,
        q: appliedSearch || undefined,
        status
      }),
    queryKey: ["admin-gifts", page, appliedSearch, status]
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

  const gifts = giftsQuery.data?.data.gifts ?? [];
  const pagination = giftsQuery.data?.data.pagination;

  return (
    <AdminLayout
      title="Gift transactions"
      subtitle="Inspect monetary gifts, checkout references, fees, and recipient ownership with enough detail to spot anomalies quickly."
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by sender, recipient, celebration, note, or reference"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <SelectOption value="all">All statuses</SelectOption>
              <SelectOption value="pending">Pending</SelectOption>
              <SelectOption value="success">Success</SelectOption>
              <SelectOption value="failed">Failed</SelectOption>
            </Select>
          }
        />

        {giftsQuery.isLoading ? <LoadingState label="Loading gift transactions..." /> : null}

        {giftsQuery.isError ? (
          <EmptyState
            title="Unable to load gift transactions"
            description="We could not fetch admin gift records right now."
            actionLabel="Try again"
            onAction={() => void giftsQuery.refetch()}
          />
        ) : null}

        {!giftsQuery.isLoading && !giftsQuery.isError && !gifts.length ? (
          <EmptyState
            title="No gift transactions found"
            description="Try a different status filter or search phrase."
          />
        ) : null}

        {!!gifts.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {gifts.map((gift) => (
              <Card
                key={gift.id}
                tone={gift.status === "success" ? "polaroid" : "paper"}
                eyebrow={gift.status}
                title={gift.senderName}
                description={gift.event.title}
              >
                <div className="space-y-3 text-sm leading-7 text-charcoal-900/72">
                  <p>
                    Amount: <span className="font-semibold text-charcoal-900">{formatNairaFromKobo(gift.amountKobo)}</span>
                  </p>
                  <p>
                    Fee: <span className="font-semibold text-charcoal-900">{formatNairaFromKobo(gift.platformFeeKobo)}</span>
                  </p>
                  <p>
                    Total charged: <span className="font-semibold text-charcoal-900">{formatNairaFromKobo(gift.totalChargedKobo)}</span>
                  </p>
                  <p>Recipient: {gift.user.name} ({gift.user.email})</p>
                  <p>Reference: {gift.paystackReference}</p>
                  {gift.message ? <p>Message: {gift.message}</p> : null}
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
