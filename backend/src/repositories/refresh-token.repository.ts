import type { PoolClient } from "pg";

import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";

export type RefreshTokenRecord = {
  created_at: Date;
  expires_at: Date;
  id: string;
  revoked_at: Date | null;
  token_hash: string;
  user_id: string;
};

function getExecutor(client?: DbClient) {
  return client ?? db;
}

export async function createRefreshTokenRecord(
  input: {
    expiresAt: Date;
    tokenHash: string;
    userId: string;
  },
  client: PoolClient
) {
  const result = await client.query<RefreshTokenRecord>(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, revoked_at, created_at;`,
    [input.userId, input.tokenHash, input.expiresAt]
  );

  return result.rows[0];
}

export async function findRefreshTokenByHash(tokenHash: string) {
  const result = await query<RefreshTokenRecord>(
    `SELECT id, user_id, token_hash, expires_at, revoked_at, created_at
     FROM refresh_tokens
     WHERE token_hash = $1
     LIMIT 1;`,
    [tokenHash]
  );

  return result.rows[0] ?? null;
}

export async function revokeRefreshTokenById(
  id: string,
  client?: DbClient
) {
  const executor = getExecutor(client);

  await executor.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE id = $1 AND revoked_at IS NULL;`,
    [id]
  );
}

export async function revokeRefreshTokensByUserId(
  userId: string,
  client?: DbClient
) {
  const executor = getExecutor(client);

  await executor.query(
    `UPDATE refresh_tokens
     SET revoked_at = NOW()
     WHERE user_id = $1 AND revoked_at IS NULL;`,
    [userId]
  );
}

