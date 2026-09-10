import { describe, it, expect, afterAll } from 'vitest';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { users } from '../db/schema';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

// ── Live Neon DB integration tests ────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

afterAll(async () => {
  await pool.end();
});

describe('Neon DB Integration: users table', () => {
  let insertedId: number;

  it('connects to Neon Postgres successfully', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 AS ping');
    client.release();
    expect(result.rows[0]).toEqual({ ping: 1 });
  });

  it('inserts a user into the users table', async () => {
    const inserted = await db
      .insert(users)
      .values({ fullName: 'Test User', phone: '+1234567890' })
      .returning();

    expect(inserted).toHaveLength(1);
    expect(inserted[0]!.fullName).toBe('Test User');
    expect(inserted[0]!.phone).toBe('+1234567890');
    expect(inserted[0]!.id).toBeTypeOf('number');
    insertedId = inserted[0]!.id;
  });

  it('reads back the inserted user', async () => {
    const allUsers = await db.select().from(users);
    const found = allUsers.find((u) => u.id === insertedId);
    expect(found).toBeDefined();
    expect(found!.fullName).toBe('Test User');
  });

  it('cleans up the test user', async () => {
    const { eq } = await import('drizzle-orm');
    await db.delete(users).where(eq(users.id, insertedId));
    const allUsers = await db.select().from(users);
    const found = allUsers.find((u) => u.id === insertedId);
    expect(found).toBeUndefined();
  });
});
