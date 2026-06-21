import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

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

export function WithdrawalRequestPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    accountName: "",
    accountNumber: "",
    amountNaira: "",
    bankName: ""
  });
  const walletQuery = useQuery({
    queryFn: () => walletService.getWallet(),
    queryKey: ["wallet"]
  });
  const withdrawalMutation = useMutation({
    mutationFn: () =>
      walletService.createWithdrawalRequest({
        accountName: form.accountName,
        accountNumber: form.accountNumber,
        amountNaira: Number(form.amountNaira),
        bankName: form.bankName
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
      setForm({
        accountName: "",
        accountNumber: "",
        amountNaira: "",
        bankName: ""
      });
      await queryClient.invalidateQueries({ queryKey: ["wallet"] });
      showToast({
        title: "Withdrawal requested",
        description: "Your request is now pending admin review.",
        tone: "success"
      });
    }
  });

  const wallet = walletQuery.data?.data;

  return (
    <DashboardLayout
      title="Withdrawal request"
      subtitle="Request funds safely with a focused form, clear balance visibility, and a quick view of pending payout states."
      actions={
        <Button variant="secondary" onClick={() => navigate("/wallet")}>
          Back to wallet
        </Button>
      }
    >
      {walletQuery.isLoading ? <LoadingState label="Preparing your withdrawal form..." /> : null}

      {walletQuery.isError ? (
        <EmptyState
          title="Unable to load withdrawal page"
          description="We could not fetch your wallet details right now."
          actionLabel="Try again"
          onAction={() => void walletQuery.refetch()}
        />
      ) : null}

      {wallet ? (
        <div className="grid gap-4 xl:grid-cols-[0.85fr_1.15fr]">
          <Card
            tone="plum"
            title="Available balance"
            description="Withdrawals should never exceed the amount currently available in your wallet."
          >
            <p className="font-display text-5xl text-white">
              {formatNairaFromKobo(wallet.balanceKobo)}
            </p>
            <div className="mt-5 rounded-[22px] bg-white/10 p-4 text-sm text-white/76">
              Pending requests:{" "}
              {wallet.withdrawals.filter((withdrawal) => withdrawal.status === "pending").length}
            </div>
          </Card>

          <Card
            title="Bank payout details"
            description="Enter the destination details carefully so the review process stays smooth and trustworthy."
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
                  value={form.bankName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, bankName: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Account number">
                <Input
                  placeholder="0123456789"
                  value={form.accountNumber}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      accountNumber: event.target.value
                    }))
                  }
                />
              </FormField>
              <FormField label="Account name">
                <Input
                  placeholder="Sharon Isichei"
                  value={form.accountName}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, accountName: event.target.value }))
                  }
                />
              </FormField>
              <FormField label="Amount in naira">
                <Input
                  inputMode="decimal"
                  placeholder="20000"
                  value={form.amountNaira}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, amountNaira: event.target.value }))
                  }
                />
              </FormField>
              <div className="sm:col-span-2 flex flex-wrap gap-3">
                <Button disabled={withdrawalMutation.isPending} type="submit">
                  {withdrawalMutation.isPending ? "Submitting request..." : "Request withdrawal"}
                </Button>
                <Button variant="ghost" onClick={() => navigate("/wallet/transactions")}>
                  View transaction history
                </Button>
              </div>
            </form>
          </Card>
        </div>
      ) : null}
    </DashboardLayout>
  );
}
