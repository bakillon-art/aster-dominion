import 'dotenv/config';
import fs from 'node:fs/promises';
import { Pool } from 'pg';

export let databaseReady = false;

const connectionString =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/aster_dominion';

export const pool = new Pool({
  connectionString,
  max: Number(process.env.DB_POOL_MAX ?? 10),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : undefined,
});

export async function ensureDatabaseConnection(): Promise<boolean> {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.warn(
      'PostgreSQL unavailable. Falling back to the in-memory store for local demo mode.',
      error instanceof Error ? error.message : String(error),
    );
    return false;
  }
}

export async function initializeDatabase(): Promise<boolean> {
  const isAvailable = await ensureDatabaseConnection();
  databaseReady = isAvailable;

  if (!isAvailable) {
    return false;
  }

  const schemaSql = await fs.readFile(new URL('../db/schema.sql', import.meta.url), 'utf8');
  await pool.query(schemaSql);

  console.log('Database schema initialized successfully.');
  return true;
}

export async function closeDatabase(): Promise<void> {
  await pool.end();
}
