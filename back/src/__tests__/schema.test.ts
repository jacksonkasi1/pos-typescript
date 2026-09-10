import { describe, it, expect } from 'vitest';
import { getTableName } from 'drizzle-orm';
import {
  tenants,
  users,
  taxes,
  products,
  floors,
  tableGroups,
  tables,
  orders,
  orderItems,
  orderPayments,
  customers,
  reservations,
  shifts,
  workSessions,
} from '../db/schema';

describe('Drizzle POS Schema Unit Tests', () => {
  it('validates all table names match database conventions', () => {
    expect(getTableName(tenants)).toBe('tenant');
    expect(getTableName(users)).toBe('user');
    expect(getTableName(taxes)).toBe('tax');
    expect(getTableName(products)).toBe('product');
    expect(getTableName(floors)).toBe('floor');
    expect(getTableName(tableGroups)).toBe('table_group');
    expect(getTableName(tables)).toBe('table');
    expect(getTableName(orders)).toBe('order');
    expect(getTableName(orderItems)).toBe('order_item');
    expect(getTableName(orderPayments)).toBe('order_payment');
    expect(getTableName(customers)).toBe('customer');
    expect(getTableName(reservations)).toBe('reservation');
    expect(getTableName(shifts)).toBe('shift');
    expect(getTableName(workSessions)).toBe('work_session');
  });

  it('validates tenants table columns', () => {
    const cols = Object.keys(tenants);
    expect(cols).toContain('id');
    expect(cols).toContain('name');
    expect(cols).toContain('currencyCode');
    expect(cols).toContain('immediatePaymentRequired');
  });

  it('validates products table columns', () => {
    const cols = Object.keys(products);
    expect(cols).toContain('id');
    expect(cols).toContain('tenantId');
    expect(cols).toContain('name');
    expect(cols).toContain('priceCents');
    expect(cols).toContain('stockAlertEnabled');
  });

  it('validates orders and orderItems relationships and columns', () => {
    const orderCols = Object.keys(orders);
    expect(orderCols).toContain('id');
    expect(orderCols).toContain('tenantId');
    expect(orderCols).toContain('tableId');
    expect(orderCols).toContain('status');
    expect(orderCols).toContain('staffUrgent');

    const itemCols = Object.keys(orderItems);
    expect(itemCols).toContain('orderId');
    expect(itemCols).toContain('productId');
    expect(itemCols).toContain('priceCents');
    expect(itemCols).toContain('quantity');
    expect(itemCols).toContain('status');
  });

  it('validates table layout coordinates and dimensions', () => {
    const tableCols = Object.keys(tables);
    expect(tableCols).toContain('xPosition');
    expect(tableCols).toContain('yPosition');
    expect(tableCols).toContain('width');
    expect(tableCols).toContain('height');
    expect(tableCols).toContain('seatCount');
  });
});
