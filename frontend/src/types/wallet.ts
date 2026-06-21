export type WithdrawalStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "paid"
  | "cancelled";

export type WalletWithdrawal = {
  accountName: string | null;
  accountNumber: string;
  adminNote: string | null;
  amountKobo: number;
  bankName: string;
  createdAt: string;
  id: string;
  reviewedAt: string | null;
  status: WithdrawalStatus;
};

export type WalletTransaction = {
  amountKobo: number;
  createdAt: string;
  description: string | null;
  giftId: string | null;
  giftSenderName: string | null;
  id: string;
  status: string;
  type: string;
  withdrawalRequestId: string | null;
};

export type WalletSummary = {
  balanceKobo: number;
  balanceNaira: number;
  withdrawals: WalletWithdrawal[];
};

export type AdminWithdrawal = WalletWithdrawal & {
  reviewerEmail: string | null;
  reviewerName: string | null;
  user: {
    email: string;
    id: string;
    name: string;
  };
};
