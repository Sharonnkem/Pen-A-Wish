import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";

import { AdminConfirmationModal } from "../../components/admin/AdminConfirmationModal";
import { AdminFilterBar } from "../../components/admin/AdminFilterBar";
import { AdminLayout } from "../../components/admin/AdminLayout";
import { AdminPagination } from "../../components/admin/AdminPagination";
import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { useToast } from "../../components/common/Toast";
import { FormField } from "../../components/forms/FormField";
import { Select, SelectOption } from "../../components/forms/Select";
import { Textarea } from "../../components/forms/Textarea";
import { ApiError } from "../../services/api";
import { adminService } from "../../services/admin.service";
import { walletService } from "../../services/wallet.service";
import { formatNairaFromKobo } from "../../utils/currency";

export function AdminWithdrawalsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [status, setStatus] = useState<
    "all" | "pending" | "approved" | "rejected" | "paid" | "cancelled"
  >("all");
  const [page, setPage] = useState(1);
  const [decision, setDecision] = useState<{
    action: "approve" | "reject";
    id: string;
    userName: string;
  } | null>(null);

  const withdrawalsQuery = useQuery({
    queryFn: () =>
      adminService.getWithdrawals({
        page,
        pageSize: 12,
        q: appliedSearch || undefined,
        status
      }),
    queryKey: ["admin-withdrawals", page, appliedSearch, status]
  });

  const approveMutation = useMutation({
    mutationFn: (input: { adminNote?: string; id: string }) =>
      walletService.approveWithdrawal(input.id, {
        adminNote: input.adminNote
      }),
    onError: (error) => {
      showToast({
        title: "Approval failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not approve this withdrawal right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      showToast({
        title: "Withdrawal approved",
        description: "The request status was updated and the admin action was logged.",
        tone: "success"
      });
      setDecision(null);
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (input: { adminNote: string; id: string }) =>
      walletService.rejectWithdrawal(input.id, {
        adminNote: input.adminNote
      }),
    onError: (error) => {
      showToast({
        title: "Rejection failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not reject this withdrawal right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-withdrawals"] });
      await queryClient.invalidateQueries({ queryKey: ["admin-metrics"] });
      showToast({
        title: "Withdrawal rejected",
        description: "Reserved funds were restored and the admin action was logged.",
        tone: "success"
      });
      setDecision(null);
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
    setStatus("all");
    setPage(1);
  }

  const withdrawals = withdrawalsQuery.data?.data.withdrawals ?? [];
  const pagination = withdrawalsQuery.data?.data.pagination;

  function handleConfirmDecision() {
    if (!decision) {
      return;
    }

    const adminNote = adminNotes[decision.id] ?? "";

    if (decision.action === "approve") {
      approveMutation.mutate({
        adminNote: adminNote || undefined,
        id: decision.id
      });
      return;
    }

    rejectMutation.mutate({
      adminNote,
      id: decision.id
    });
  }

  return (
    <AdminLayout
      title="Withdrawal review"
      subtitle="Review money-out requests with clear search tools, status filters, and confirmation steps before funds are approved or reversed."
      actions={
        <Button variant="secondary" onClick={() => void withdrawalsQuery.refetch()}>
          Refresh requests
        </Button>
      }
    >
      <div className="space-y-6">
        <AdminFilterBar
          onSubmit={applyFilters}
          onReset={resetFilters}
          searchPlaceholder="Search by user, bank, account number, or admin note"
          searchValue={searchInput}
          setSearchValue={setSearchInput}
          trailing={
            <Select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
              <SelectOption value="all">All statuses</SelectOption>
              <SelectOption value="pending">Pending</SelectOption>
              <SelectOption value="approved">Approved</SelectOption>
              <SelectOption value="rejected">Rejected</SelectOption>
              <SelectOption value="paid">Paid</SelectOption>
              <SelectOption value="cancelled">Cancelled</SelectOption>
            </Select>
          }
        />

        {withdrawalsQuery.isLoading ? (
          <LoadingState label="Loading withdrawal requests..." />
        ) : null}

        {withdrawalsQuery.isError ? (
          <EmptyState
            title="Unable to load withdrawals"
            description="We could not fetch the withdrawal review queue right now."
            actionLabel="Try again"
            onAction={() => void withdrawalsQuery.refetch()}
          />
        ) : null}

        {!withdrawalsQuery.isLoading && !withdrawalsQuery.isError && !withdrawals.length ? (
          <EmptyState
            title="No withdrawal requests"
            description="New withdrawal requests will appear here for review."
          />
        ) : null}

        {!withdrawalsQuery.isLoading && !withdrawalsQuery.isError && withdrawals.length ? (
          <div className="grid gap-5 lg:grid-cols-2">
            {withdrawals.map((withdrawal) => {
              const adminNote = adminNotes[withdrawal.id] ?? withdrawal.adminNote ?? "";
              const isPending = withdrawal.status === "pending";

              return (
                <Card
                  key={withdrawal.id}
                  tone={withdrawal.status === "pending" ? "polaroid" : "paper"}
                  eyebrow={`Status: ${withdrawal.status}`}
                  title={withdrawal.user.name}
                  description={`${withdrawal.bankName} / ${withdrawal.accountNumber}`}
                  footer={
                    isPending ? (
                      <div className="flex flex-wrap gap-3">
                        <Button
                          variant="secondary"
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          onClick={() =>
                            setDecision({
                              action: "approve",
                              id: withdrawal.id,
                              userName: withdrawal.user.name
                            })
                          }
                        >
                          Approve
                        </Button>
                        <Button
                          disabled={
                            approveMutation.isPending ||
                            rejectMutation.isPending ||
                            adminNote.trim().length < 3
                          }
                          onClick={() =>
                            setDecision({
                              action: "reject",
                              id: withdrawal.id,
                              userName: withdrawal.user.name
                            })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    ) : null
                  }
                >
                  <div className="space-y-4 text-sm text-charcoal-900/68">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-plum-800">
                          {formatNairaFromKobo(withdrawal.amountKobo)}
                        </p>
                        <p className="mt-1">{withdrawal.user.email}</p>
                      </div>
                      <p>{new Date(withdrawal.createdAt).toLocaleString()}</p>
                    </div>

                    <FormField
                      label="Admin note"
                      helperText="Required for rejection. Optional for approval."
                    >
                      <Textarea
                        rows={4}
                        placeholder="Invalid bank details"
                        value={adminNote}
                        onChange={(event) =>
                          setAdminNotes((current) => ({
                            ...current,
                            [withdrawal.id]: event.target.value
                          }))
                        }
                      />
                    </FormField>

                    {withdrawal.reviewedAt ? (
                      <div className="rounded-[18px] bg-white/74 px-4 py-3">
                        <p>
                          Reviewed {new Date(withdrawal.reviewedAt).toLocaleString()}
                        </p>
                        {withdrawal.reviewerName ? (
                          <p className="mt-1">
                            By {withdrawal.reviewerName}
                            {withdrawal.reviewerEmail ? ` (${withdrawal.reviewerEmail})` : ""}
                          </p>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
                </Card>
              );
            })}
          </div>
        ) : null}

        {pagination ? <AdminPagination meta={pagination} onPageChange={setPage} /> : null}

        <AdminConfirmationModal
          isOpen={Boolean(decision)}
          onClose={() => setDecision(null)}
          onConfirm={handleConfirmDecision}
          isBusy={approveMutation.isPending || rejectMutation.isPending}
          title={
            decision?.action === "reject"
              ? "Reject withdrawal request"
              : "Approve withdrawal request"
          }
          description={
            decision?.action === "reject"
              ? `Reject the withdrawal request from ${decision?.userName ?? "this user"}? The reserved wallet amount will be restored.`
              : `Approve the withdrawal request from ${decision?.userName ?? "this user"}?`
          }
          confirmLabel={decision?.action === "reject" ? "Reject request" : "Approve request"}
        />
      </div>
    </AdminLayout>
  );
}
