import express from 'express';
import dotenv from 'dotenv';
import { db } from './db';
import { users } from './db/schema';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.send('POS Backend migrated to TypeScript + Express');
});

app.get('/users', async (req, res) => {
  try {
    const allUsers = await db.select().from(users);
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
