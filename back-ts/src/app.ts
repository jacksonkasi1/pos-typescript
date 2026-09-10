import express, { Request, Response } from 'express';
import { eq } from 'drizzle-orm';

export const app = express();
app.use(express.json());

// ── Base & Health Routes ──────────────────────────────────────────────
app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'POS Backend — TypeScript + Express + Neon Postgres' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ── Users ─────────────────────────────────────────────────────────────
app.get('/users', async (_req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { users } = await import('./db/schema');
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// ── Tenants ───────────────────────────────────────────────────────────
app.get('/api/tenants', async (_req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { tenants } = await import('./db/schema');
    const all = await db.select().from(tenants);
    res.json(all);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tenants' });
  }
});

app.post('/api/tenants', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { tenants } = await import('./db/schema');
    const { name, businessType, currencyCode } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Tenant name is required' });
    }
    const [inserted] = await db
      .insert(tenants)
      .values({ name, businessType, currencyCode: currencyCode || 'EUR' })
      .returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create tenant' });
  }
});

// ── Products ──────────────────────────────────────────────────────────
app.get('/api/products', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { products } = await import('./db/schema');
    const tenantId = req.query.tenantId ? Number(req.query.tenantId) : undefined;
    const query = tenantId
      ? db.select().from(products).where(eq(products.tenantId, tenantId))
      : db.select().from(products);
    const list = await query;
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

app.post('/api/products', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { products } = await import('./db/schema');
    const { tenantId, name, priceCents, category } = req.body;
    if (!tenantId || !name || priceCents === undefined) {
      return res.status(400).json({ error: 'tenantId, name, and priceCents are required' });
    }
    const [inserted] = await db
      .insert(products)
      .values({ tenantId, name, priceCents, category })
      .returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// ── Tables ────────────────────────────────────────────────────────────
app.get('/api/tables', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { tables } = await import('./db/schema');
    const tenantId = req.query.tenantId ? Number(req.query.tenantId) : undefined;
    const query = tenantId
      ? db.select().from(tables).where(eq(tables.tenantId, tenantId))
      : db.select().from(tables);
    const list = await query;
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tables' });
  }
});

app.post('/api/tables', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { tables } = await import('./db/schema');
    const { tenantId, name, token, seatCount } = req.body;
    if (!tenantId || !name || !token) {
      return res.status(400).json({ error: 'tenantId, name, and token are required' });
    }
    const [inserted] = await db
      .insert(tables)
      .values({ tenantId, name, token, seatCount: seatCount || 4 })
      .returning();
    res.status(201).json(inserted);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create table' });
  }
});

// ── Orders ────────────────────────────────────────────────────────────
app.get('/api/orders', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { orders } = await import('./db/schema');
    const tenantId = req.query.tenantId ? Number(req.query.tenantId) : undefined;
    const query = tenantId
      ? db.select().from(orders).where(eq(orders.tenantId, tenantId))
      : db.select().from(orders);
    const list = await query;
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const { db } = await import('./db/index');
    const { orders, orderItems } = await import('./db/schema');
    const { tenantId, tableId, items, customerName, notes } = req.body;
    if (!tenantId) {
      return res.status(400).json({ error: 'tenantId is required' });
    }
    const [order] = await db
      .insert(orders)
      .values({ tenantId, tableId, customerName, notes, status: 'pending' })
      .returning();

    if (items && Array.isArray(items) && items.length > 0) {
      const itemsToInsert = items.map((item: any) => ({
        orderId: order.id,
        productId: item.productId,
        productName: item.productName || 'Item',
        quantity: item.quantity || 1,
        priceCents: item.priceCents || 0,
        notes: item.notes,
        status: 'pending' as const,
      }));
      await db.insert(orderItems).values(itemsToInsert);
    }

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create order' });
  }
});
