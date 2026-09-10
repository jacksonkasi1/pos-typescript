import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  date,
  doublePrecision,
  jsonb,
  pgEnum,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ── Enums ─────────────────────────────────────────────────────────────
export const userRoleEnum = pgEnum('user_role', [
  'admin',
  'manager',
  'waiter',
  'kitchen',
  'host',
  'provider',
  'guest',
]);

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'submitted',
  'in_progress',
  'ready',
  'delivered',
  'paid',
  'cancelled',
]);

export const orderItemStatusEnum = pgEnum('order_item_status', [
  'pending',
  'preparing',
  'ready',
  'delivered',
  'cancelled',
]);

export const reservationStatusEnum = pgEnum('reservation_status', [
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no_show',
]);

// ── Tenants Table ─────────────────────────────────────────────────────
export const tenants = pgTable('tenant', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  businessType: varchar('business_type', { length: 64 }),
  description: text('description'),
  phone: varchar('phone', { length: 64 }),
  whatsapp: varchar('whatsapp', { length: 64 }),
  email: varchar('email', { length: 255 }),
  address: text('address'),
  website: text('website'),
  taxId: varchar('tax_id', { length: 64 }),
  cif: varchar('cif', { length: 64 }),
  ccc: varchar('ccc', { length: 64 }),
  logoFilename: text('logo_filename'),
  headerBackgroundFilename: text('header_background_filename'),
  publicBackgroundColor: varchar('public_background_color', { length: 32 }),
  openingHours: text('opening_hours'),
  immediatePaymentRequired: boolean('immediate_payment_required').default(false).notNull(),
  currencyCode: varchar('currency_code', { length: 8 }).default('EUR'),
  currency: varchar('currency', { length: 8 }).default('€'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Taxes Table ───────────────────────────────────────────────────────
export const taxes = pgTable('tax', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  ratePercent: integer('rate_percent').notNull(),
  validFrom: date('valid_from').notNull(),
  validTo: date('valid_to'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Users Table ───────────────────────────────────────────────────────
export const users = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  hashedPassword: text('hashed_password').notNull(),
  fullName: text('full_name'),
  role: userRoleEnum('role').default('waiter').notNull(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }),
  providerId: integer('provider_id'),
  tokenVersion: integer('token_version').default(0).notNull(),
  otpSecret: text('otp_secret'),
  otpEnabled: boolean('otp_enabled').default(false).notNull(),
  employeeNumber: varchar('employee_number', { length: 64 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Kitchen Stations ──────────────────────────────────────────────────
export const kitchenStations = pgTable('kitchen_station', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  color: varchar('color', { length: 32 }).default('#1976d2'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Products Table ────────────────────────────────────────────────────
export const products = pgTable('product', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  priceCents: integer('price_cents').notNull(),
  costCents: integer('cost_cents'),
  description: text('description'),
  imageFilename: text('image_filename'),
  ingredients: text('ingredients'),
  category: varchar('category', { length: 128 }),
  subcategory: varchar('subcategory', { length: 128 }),
  taxId: integer('tax_id').references(() => taxes.id),
  kitchenStationId: integer('kitchen_station_id').references(() => kitchenStations.id),
  availableFrom: date('available_from'),
  availableUntil: date('available_until'),
  stockAlertEnabled: boolean('stock_alert_enabled').default(false).notNull(),
  stockQty: integer('stock_qty').default(0).notNull(),
  stockAlertLevel: integer('stock_alert_level').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Floors / Zones ────────────────────────────────────────────────────
export const floors = pgTable('floor', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  seatingZone: varchar('seating_zone', { length: 32 }).default('any').notNull(),
  defaultWaiterId: integer('default_waiter_id').references(() => users.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Table Groups ──────────────────────────────────────────────────────
export const tableGroups = pgTable('table_group', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 128 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Tables ────────────────────────────────────────────────────────────
export const tables = pgTable('table', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 64 }).notNull(),
  token: varchar('token', { length: 64 }).notNull().unique(),
  floorId: integer('floor_id').references(() => floors.id),
  tableGroupId: integer('table_group_id').references(() => tableGroups.id),
  assignedWaiterId: integer('assigned_waiter_id').references(() => users.id),
  xPosition: doublePrecision('x_position').default(0).notNull(),
  yPosition: doublePrecision('y_position').default(0).notNull(),
  rotation: doublePrecision('rotation').default(0).notNull(),
  shape: varchar('shape', { length: 32 }).default('rectangle').notNull(),
  width: doublePrecision('width').default(100).notNull(),
  height: doublePrecision('height').default(60).notNull(),
  seatCount: integer('seat_count').default(4).notNull(),
  orderPin: varchar('order_pin', { length: 16 }),
  isActive: boolean('is_active').default(false).notNull(),
  activeOrderId: integer('active_order_id'),
  activatedAt: timestamp('activated_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Customers ─────────────────────────────────────────────────────────
export const customers = pgTable('customer', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 64 }),
  fullName: varchar('full_name', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Orders ────────────────────────────────────────────────────────────
export const orders = pgTable('order', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  tableId: integer('table_id').references(() => tables.id),
  status: orderStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  sessionId: varchar('session_id', { length: 255 }),
  customerName: varchar('customer_name', { length: 255 }),
  customerId: integer('customer_id').references(() => customers.id),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy: varchar('cancelled_by', { length: 64 }),
  billRequestedAt: timestamp('bill_requested_at', { withTimezone: true }),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  paidByUserId: integer('paid_by_user_id').references(() => users.id),
  paymentMethod: varchar('payment_method', { length: 64 }),
  revolutOrderId: varchar('revolut_order_id', { length: 255 }),
  tipPercentApplied: integer('tip_percent_applied'),
  tipAmountCents: integer('tip_amount_cents'),
  tipAttributedUserId: integer('tip_attributed_user_id').references(() => users.id),
  locationVerified: boolean('location_verified'),
  flaggedForReview: boolean('flagged_for_review').default(false).notNull(),
  flagReason: text('flag_reason'),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
  deletedByUserId: integer('deleted_by_user_id').references(() => users.id),
  staffUrgent: boolean('staff_urgent').default(false).notNull(),
});

// ── Order Items ───────────────────────────────────────────────────────
export const orderItems = pgTable('order_item', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  productId: integer('product_id').references(() => products.id, { onDelete: 'cascade' }).notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: integer('quantity').notNull(),
  priceCents: integer('price_cents').notNull(),
  costCents: integer('cost_cents'),
  notes: text('notes'),
  customizationAnswers: jsonb('customization_answers'),
  customizationSummary: varchar('customization_summary', { length: 1024 }),
  lineModifiers: jsonb('line_modifiers'),
  lineModifiersSummary: varchar('line_modifiers_summary', { length: 1024 }),
  listPriceCents: integer('list_price_cents'),
  discountCents: integer('discount_cents').default(0).notNull(),
  taxId: integer('tax_id').references(() => taxes.id),
  taxRatePercent: integer('tax_rate_percent'),
  taxAmountCents: integer('tax_amount_cents'),
  status: orderItemStatusEnum('status').default('pending').notNull(),
  statusUpdatedAt: timestamp('status_updated_at', { withTimezone: true }),
  preparedByUserId: integer('prepared_by_user_id').references(() => users.id),
  deliveredByUserId: integer('delivered_by_user_id').references(() => users.id),
  removedByCustomer: boolean('removed_by_customer').default(false).notNull(),
  removedAt: timestamp('removed_at', { withTimezone: true }),
  removedReason: text('removed_reason'),
  removedByUserId: integer('removed_by_user_id').references(() => users.id),
  modifiedByUserId: integer('modified_by_user_id').references(() => users.id),
});

// ── Order Payments ────────────────────────────────────────────────────
export const orderPayments = pgTable('order_payment', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  orderId: integer('order_id').references(() => orders.id, { onDelete: 'cascade' }).notNull(),
  amountCents: integer('amount_cents').notNull(),
  paymentMethod: varchar('payment_method', { length: 64 }).notNull(),
  status: varchar('status', { length: 32 }).default('completed').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  createdByUserId: integer('created_by_user_id').references(() => users.id),
});

// ── Reservations ──────────────────────────────────────────────────────
export const reservations = pgTable('reservation', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  customerName: varchar('customer_name', { length: 255 }).notNull(),
  customerPhone: varchar('customer_phone', { length: 64 }),
  customerEmail: varchar('customer_email', { length: 255 }),
  partySize: integer('party_size').notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }),
  tableId: integer('table_id').references(() => tables.id),
  floorId: integer('floor_id').references(() => floors.id),
  status: reservationStatusEnum('status').default('pending').notNull(),
  notes: text('notes'),
  seatingPreference: varchar('seating_preference', { length: 32 }).default('any'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Staff Shifts & Attendance ─────────────────────────────────────────
export const shifts = pgTable('shift', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 32 }).default('scheduled').notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const workSessions = pgTable('work_session', {
  id: serial('id').primaryKey(),
  tenantId: integer('tenant_id').references(() => tenants.id, { onDelete: 'cascade' }).notNull(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  clockIn: timestamp('clock_in', { withTimezone: true }).notNull(),
  clockOut: timestamp('clock_out', { withTimezone: true }),
  totalMinutes: integer('total_minutes').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ── Relations ─────────────────────────────────────────────────────────
export const tenantsRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  taxes: many(taxes),
  products: many(products),
  floors: many(floors),
  tables: many(tables),
  orders: many(orders),
  reservations: many(reservations),
}));

export const usersRelations = relations(users, ({ one }) => ({
  tenant: one(tenants, {
    fields: [users.tenantId],
    references: [tenants.id],
  }),
}));

export const ordersRelations = relations(orders, ({ one, many }) => ({
  tenant: one(tenants, {
    fields: [orders.tenantId],
    references: [tenants.id],
  }),
  table: one(tables, {
    fields: [orders.tableId],
    references: [tables.id],
  }),
  customer: one(customers, {
    fields: [orders.customerId],
    references: [customers.id],
  }),
  items: many(orderItems),
  payments: many(orderPayments),
}));

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));
