import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";

import { Card } from "../../components/cards/Card";
import { Button } from "../../components/common/Button";
import { EmptyState } from "../../components/common/EmptyState";
import { LoadingState } from "../../components/common/LoadingState";
import { Input } from "../../components/forms/Input";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { walletService } from "../../services/wallet.service";
import { formatNairaFromKobo } from "../../utils/currency";

export function TransactionHistoryPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const transactionsQuery = useQuery({
    queryFn: () => walletService.getWalletTransactions(),
    queryKey: ["wallet-transactions"]
  });

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
      title="Transaction history"
      subtitle="Review every wallet movement in a clean ledger view that stays readable on desktop, tablet, and mobile web."
      actions={
        <>
          <Button variant="secondary" onClick={() => navigate("/wallet")}>
            Back to wallet
          </Button>
          <Button onClick={() => navigate("/wallet/withdrawals")}>Request withdrawal</Button>
        </>
      }
    >
      <section className="rounded-[28px] border border-white/70 bg-white/84 p-5 shadow-card">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-end">
          <div>
            <h2 className="font-display text-3xl text-charcoal-900">Wallet ledger</h2>
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

      {transactionsQuery.isLoading ? <LoadingState label="Opening transaction history..." /> : null}

      {transactionsQuery.isError ? (
        <EmptyState
          title="Unable to load transaction history"
          description="We could not fetch your wallet ledger right now."
          actionLabel="Try again"
          onAction={() => void transactionsQuery.refetch()}
        />
      ) : null}

      {!transactionsQuery.isLoading && !transactionsQuery.isError && !filteredTransactions.length ? (
        <EmptyState
          title={transactions.length ? "No matching transactions" : "No transactions yet"}
          description={
            transactions.length
              ? "Try another search term to find the wallet movement you need."
              : "Gift credits and withdrawal-related wallet movements will appear here."
          }
        />
      ) : null}

      {filteredTransactions.length ? (
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
      ) : null}
    </DashboardLayout>
  );
}
