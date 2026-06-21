import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";
import type {
  GiftRecord,
  WalletRecord,
  WalletTransactionRecord
} from "../types/gift.js";

function getExecutor(client?: DbClient) {
  return client ?? db;
}

export async function createPendingGift(
  input: {
    amountKobo: number;
    eventId: string;
    message?: string | null;
    paystackReference: string;
    platformFeeKobo: number;
    senderEmail?: string | null;
    senderName: string;
    totalChargedKobo: number;
    userId: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const result = await executor.query<GiftRecord>(
    `INSERT INTO gifts (
      event_id,
      user_id,
      sender_name,
      sender_email,
      message,
      amount_kobo,
      platform_fee_kobo,
      total_charged_kobo,
      paystack_reference,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'pending')
    RETURNING
      id,
      event_id,
      user_id,
      sender_name,
      sender_email,
      message,
      amount_kobo::text,
      platform_fee_kobo::text,
      total_charged_kobo::text,
      paystack_reference,
      status,
      created_at,
      verified_at;`,
    [
      input.eventId,
      input.userId,
      input.senderName,
      input.senderEmail ?? null,
      input.message ?? null,
      input.amountKobo,
      input.platformFeeKobo,
      input.totalChargedKobo,
      input.paystackReference
    ]
  );

  return result.rows[0];
}

export async function findGiftByReference(reference: string, client?: DbClient) {
  const executor = getExecutor(client);
  const result = await executor.query<GiftRecord>(
    `SELECT
      id,
      event_id,
      user_id,
      sender_name,
      sender_email,
      message,
      amount_kobo::text,
      platform_fee_kobo::text,
      total_charged_kobo::text,
      paystack_reference,
      status,
      created_at,
      verified_at
     FROM gifts
     WHERE paystack_reference = $1
     LIMIT 1;`,
    [reference]
  );

  return result.rows[0] ?? null;
}

export async function findGiftByReferenceForUpdate(reference: string, client: DbClient) {
  const result = await client.query<GiftRecord>(
    `SELECT
      id,
      event_id,
      user_id,
      sender_name,
      sender_email,
      message,
      amount_kobo::text,
      platform_fee_kobo::text,
      total_charged_kobo::text,
      paystack_reference,
      status,
      created_at,
      verified_at
     FROM gifts
     WHERE paystack_reference = $1
     LIMIT 1
     FOR UPDATE;`,
    [reference]
  );

  return result.rows[0] ?? null;
}

export async function updateGiftStatus(
  giftId: string,
  input: {
    status: string;
    verifiedAt?: Date | null;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);
  const result = await executor.query<GiftRecord>(
    `UPDATE gifts
     SET status = $2, verified_at = $3
     WHERE id = $1
     RETURNING
      id,
      event_id,
      user_id,
      sender_name,
      sender_email,
      message,
      amount_kobo::text,
      platform_fee_kobo::text,
      total_charged_kobo::text,
      paystack_reference,
      status,
      created_at,
      verified_at;`,
    [giftId, input.status, input.verifiedAt ?? null]
  );

  return result.rows[0] ?? null;
}

export async function findWalletByUserId(userId: string, client?: DbClient) {
  const executor = getExecutor(client);
  const result = await executor.query<WalletRecord>(
    `SELECT id, user_id, balance_kobo::text, created_at, updated_at
     FROM wallets
     WHERE user_id = $1
     LIMIT 1;`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function findWalletByUserIdForUpdate(userId: string, client: DbClient) {
  const result = await client.query<WalletRecord>(
    `SELECT id, user_id, balance_kobo::text, created_at, updated_at
     FROM wallets
     WHERE user_id = $1
     LIMIT 1
     FOR UPDATE;`,
    [userId]
  );

  return result.rows[0] ?? null;
}

export async function incrementWalletBalance(
  walletId: string,
  amountKobo: number,
  client: DbClient
) {
  const result = await client.query<WalletRecord>(
    `UPDATE wallets
     SET balance_kobo = balance_kobo + $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, balance_kobo::text, created_at, updated_at;`,
    [walletId, amountKobo]
  );

  return result.rows[0] ?? null;
}

export async function findWalletTransactionByGiftId(giftId: string, client?: DbClient) {
  const executor = getExecutor(client);
  const result = await executor.query<WalletTransactionRecord>(
    `SELECT
      id,
      wallet_id,
      gift_id,
      withdrawal_request_id,
      type,
      amount_kobo::text,
      status,
      description,
      created_at
     FROM wallet_transactions
     WHERE gift_id = $1
     LIMIT 1;`,
    [giftId]
  );

  return result.rows[0] ?? null;
}

export async function createWalletTransaction(
  input: {
    amountKobo: number;
    description: string;
    giftId?: string | null;
    status?: string;
    type:
      | "gift_credit"
      | "withdrawal_debit"
      | "withdrawal_reversal"
      | "admin_adjustment";
    walletId: string;
    withdrawalRequestId?: string | null;
  },
  client: DbClient
) {
  const result = await client.query<WalletTransactionRecord>(
    `INSERT INTO wallet_transactions (
      wallet_id,
      gift_id,
      withdrawal_request_id,
      type,
      amount_kobo,
      status,
      description
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      wallet_id,
      gift_id,
      withdrawal_request_id,
      type,
      amount_kobo::text,
      status,
      description,
      created_at;`,
    [
      input.walletId,
      input.giftId ?? null,
      input.withdrawalRequestId ?? null,
      input.type,
      input.amountKobo,
      input.status ?? "completed",
      input.description
    ]
  );

  return result.rows[0];
}
