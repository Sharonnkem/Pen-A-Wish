import type { PoolClient } from "pg";

import { db, query } from "../config/db.js";
import type { DbClient } from "../types/database.js";

export type UserRecord = {
  avatar_url: string | null;
  created_at: Date;
  email: string;
  id: string;
  name: string;
  password_hash: string;
  role: "user" | "admin";
  updated_at: Date;
};

function getExecutor(client?: DbClient) {
  return client ?? db;
}

export async function findUserByEmail(email: string) {
  const result = await query<UserRecord>(
    `SELECT id, name, email, password_hash, avatar_url, role, created_at, updated_at
     FROM users
     WHERE email = $1
     LIMIT 1;`,
    [email.toLowerCase()]
  );

  return result.rows[0] ?? null;
}

export async function findUserById(id: string) {
  const result = await query<UserRecord>(
    `SELECT id, name, email, password_hash, avatar_url, role, created_at, updated_at
     FROM users
     WHERE id = $1
     LIMIT 1;`,
    [id]
  );

  return result.rows[0] ?? null;
}

export async function createUser(
  input: {
    email: string;
    name: string;
    passwordHash: string;
    role?: "user" | "admin";
  },
  client: PoolClient
) {
  const result = await client.query<UserRecord>(
    `INSERT INTO users (name, email, password_hash, role)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, email, password_hash, avatar_url, role, created_at, updated_at;`,
    [input.name, input.email.toLowerCase(), input.passwordHash, input.role ?? "user"]
  );

  return result.rows[0];
}

export async function createWalletForUser(userId: string, client: PoolClient) {
  await client.query(
    `INSERT INTO wallets (user_id, balance_kobo)
     VALUES ($1, $2);`,
    [userId, 0]
  );
}

export async function updateUserPassword(
  userId: string,
  passwordHash: string,
  client?: DbClient
) {
  const executor = getExecutor(client);

  await executor.query(
    `UPDATE users
     SET password_hash = $2, updated_at = NOW()
     WHERE id = $1;`,
    [userId, passwordHash]
  );
}

export async function updateUserProfile(
  userId: string,
  input: {
    avatarUrl: string | null;
    email: string;
    name: string;
  },
  client?: DbClient
) {
  const executor = getExecutor(client);

  const result = await executor.query<UserRecord>(
    `UPDATE users
     SET name = $2,
         email = $3,
         avatar_url = $4,
         updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, password_hash, avatar_url, role, created_at, updated_at;`,
    [userId, input.name, input.email.toLowerCase(), input.avatarUrl]
  );

  return result.rows[0] ?? null;
}

export async function deleteUserById(userId: string, client?: DbClient) {
  const executor = getExecutor(client);

  await executor.query(`DELETE FROM users WHERE id = $1;`, [userId]);
}
