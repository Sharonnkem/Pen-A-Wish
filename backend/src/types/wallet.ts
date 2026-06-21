export type WithdrawalRequestRecord = {
  account_name: string | null;
  account_number: string;
  admin_note: string | null;
  amount_kobo: string;
  bank_name: string;
  created_at: Date;
  id: string;
  reviewed_at: Date | null;
  reviewed_by: string | null;
  status: string;
  user_id: string;
  wallet_id: string;
};

export type WalletTransactionHistoryRecord = {
  amount_kobo: string;
  created_at: Date;
  description: string | null;
  gift_id: string | null;
  gift_sender_name: string | null;
  id: string;
  status: string;
  type: string;
  withdrawal_request_id: string | null;
};

export type AdminWithdrawalRecord = WithdrawalRequestRecord & {
  reviewer_email: string | null;
  reviewer_name: string | null;
  user_email: string;
  user_name: string;
};

export type AdminLogRecord = {
  action: string;
  admin_id: string | null;
  created_at: Date;
  description: string | null;
  entity_id: string | null;
  entity_type: string | null;
  id: string;
};
