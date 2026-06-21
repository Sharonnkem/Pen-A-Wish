import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

import { env } from "./env.js";

export const dbConfig = {
  connectionString: env.databaseUrl,
  ssl: env.databaseSsl
    ? { rejectUnauthorized: env.databaseSslRejectUnauthorized }
    : env.nodeEnv === "production"
      ? { rejectUnauthorized: false }
      : false
} as const;

export const db = new Pool(dbConfig);

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = []
): Promise<QueryResult<T>> {
  return db.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export async function connectToDatabase() {
  await db.query("SELECT 1");
}
