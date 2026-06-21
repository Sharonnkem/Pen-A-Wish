export type GiftRecord = {
  amount_kobo: string;
  created_at: Date;
  event_id: string;
  id: string;
  message: string | null;
  paystack_reference: string;
  platform_fee_kobo: string;
  sender_email: string | null;
  sender_name: string;
  status: string;
  total_charged_kobo: string;
  user_id: string;
  verified_at: Date | null;
};

export type WalletRecord = {
  balance_kobo: string;
  created_at: Date;
  id: string;
  updated_at: Date;
  user_id: string;
};

export type WalletTransactionRecord = {
  amount_kobo: string;
  created_at: Date;
  description: string | null;
  gift_id: string | null;
  id: string;
  status: string;
  type: string;
  wallet_id: string;
  withdrawal_request_id: string | null;
};
