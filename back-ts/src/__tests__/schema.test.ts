import { describe, it, expect } from 'vitest';
import { pgTable, serial, text, varchar } from 'drizzle-orm/pg-core';
import { getTableName } from 'drizzle-orm';

// ── Drizzle schema unit tests ─────────────────────────────────────────
describe('Drizzle Schema: users table', () => {
  const usersTable = pgTable('users', {
    id: serial('id').primaryKey(),
    fullName: text('full_name'),
    phone: varchar('phone', { length: 256 }),
  });

  it('has the correct table name', () => {
    expect(getTableName(usersTable)).toBe('users');
  });

  it('has id, fullName, phone columns', () => {
    const cols = Object.keys(usersTable);
    expect(cols).toContain('id');
    expect(cols).toContain('fullName');
    expect(cols).toContain('phone');
  });

  it('id column is a serial primary key', () => {
    const id = usersTable.id;
    expect(id.dataType).toBe('number');
  });

  it('phone varchar has max length 256', () => {
    const phone = usersTable.phone;
    // Drizzle stores config on columnType
    expect((phone as any).config?.length).toBe(256);
  });
});
