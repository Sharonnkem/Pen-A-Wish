import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";
import type { WalletRecord } from "../types/gift.js";
import type {
  AdminLogRecord,
  AdminWithdrawalRecord,
  WalletTransactionHistoryRecord,
  WithdrawalRequestRecord
} from "../types/wallet.js";

function getExecutor(client?: DbClient) {
  return client ?? db;
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

export async function adjustWalletBalance(
  walletId: string,
  amountDeltaKobo: number,
  client: DbClient
) {
  const result = await client.query<WalletRecord>(
    `UPDATE wallets
     SET balance_kobo = balance_kobo + $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, user_id, balance_kobo::text, created_at, updated_at;`,
    [walletId, amountDeltaKobo]
  );

  return result.rows[0] ?? null;
}

export async function createWithdrawalRequest(
  input: {
    accountName?: string | null;
    accountNumber: string;
    amountKobo: number;
    bankName: string;
    userId: string;
    walletId: string;
  },
  client: DbClient
) {
  const result = await client.query<WithdrawalRequestRecord>(
    `INSERT INTO withdrawal_requests (
      user_id,
      wallet_id,
      amount_kobo,
      bank_name,
      account_number,
      account_name,
      status
    )
    VALUES ($1, $2, $3, $4, $5, $6, 'pending')
    RETURNING
      id,
      user_id,
      wallet_id,
      amount_kobo::text,
      bank_name,
      account_number,
      account_name,
      status,
      admin_note,
      reviewed_by,
      created_at,
      reviewed_at;`,
    [
      input.userId,
      input.walletId,
      input.amountKobo,
      input.bankName,
      input.accountNumber,
      input.accountName ?? null
    ]
  );

  return result.rows[0];
}

export async function getWithdrawalRequestsByUser(userId: string) {
  const result = await query<WithdrawalRequestRecord>(
    `SELECT
      id,
      user_id,
      wallet_id,
      amount_kobo::text,
      bank_name,
      account_number,
      account_name,
      status,
      admin_note,
      reviewed_by,
      created_at,
      reviewed_at
     FROM withdrawal_requests
     WHERE user_id = $1
     ORDER BY created_at DESC;`,
    [userId]
  );

  return result.rows;
}

export async function findWithdrawalRequestById(withdrawalId: string, client?: DbClient) {
  const executor = getExecutor(client);
  const result = await executor.query<WithdrawalRequestRecord>(
    `SELECT
      id,
      user_id,
      wallet_id,
      amount_kobo::text,
      bank_name,
      account_number,
      account_name,
      status,
      admin_note,
      reviewed_by,
      created_at,
      reviewed_at
     FROM withdrawal_requests
     WHERE id = $1
     LIMIT 1;`,
    [withdrawalId]
  );

  return result.rows[0] ?? null;
}

export async function findWithdrawalRequestByIdForUpdate(
  withdrawalId: string,
  client: DbClient
) {
  const result = await client.query<WithdrawalRequestRecord>(
    `SELECT
      id,
      user_id,
      wallet_id,
      amount_kobo::text,
      bank_name,
      account_number,
      account_name,
      status,
      admin_note,
      reviewed_by,
      created_at,
      reviewed_at
     FROM withdrawal_requests
     WHERE id = $1
     LIMIT 1
     FOR UPDATE;`,
    [withdrawalId]
  );

  return result.rows[0] ?? null;
}

export async function updateWithdrawalRequest(
  withdrawalId: string,
  input: {
    adminNote?: string | null;
    reviewedBy?: string | null;
    reviewedAt?: Date | null;
    status: string;
  },
  client: DbClient
) {
  const result = await client.query<WithdrawalRequestRecord>(
    `UPDATE withdrawal_requests
     SET
       status = $2,
       admin_note = $3,
       reviewed_by = $4,
       reviewed_at = $5
     WHERE id = $1
     RETURNING
      id,
      user_id,
      wallet_id,
      amount_kobo::text,
      bank_name,
      account_number,
      account_name,
      status,
      admin_note,
      reviewed_by,
      created_at,
      reviewed_at;`,
    [
      withdrawalId,
      input.status,
      input.adminNote ?? null,
      input.reviewedBy ?? null,
      input.reviewedAt ?? null
    ]
  );

  return result.rows[0] ?? null;
}

export async function getWalletTransactionsByUser(userId: string) {
  const result = await query<WalletTransactionHistoryRecord>(
    `SELECT
      wt.id,
      wt.gift_id,
      wt.withdrawal_request_id,
      wt.type,
      wt.amount_kobo::text,
      wt.status,
      wt.description,
      wt.created_at,
      g.sender_name AS gift_sender_name
     FROM wallet_transactions wt
     INNER JOIN wallets w ON w.id = wt.wallet_id
     LEFT JOIN gifts g ON g.id = wt.gift_id
     WHERE w.user_id = $1
     ORDER BY wt.created_at DESC;`,
    [userId]
  );

  return result.rows;
}

export async function listAdminWithdrawalRequests() {
  const result = await query<AdminWithdrawalRecord>(
    `SELECT
      wr.id,
      wr.user_id,
      wr.wallet_id,
      wr.amount_kobo::text,
      wr.bank_name,
      wr.account_number,
      wr.account_name,
      wr.status,
      wr.admin_note,
      wr.reviewed_by,
      wr.created_at,
      wr.reviewed_at,
      u.name AS user_name,
      u.email AS user_email,
      reviewer.name AS reviewer_name,
      reviewer.email AS reviewer_email
     FROM withdrawal_requests wr
     INNER JOIN users u ON u.id = wr.user_id
     LEFT JOIN users reviewer ON reviewer.id = wr.reviewed_by
     ORDER BY wr.created_at DESC;`
  );

  return result.rows;
}

export async function createAdminLog(
  input: {
    action: string;
    adminId: string;
    description: string;
    entityId: string;
    entityType: string;
  },
  client: DbClient
) {
  const result = await client.query<AdminLogRecord>(
    `INSERT INTO admin_logs (
      admin_id,
      action,
      entity_type,
      entity_id,
      description
    )
    VALUES ($1, $2, $3, $4, $5)
    RETURNING id, admin_id, action, entity_type, entity_id, description, created_at;`,
    [input.adminId, input.action, input.entityType, input.entityId, input.description]
  );

  return result.rows[0];
}
