// db-connection.ts — Opsi koneksi PostgreSQL dari environment (satu sumber untuk app, CLI & script).
//
// Dua cara mengisi .env:
//   1. DATABASE_URL=postgresql://user:pass@host/dbname?sslmode=require   (Neon, Supabase, Render, Railway)
//   2. DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME             (PostgreSQL lokal / VPS)
//
// SSL aktif bila DB_SSL=true atau DATABASE_URL memuat sslmode=require (wajib untuk database online).
import type { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';

type Env = Record<string, string | undefined>;

export function sslEnabled(env: Env = process.env): boolean {
  if ((env.DB_SSL || '').toLowerCase() === 'true') return true;
  if ((env.DB_SSL || '').toLowerCase() === 'false') return false;
  return /sslmode=(require|verify-ca|verify-full)/i.test(env.DATABASE_URL || '');
}

/** Opsi koneksi dasar (tanpa entities/migrations). */
export function dbConnectionOptions(env: Env = process.env): PostgresConnectionOptions {
  const ssl = sslEnabled(env) ? { rejectUnauthorized: false } : false;
  if (env.DATABASE_URL) {
    return { type: 'postgres', url: env.DATABASE_URL, ssl };
  }
  return {
    type: 'postgres',
    host: env.DB_HOST || 'localhost',
    port: parseInt(env.DB_PORT || '5432', 10),
    username: env.DB_USERNAME || 'postgres',
    password: env.DB_PASSWORD || '',
    database: env.DB_NAME || 'dinasacademy',
    ssl,
  };
}

/** Untuk log: tujuan koneksi tanpa password. */
export function describeDb(env: Env = process.env): string {
  if (env.DATABASE_URL) {
    try {
      const u = new URL(env.DATABASE_URL);
      return `${u.hostname}/${u.pathname.replace(/^\//, '')}`;
    } catch {
      return '(DATABASE_URL)';
    }
  }
  return `${env.DB_HOST || 'localhost'}:${env.DB_PORT || '5432'}/${env.DB_NAME || 'dinasacademy'}`;
}
