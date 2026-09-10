import { describe, it, expect, afterAll } from 'vitest';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import {
  tenants,
  users,
  products,
  tables,
  orders,
  orderItems,
} from '../db/schema';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

// ── Live Neon DB integration tests ────────────────────────────────────
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

afterAll(async () => {
  await pool.end();
});

describe('Neon DB Live Integration Suite', () => {
  let tenantId: number;
  let userId: number;
  let productId: number;
  let tableId: number;
  let orderId: number;

  it('1. Connects to Neon Postgres successfully', async () => {
    const client = await pool.connect();
    const result = await client.query('SELECT 1 AS ping');
    client.release();
    expect(result.rows[0]).toEqual({ ping: 1 });
  });

  it('2. Inserts and retrieves a tenant on Neon', async () => {
    const [t] = await db
      .insert(tenants)
      .values({
        name: 'Neon Cafe & Bar',
        businessType: 'restaurant',
        currencyCode: 'EUR',
      })
      .returning();

    expect(t).toBeDefined();
    expect(t.name).toBe('Neon Cafe & Bar');
    tenantId = t.id;

    const [fetched] = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    expect(fetched?.name).toBe('Neon Cafe & Bar');
  });

  it('3. Inserts a user linked to the tenant', async () => {
    const [u] = await db
      .insert(users)
      .values({
        email: `waiter_${Date.now()}@neonpos.test`,
        hashedPassword: 'hashed_pw_test_123',
        fullName: 'Alex Waiter',
        role: 'waiter',
        tenantId,
      })
      .returning();

    expect(u).toBeDefined();
    expect(u.fullName).toBe('Alex Waiter');
    userId = u.id;
  });

  it('4. Inserts a product linked to the tenant', async () => {
    const [p] = await db
      .insert(products)
      .values({
        tenantId,
        name: 'Artisan Espresso',
        priceCents: 350,
        category: 'Beverages',
      })
      .returning();

    expect(p).toBeDefined();
    expect(p.name).toBe('Artisan Espresso');
    expect(p.priceCents).toBe(350);
    productId = p.id;
  });

  it('5. Creates a table and registers an order with order items', async () => {
    const [tbl] = await db
      .insert(tables)
      .values({
        tenantId,
        name: 'Table 10',
        token: `t10_${Date.now()}`,
        seatCount: 4,
        isActive: true,
      })
      .returning();

    expect(tbl).toBeDefined();
    tableId = tbl.id;

    const [ord] = await db
      .insert(orders)
      .values({
        tenantId,
        tableId,
        customerName: 'Alice Guest',
        status: 'pending',
      })
      .returning();

    expect(ord).toBeDefined();
    orderId = ord.id;

    const [item] = await db
      .insert(orderItems)
      .values({
        orderId,
        productId,
        productName: 'Artisan Espresso',
        quantity: 2,
        priceCents: 350,
        status: 'pending',
      })
      .returning();

    expect(item).toBeDefined();
    expect(item.quantity).toBe(2);
    expect(item.priceCents).toBe(350);
  });

  it('6. Cleans up test tenant (cascades to user, product, table, order, order_item)', async () => {
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    const checkTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    expect(checkTenant).toHaveLength(0);

    const checkOrders = await db.select().from(orders).where(eq(orders.id, orderId));
    expect(checkOrders).toHaveLength(0);
  });
});
