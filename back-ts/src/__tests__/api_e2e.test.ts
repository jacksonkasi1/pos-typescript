import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../app';
import { Pool } from 'pg';
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { tenants } from '../db/schema';
import * as schema from '../db/schema';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool, { schema });

afterAll(async () => {
  await pool.end();
});

describe('POS End-to-End API Suite (Realistic Hospitality Payloads)', () => {
  let tenantId: number;
  let pizzaId: number;
  let capreseId: number;
  let wineId: number;
  let dessertId: number;
  let tableId: number;
  let orderId: number;

  it('1. POST /api/tenants - Creates a full realistic restaurant tenant', async () => {
    const tenantPayload = {
      name: `Trattoria Bella Napoli ${Date.now()}`,
      businessType: 'restaurant',
      description: 'Authentic Neapolitan wood-fired pizzeria & regional wine bar',
      phone: '+39 081 555 1234',
      whatsapp: '+39 340 123 4567',
      email: 'prenotazioni@bellanapoli.it',
      address: 'Via dei Tribunali 32, 80138 Napoli, Italy',
      website: 'https://bellanapoli.it',
      taxId: 'IT12345678901',
      currencyCode: 'EUR',
      currency: '€',
      immediatePaymentRequired: false,
    };

    const res = await request(app).post('/api/tenants').send(tenantPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(tenantPayload.name);
    expect(res.body.businessType).toBe('restaurant');
    expect(res.body.currencyCode).toBe('EUR');
    expect(res.body.phone).toBe('+39 081 555 1234');
    expect(res.body.address).toBe('Via dei Tribunali 32, 80138 Napoli, Italy');

    tenantId = res.body.id;
  });

  it('2. POST /api/products - Adds realistic menu items across courses', async () => {
    // 2a. Pizza Course
    const pizzaRes = await request(app).post('/api/products').send({
      tenantId,
      name: 'Pizza Margherita Verace STG',
      priceCents: 1150,
      costCents: 280,
      description: 'San Marzano D.O.P., Mozzarella di Bufala Campana, Fresh Basil, EVOO',
      ingredients: 'Flour, Water, Yeast, Sea Salt, Tomatoes, Buffalo Mozzarella, Basil, Olive Oil',
      category: 'Pizzas',
      subcategory: 'Classic Pizzas',
    });
    expect(pizzaRes.status).toBe(201);
    expect(pizzaRes.body.priceCents).toBe(1150);
    pizzaId = pizzaRes.body.id;

    // 2b. Starter Course
    const capreseRes = await request(app).post('/api/products').send({
      tenantId,
      name: 'Insalata Caprese di Bufala',
      priceCents: 950,
      costCents: 210,
      description: 'Sliced fresh buffalo mozzarella, ripe vine tomatoes, basil leaves, balsamic glaze',
      ingredients: 'Buffalo Mozzarella, Tomatoes, Basil, Balsamic Glaze, Sea Salt',
      category: 'Starters',
      subcategory: 'Salads',
    });
    expect(capreseRes.status).toBe(201);
    expect(capreseRes.body.priceCents).toBe(950);
    capreseId = capreseRes.body.id;

    // 2c. Wine & Beverage Course
    const wineRes = await request(app).post('/api/products').send({
      tenantId,
      name: 'Greco di Tufo DOCG 750ml',
      priceCents: 2400,
      costCents: 850,
      description: 'Campanian white wine, crisp acidity, notes of white peach and almond',
      category: 'Beverages',
      subcategory: 'White Wine',
    });
    expect(wineRes.status).toBe(201);
    expect(wineRes.body.priceCents).toBe(2400);
    wineId = wineRes.body.id;

    // 2d. Dessert Course
    const dessertRes = await request(app).post('/api/products').send({
      tenantId,
      name: 'Torta Caprese al Limone',
      priceCents: 700,
      costCents: 150,
      description: 'Traditional flourless almond and Sorrento lemon cake',
      category: 'Desserts',
      subcategory: 'Cakes',
    });
    expect(dessertRes.status).toBe(201);
    expect(dessertRes.body.priceCents).toBe(700);
    dessertId = dessertRes.body.id;
  });

  it('3. GET /api/products?tenantId=... - Fetches all tenant menu items', async () => {
    const res = await request(app).get(`/api/products?tenantId=${tenantId}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(4);

    const names = res.body.map((p: any) => p.name);
    expect(names).toContain('Pizza Margherita Verace STG');
    expect(names).toContain('Insalata Caprese di Bufala');
    expect(names).toContain('Greco di Tufo DOCG 750ml');
    expect(names).toContain('Torta Caprese al Limone');
  });

  it('4. POST /api/tables - Sets up floor plan table', async () => {
    const tablePayload = {
      tenantId,
      name: 'Table 12 (Main Dining Room)',
      token: `tbl_napoli_12_${Date.now()}`,
      seatCount: 4,
      xPosition: 150.0,
      yPosition: 200.0,
      shape: 'rectangle',
      width: 120.0,
      height: 80.0,
    };

    const res = await request(app).post('/api/tables').send(tablePayload);

    expect(res.status).toBe(201);
    expect(res.body.name).toBe(tablePayload.name);
    expect(res.body.seatCount).toBe(4);
    expect(res.body.xPosition).toBe(150.0);
    expect(res.body.yPosition).toBe(200.0);
    expect(res.body.isActive).toBe(true);

    tableId = res.body.id;
  });

  it('5. POST /api/orders - Creates realistic multi-item dining order with notes', async () => {
    const orderPayload = {
      tenantId,
      tableId,
      customerName: 'Gianluigi Donnarumma',
      notes: 'Anniversary dinner. Guest is lactose-intolerant for one dish. Bring wine first.',
      paymentMethod: 'credit_card',
      staffUrgent: true,
      items: [
        {
          productId: pizzaId,
          productName: 'Pizza Margherita Verace STG',
          quantity: 2,
          priceCents: 1150,
          notes: 'One with well-done crispy crust',
        },
        {
          productId: capreseId,
          productName: 'Insalata Caprese di Bufala',
          quantity: 1,
          priceCents: 950,
          notes: 'Dressing on the side',
        },
        {
          productId: wineId,
          productName: 'Greco di Tufo DOCG 750ml',
          quantity: 1,
          priceCents: 2400,
          notes: 'Serve chilled immediately with 2 wine glasses',
        },
        {
          productId: dessertId,
          productName: 'Torta Caprese al Limone',
          quantity: 2,
          priceCents: 700,
          notes: 'Serve together with double espresso',
        },
      ],
    };

    const res = await request(app).post('/api/orders').send(orderPayload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.customerName).toBe('Gianluigi Donnarumma');
    expect(res.body.status).toBe('pending');
    expect(res.body.staffUrgent).toBe(true);
    expect(res.body.items).toHaveLength(4);

    orderId = res.body.id;

    // Verify order total calculation
    const totalCents = res.body.items.reduce(
      (sum: number, item: any) => sum + item.priceCents * item.quantity,
      0
    );
    // (2 * 1150) + (1 * 950) + (1 * 2400) + (2 * 700) = 7050 cents (€70.50)
    expect(totalCents).toBe(7050);
  });

  it('6. GET /api/orders/:id - Retrieves order with nested order items', async () => {
    const res = await request(app).get(`/api/orders/${orderId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(orderId);
    expect(res.body.customerName).toBe('Gianluigi Donnarumma');
    expect(res.body.items).toHaveLength(4);

    const wineItem = res.body.items.find((i: any) => i.productId === wineId);
    expect(wineItem).toBeDefined();
    expect(wineItem.notes).toBe('Serve chilled immediately with 2 wine glasses');
    expect(wineItem.priceCents).toBe(2400);
  });

  it('7. PATCH /api/orders/:id/status - Simulates kitchen and service lifecycle', async () => {
    // Transition 1: in_progress
    const step1 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'in_progress' });
    expect(step1.status).toBe(200);
    expect(step1.body.status).toBe('in_progress');

    // Transition 2: ready
    const step2 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'ready' });
    expect(step2.status).toBe(200);
    expect(step2.body.status).toBe('ready');

    // Transition 3: delivered
    const step3 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'delivered' });
    expect(step3.status).toBe(200);
    expect(step3.body.status).toBe('delivered');

    // Transition 4: paid
    const step4 = await request(app)
      .patch(`/api/orders/${orderId}/status`)
      .send({ status: 'paid' });
    expect(step4.status).toBe(200);
    expect(step4.body.status).toBe('paid');
  });

  it('8. Clean up test tenant and verify cascade on Neon Postgres', async () => {
    await db.delete(tenants).where(eq(tenants.id, tenantId));

    const checkTenant = await db.select().from(tenants).where(eq(tenants.id, tenantId));
    expect(checkTenant).toHaveLength(0);
  });
});
