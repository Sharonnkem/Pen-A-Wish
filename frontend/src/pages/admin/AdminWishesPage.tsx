import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminConfirmationModal } from "@/components/admin/AdminConfirmationModal";
import { AdminFilterBar } from "@/components/admin/AdminFilterBar";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AdminPagination } from "@/components/admin/AdminPagination";
import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useToast } from "@/components/common/Toast";
import { Select, SelectOption } from "@/components/forms/Select";
import { ApiError } from "@/services/api";
import { adminService } from "@/services/admin.service";

export function AdminWishesPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [visibility, setVisibility] = useState<"all" | "hidden" | "visible">("all");
  const [page, setPage] = useState(1);
  const [wishToDelete, setWishToDelete] = useState<{ id: string; senderName: string } | null>(null);

  const wishesQuery = useQuery({
    queryFn: () =>
      adminService.getWishes({
        page,
        pageSize: 12,
        q: appliedSearch || undefined,
        visibility
      }),
    queryKey: ["admin-wishes", page, appliedSearch, visibility]
  });

  const deleteMutation = useMutation({
    mutationFn: (wishId: string) => adminService.deleteWish(wishId),
    onError: (error) => {
      showToast({
        title: "Wish deletion failed",
        description:
          error instanceof ApiError ? error.message : "We could not remove this wish right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-wishes"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      showToast({
        title: "Wish removed",
        description: "The spam wish was deleted and the admin action was logged.",
        tone: "success"
      });
      setWishToDelete(null);
    }
  });

  function applyFilters(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAppliedSearch(searchInput.trim());
    setPage(1);
  }

  function resetFilters() {
    setSearchInput("");
    setAppliedSearch("");
    setVisibility("all");
    setPage(1);
  }

  const wishes = wishesQuery.data?.data.wishes ?? [];
  const pagination = wishesQuery.data?.data.pagination;

  return (
    <AdminLayout
      title="Wish moderation"
      subtitle="Review public wishes, spot suspicious or low-quality submissions, and remove obvious spam with a recorded admin action."
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by sender, email, message, or celebration"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Select
              value={visibility}
              onChange={(event) => setVisibility(event.target.value as typeof visibility)}
            >
              <SelectOption value="all">All wishes</SelectOption>
              <SelectOption value="visible">Visible only</SelectOption>
              <SelectOption value="hidden">Hidden only</SelectOption>
            </Select>
          }
        />

        {wishesQuery.isLoading ? <LoadingState label="Loading wishes..." /> : null}

        {wishesQuery.isError ? (
          <EmptyState
            title="Unable to load wishes"
            description="We could not fetch the admin wish queue right now."
            actionLabel="Try again"
            onAction={() => void wishesQuery.refetch()}
          />
        ) : null}

        {!wishesQuery.isLoading && !wishesQuery.isError && !wishes.length ? (
          <EmptyState
            title="No wishes found"
            description="Try a different moderation filter or search phrase."
          />
        ) : null}

        {!!wishes.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {wishes.map((wish, index) => (
              <Card
                key={wish.id}
                tone={wish.isHidden ? "paper" : "polaroid"}
                className={index % 2 === 0 ? "rotate-[-1deg]" : "rotate-[1deg]"}
                eyebrow={wish.isHidden ? "Hidden" : "Visible"}
                title={wish.senderName}
                description={wish.event.title}
                footer={
                  <Button
                    onClick={() => setWishToDelete({ id: wish.id, senderName: wish.senderName })}
                  >
                    Delete spam wish
                  </Button>
                }
              >
                <div className="space-y-3 text-sm leading-7 text-charcoal-900/72">
                  <p>{wish.message}</p>
                  <p>
                    Sender email: {wish.senderEmail ?? "Not provided"}
                  </p>
                  <p>
                    Celebration link: /events/{wish.event.slug}
                  </p>
                  <p>Submitted {new Date(wish.createdAt).toLocaleString()}</p>
                </div>
              </Card>
            ))}
          </div>
        ) : null}

        {pagination ? <AdminPagination meta={pagination} onPageChange={setPage} /> : null}

        <AdminConfirmationModal
          isOpen={Boolean(wishToDelete)}
          onClose={() => setWishToDelete(null)}
          onConfirm={() => {
            if (wishToDelete) {
              deleteMutation.mutate(wishToDelete.id);
            }
          }}
          isBusy={deleteMutation.isPending}
          title="Delete spam wish"
          description={`Remove ${wishToDelete?.senderName ?? "this wish"} from the platform? This is intended for clear spam or harmful content.`}
          confirmLabel="Delete wish"
        />
      </div>
    </AdminLayout>
  );
}
