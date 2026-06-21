import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { db } from "../config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const migrationsDirectory = path.resolve(__dirname, "../../migrations");

async function ensureMigrationsTable() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      filename VARCHAR(255) UNIQUE NOT NULL,
      executed_at TIMESTAMP DEFAULT NOW()
    );
  `);
}

async function getAppliedMigrations() {
  const result = await db.query<{ filename: string }>(
    "SELECT filename FROM schema_migrations;"
  );

  return new Set(result.rows.map((row) => row.filename));
}

async function main() {
  await db.query("CREATE EXTENSION IF NOT EXISTS pgcrypto;");
  await ensureMigrationsTable();

  const files = (await readdir(migrationsDirectory))
    .filter((file) => file.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  const appliedMigrations = await getAppliedMigrations();

  for (const file of files) {
    if (appliedMigrations.has(file)) {
      console.log(`Skipping already applied migration: ${file}`);
      continue;
    }

    const filePath = path.join(migrationsDirectory, file);
    const sql = await readFile(filePath, "utf8");
    const client = await db.connect();

    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1);", [
        file
      ]);
      await client.query("COMMIT");
      console.log(`Applied migration: ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

main()
  .catch((error) => {
    console.error("Migration run failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.end();
  });
