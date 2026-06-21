import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { Card } from "@/components/cards/Card";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingState } from "@/components/common/LoadingState";
import { useToast } from "@/components/common/Toast";
import { FormField } from "@/components/forms/FormField";
import { Input } from "@/components/forms/Input";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ApiError } from "@/services/api";
import { walletService } from "@/services/wallet.service";
import { formatNairaFromKobo } from "@/utils/currency";

export function WalletPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [search, setSearch] = useState("");
  const [withdrawalForm, setWithdrawalForm] = useState({
    accountName: "",
    accountNumber: "",
    amountNaira: "",
    bankName: ""
  });

  const walletQuery = useQuery({
    queryFn: () => walletService.getWallet(),
    queryKey: ["wallet"]
  });

  const transactionsQuery = useQuery({
    queryFn: () => walletService.getWalletTransactions(),
    queryKey: ["wallet-transactions"]
  });

  const withdrawalMutation = useMutation({
    mutationFn: () =>
      walletService.createWithdrawalRequest({
        accountName: withdrawalForm.accountName,
        accountNumber: withdrawalForm.accountNumber,
        amountNaira: Number(withdrawalForm.amountNaira),
        bankName: withdrawalForm.bankName
      }),
    onError: (error) => {
      showToast({
        title: "Withdrawal request failed",
        description:
          error instanceof ApiError
            ? error.message
            : "We could not submit the withdrawal request right now.",
        tone: "error"
      });
    },
    onSuccess: async () => {
      setWithdrawalForm({
        accountName: "",
        accountNumber: "",
        amountNaira: "",
        bankName: ""
      });
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      await queryClient.invalidateQueries({ queryKey: ["wallet-transactions"] });
      showToast({
        title: "Withdrawal requested",
        description: "Your funds have been reserved and the request is now pending admin review.",
        tone: "success"
      });
    }
  });

  const wallet = walletQuery.data?.data;
  const transactions = transactionsQuery.data?.data.transactions ?? [];
  const filteredTransactions = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) {
      return transactions;
    }

    return transactions.filter((transaction) =>
      [
        transaction.type,
        transaction.status,
        transaction.description ?? "",
        transaction.giftSenderName ?? ""
      ].some((value) => value.toLowerCase().includes(term))
    );
  }, [search, transactions]);

  return (
    <DashboardLayout
      title="Wallet"
      subtitle="Track available balance, review every money movement, and request withdrawals safely."
    >
      {walletQuery.isLoading || transactionsQuery.isLoading ? (
        <LoadingState label="Opening your wallet and transaction history..." />
      ) : null}

      {walletQuery.isError || transactionsQuery.isError ? (
        <EmptyState
          title="Unable to load wallet"
          description="We could not fetch your wallet details right now."
          actionLabel="Try again"
          onAction={() => {
            void walletQuery.refetch();
            void transactionsQuery.refetch();
          }}
        />
      ) : null}

      {wallet ? (
        <div className="space-y-8">
          <section className="space-y-4">
            <div>
              <h2 className="font-display text-3xl text-charcoal-900">Wallet overview</h2>
              <p className="mt-1 text-sm text-charcoal-900/62">
                Review your available funds, transaction ledger, and withdrawal flow from one clean, easy-to-scan space.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
              <Card
                tone="plum"
                title="Available balance"
                description="The amount currently available after gift credits and any reserved withdrawal requests."
              >
                <p className="font-display text-5xl text-white">
                  {formatNairaFromKobo(wallet.balanceKobo)}
                </p>
                <p className="mt-3 text-sm text-white/76">
                  {
                    wallet.withdrawals.filter((withdrawal) => withdrawal.status === "pending")
                      .length
                  }{" "}
                  pending withdrawal request(s)
                </p>
              </Card>

              <Card
                tone="polaroid"
                title="Request withdrawal"
                description="Funds are reserved at request time to prevent overspending while the admin reviews your request."
              >
                <form
                  className="grid gap-4 sm:grid-cols-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    withdrawalMutation.mutate();
                  }}
                >
                  <FormField label="Bank name">
                    <Input
                      placeholder="Access Bank"
                      value={withdrawalForm.bankName}
                      onChange={(event) =>
                        setWithdrawalForm((current) => ({
                          ...current,
                          bankName: event.target.value
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Account number">
                    <Input
                      placeholder="0123456789"
                      value={withdrawalForm.accountNumber}
                      onChange={(event) =>
                        setWithdrawalForm((current) => ({
                          ...current,
                          accountNumber: event.target.value
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Account name">
                    <Input
                      placeholder="Sharon Isichei"
                      value={withdrawalForm.accountName}
                      onChange={(event) =>
                        setWithdrawalForm((current) => ({
                          ...current,
                          accountName: event.target.value
                        }))
                      }
                    />
                  </FormField>
                  <FormField label="Amount in naira">
                    <Input
                      inputMode="decimal"
                      placeholder="20000"
                      value={withdrawalForm.amountNaira}
                      onChange={(event) =>
                        setWithdrawalForm((current) => ({
                          ...current,
                          amountNaira: event.target.value
                        }))
                      }
                    />
                  </FormField>
                  <div className="sm:col-span-2">
                    <Button disabled={withdrawalMutation.isPending} type="submit">
                      {withdrawalMutation.isPending
                        ? "Submitting request..."
                        : "Request withdrawal"}
                    </Button>
                  </div>
                </form>
              </Card>
            </div>
          </section>

          <section className="space-y-4">
            <section className="rounded-[28px] border border-white/70 bg-white/84 p-5 shadow-card">
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
                <div>
                  <h3 className="font-display text-3xl text-charcoal-900">Wallet ledger</h3>
                  <p className="mt-1 text-sm text-charcoal-900/62">
                    Search by transaction type, sender, description, or status.
                  </p>
                </div>
                <Input
                  placeholder="Search transactions"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </section>

            {!filteredTransactions.length ? (
              <EmptyState
                title={transactions.length ? "No matching transactions" : "No transactions yet"}
                description={
                  transactions.length
                    ? "Try another search term to find the wallet movement you need."
                    : "Gift credits and withdrawal-related wallet movements will appear here."
                }
              />
            ) : (
              <section className="grid gap-4">
                {filteredTransactions.map((transaction, index) => (
                  <Card
                    key={transaction.id}
                    className={index % 2 === 0 ? "bg-white/84" : "bg-cream-50/92"}
                    title={transaction.type.replace(/_/g, " ")}
                    description={transaction.description ?? "Wallet movement"}
                  >
                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
                      <div className="space-y-3 text-sm text-charcoal-900/68">
                        <div className="flex flex-wrap gap-2">
                          <span className="rounded-full bg-plum-800/8 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-plum-800">
                            {transaction.status}
                          </span>
                          {transaction.giftSenderName ? (
                            <span className="rounded-full bg-white/72 px-3 py-1 text-xs font-semibold text-charcoal-900/72">
                              From {transaction.giftSenderName}
                            </span>
                          ) : null}
                        </div>
                        <p>{new Date(transaction.createdAt).toLocaleString()}</p>
                        {transaction.giftId ? <p>Gift reference linked to this wallet entry.</p> : null}
                        {transaction.withdrawalRequestId ? (
                          <p>Withdrawal request reference linked to this ledger item.</p>
                        ) : null}
                      </div>
                      <div className="rounded-[22px] bg-white/72 px-4 py-3 text-right shadow-[0_12px_24px_rgba(67,34,53,0.08)]">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-plum-700">
                          Amount
                        </p>
                        <p className="mt-2 font-display text-3xl text-plum-800">
                          {formatNairaFromKobo(transaction.amountKobo)}
                        </p>
                      </div>
                    </div>
                  </Card>
                ))}
              </section>
            )}
          </section>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
