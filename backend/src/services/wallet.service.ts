import { withTransaction } from "../config/db.js";
import { createWalletTransaction } from "../repositories/gift.repository.js";
import type { AuthUser } from "../types/auth.js";
import { AppError } from "../utils/app-error.js";
import {
  adjustWalletBalance,
  createAdminLog,
  createWithdrawalRequest,
  findWalletByUserId,
  findWalletByUserIdForUpdate,
  findWithdrawalRequestByIdForUpdate,
  getWalletTransactionsByUser,
  getWithdrawalRequestsByUser,
  listAdminWithdrawalRequests,
  updateWithdrawalRequest
} from "../repositories/wallet.repository.js";

function nairaToKobo(amountNaira: number) {
  return Math.round(amountNaira * 100);
}

export const walletService = {
  async getWallet(user: AuthUser) {
    const wallet = await findWalletByUserId(user.id);

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }

    const withdrawals = await getWithdrawalRequestsByUser(user.id);

    return {
      balanceKobo: Number(wallet.balance_kobo),
      balanceNaira: Number(wallet.balance_kobo) / 100,
      withdrawals: withdrawals.map((withdrawal) => ({
        accountName: withdrawal.account_name,
        accountNumber: withdrawal.account_number,
        adminNote: withdrawal.admin_note,
        amountKobo: Number(withdrawal.amount_kobo),
        bankName: withdrawal.bank_name,
        createdAt: withdrawal.created_at,
        id: withdrawal.id,
        reviewedAt: withdrawal.reviewed_at,
        status: withdrawal.status
      }))
    };
  },

  async getWalletTransactions(user: AuthUser) {
    const transactions = await getWalletTransactionsByUser(user.id);

    return {
      transactions: transactions.map((transaction) => ({
        amountKobo: Number(transaction.amount_kobo),
        createdAt: transaction.created_at,
        description: transaction.description,
        giftId: transaction.gift_id,
        giftSenderName: transaction.gift_sender_name,
        id: transaction.id,
        status: transaction.status,
        type: transaction.type,
        withdrawalRequestId: transaction.withdrawal_request_id
      }))
    };
  },

  async requestWithdrawal(
    user: AuthUser,
    input: {
      accountName: string;
      accountNumber: string;
      amountNaira: number;
      bankName: string;
    }
  ) {
    const amountKobo = nairaToKobo(input.amountNaira);

    if (amountKobo <= 0) {
      throw new AppError("Withdrawal amount must be greater than zero", 400);
    }

    return withTransaction(async (client) => {
      const wallet = await findWalletByUserIdForUpdate(user.id, client);

      if (!wallet) {
        throw new AppError("Wallet not found", 404);
      }

      if (Number(wallet.balance_kobo) < amountKobo) {
        throw new AppError("Withdrawal amount exceeds available balance", 400);
      }

      await adjustWalletBalance(wallet.id, -amountKobo, client);

      const withdrawal = await createWithdrawalRequest(
        {
          accountName: input.accountName,
          accountNumber: input.accountNumber,
          amountKobo,
          bankName: input.bankName,
          userId: user.id,
          walletId: wallet.id
        },
        client
      );

      await createWalletTransaction(
        {
          amountKobo,
          description: `Reserved for withdrawal to ${input.bankName} (${input.accountNumber})`,
          status: "completed",
          type: "withdrawal_debit",
          walletId: wallet.id,
          withdrawalRequestId: withdrawal.id
        },
        client
      );

      return {
        withdrawal: {
          accountName: withdrawal.account_name,
          accountNumber: withdrawal.account_number,
          adminNote: withdrawal.admin_note,
          amountKobo: Number(withdrawal.amount_kobo),
          bankName: withdrawal.bank_name,
          createdAt: withdrawal.created_at,
          id: withdrawal.id,
          reviewedAt: withdrawal.reviewed_at,
          status: withdrawal.status
        }
      };
    });
  },

  async getAdminWithdrawals(input?: {
    page: number;
    pageSize: number;
    q?: string;
    status?: "all" | "approved" | "cancelled" | "paid" | "pending" | "rejected";
  }) {
    const page = input?.page ?? 1;
    const pageSize = input?.pageSize ?? 12;
    const q = input?.q?.toLowerCase();
    const status = input?.status ?? "all";
    const withdrawals = await listAdminWithdrawalRequests();
    const filtered = withdrawals.filter((withdrawal) => {
      const matchesStatus = status === "all" || withdrawal.status === status;
      const haystack = [
        withdrawal.user_name,
        withdrawal.user_email,
        withdrawal.bank_name,
        withdrawal.account_number,
        withdrawal.account_name ?? "",
        withdrawal.admin_note ?? ""
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = !q || haystack.includes(q);

      return matchesStatus && matchesSearch;
    });
    const start = (page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    return {
      pagination: {
        page,
        pageSize,
        totalItems: filtered.length,
        totalPages: Math.max(1, Math.ceil(filtered.length / pageSize))
      },
      withdrawals: pageRows.map((withdrawal) => ({
        accountName: withdrawal.account_name,
        accountNumber: withdrawal.account_number,
        adminNote: withdrawal.admin_note,
        amountKobo: Number(withdrawal.amount_kobo),
        bankName: withdrawal.bank_name,
        createdAt: withdrawal.created_at,
        id: withdrawal.id,
        reviewedAt: withdrawal.reviewed_at,
        reviewerEmail: withdrawal.reviewer_email,
        reviewerName: withdrawal.reviewer_name,
        status: withdrawal.status,
        user: {
          email: withdrawal.user_email,
          id: withdrawal.user_id,
          name: withdrawal.user_name
        }
      }))
    };
  },

  async approveWithdrawal(
    withdrawalId: string,
    admin: AuthUser,
    input: {
      adminNote?: string;
    }
  ) {
    return withTransaction(async (client) => {
      const withdrawal = await findWithdrawalRequestByIdForUpdate(withdrawalId, client);

      if (!withdrawal) {
        throw new AppError("Withdrawal request not found", 404);
      }

      if (withdrawal.status !== "pending") {
        throw new AppError("Only pending withdrawals can be approved", 400);
      }

      const updated = await updateWithdrawalRequest(
        withdrawalId,
        {
          adminNote: input.adminNote,
          reviewedAt: new Date(),
          reviewedBy: admin.id,
          status: "approved"
        },
        client
      );

      await createAdminLog(
        {
          action: "approve_withdrawal",
          adminId: admin.id,
          description: `Approved withdrawal request ${withdrawalId}${input.adminNote ? `: ${input.adminNote}` : ""}`,
          entityId: withdrawalId,
          entityType: "withdrawal_request"
        },
        client
      );

      return {
        withdrawal: {
          adminNote: updated?.admin_note ?? null,
          id: updated?.id ?? withdrawalId,
          reviewedAt: updated?.reviewed_at ?? null,
          status: updated?.status ?? "approved"
        }
      };
    });
  },

  async rejectWithdrawal(
    withdrawalId: string,
    admin: AuthUser,
    input: {
      adminNote: string;
    }
  ) {
    return withTransaction(async (client) => {
      const withdrawal = await findWithdrawalRequestByIdForUpdate(withdrawalId, client);

      if (!withdrawal) {
        throw new AppError("Withdrawal request not found", 404);
      }

      if (withdrawal.status !== "pending") {
        throw new AppError("Only pending withdrawals can be rejected", 400);
      }

      await adjustWalletBalance(withdrawal.wallet_id, Number(withdrawal.amount_kobo), client);

      await createWalletTransaction(
        {
          amountKobo: Number(withdrawal.amount_kobo),
          description: `Withdrawal request reversed: ${input.adminNote}`,
          status: "completed",
          type: "withdrawal_reversal",
          walletId: withdrawal.wallet_id,
          withdrawalRequestId: withdrawal.id
        },
        client
      );

      const updated = await updateWithdrawalRequest(
        withdrawalId,
        {
          adminNote: input.adminNote,
          reviewedAt: new Date(),
          reviewedBy: admin.id,
          status: "rejected"
        },
        client
      );

      await createAdminLog(
        {
          action: "reject_withdrawal",
          adminId: admin.id,
          description: `Rejected withdrawal request ${withdrawalId}: ${input.adminNote}`,
          entityId: withdrawalId,
          entityType: "withdrawal_request"
        },
        client
      );

      return {
        withdrawal: {
          adminNote: updated?.admin_note ?? input.adminNote,
          id: updated?.id ?? withdrawalId,
          reviewedAt: updated?.reviewed_at ?? null,
          status: updated?.status ?? "rejected"
        }
      };
    });
  }
};
