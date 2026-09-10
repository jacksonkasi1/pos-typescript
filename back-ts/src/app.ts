import express, { Request, Response } from 'express';

export const app = express();
app.use(express.json());

app.get('/', (_req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'POS Backend — TypeScript + Express + Neon Postgres' });
});

app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Users route — real DB calls happen via db/index
app.get('/users', async (_req: Request, res: Response) => {
  try {
    // Lazy import so tests can run without a real DB connection
    const { db } = await import('./db/index');
    const { users } = await import('./db/schema');
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});
