import { apiClient } from "./api";
import type { AdminPagination } from "../types/admin";
import type { AdminWithdrawal, WalletSummary, WalletTransaction } from "../types/wallet";

export const walletService = {
  getWallet() {
    return apiClient.get<{
      success: true;
      message: string;
      data: WalletSummary;
    }>("/wallet");
  },
  getWalletTransactions() {
    return apiClient.get<{
      success: true;
      message: string;
      data: {
        transactions: WalletTransaction[];
      };
    }>("/wallet/transactions");
  },
  createWithdrawalRequest(input: {
    accountName: string;
    accountNumber: string;
    amountNaira: number;
    bankName: string;
  }) {
    return apiClient.post<{
      success: true;
      message: string;
      data: {
        withdrawal: WalletSummary["withdrawals"][number];
      };
    }>("/wallet/withdrawals", input);
  },
  getAdminWithdrawals(input?: {
    page?: number;
    pageSize?: number;
    q?: string;
    status?: "all" | "pending" | "approved" | "rejected" | "paid" | "cancelled";
  }) {
    const searchParams = new URLSearchParams();

    if (input?.page) {
      searchParams.set("page", String(input.page));
    }

    if (input?.pageSize) {
      searchParams.set("pageSize", String(input.pageSize));
    }

    if (input?.q) {
      searchParams.set("q", input.q);
    }

    if (input?.status) {
      searchParams.set("status", input.status);
    }

    const queryString = searchParams.toString();

    return apiClient.get<{
      success: true;
      message: string;
      data: {
        pagination: AdminPagination;
        withdrawals: AdminWithdrawal[];
      };
    }>(`/admin/withdrawals${queryString ? `?${queryString}` : ""}`);
  },
  approveWithdrawal(withdrawalId: string, input?: { adminNote?: string }) {
    return apiClient.patch<{
      success: true;
      message: string;
      data: {
        withdrawal: {
          adminNote: string | null;
          id: string;
          reviewedAt: string | null;
          status: string;
        };
      };
    }>(`/admin/withdrawals/${withdrawalId}/approve`, input ?? {});
  },
  rejectWithdrawal(withdrawalId: string, input: { adminNote: string }) {
    return apiClient.patch<{
      success: true;
      message: string;
      data: {
        withdrawal: {
          adminNote: string | null;
          id: string;
          reviewedAt: string | null;
          status: string;
        };
      };
    }>(`/admin/withdrawals/${withdrawalId}/reject`, input);
  }
};
