import 'dotenv/config';
import { Pool } from 'pg';

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const client = await pool.connect();
  try {
    console.log('🚀 Starting Neon Postgres migrations...');

    // 1. Enums
    await client.query(`
      DO $$ BEGIN
        CREATE TYPE user_role AS ENUM ('admin', 'manager', 'waiter', 'kitchen', 'host', 'provider', 'guest');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE order_status AS ENUM ('pending', 'submitted', 'in_progress', 'ready', 'delivered', 'paid', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE order_item_status AS ENUM ('pending', 'preparing', 'ready', 'delivered', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;

      DO $$ BEGIN
        CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'seated', 'completed', 'cancelled', 'no_show');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // 2. Core Tables
    await client.query(`
      CREATE TABLE IF NOT EXISTS "tenant" (
        "id" serial PRIMARY KEY,
        "name" varchar(255) NOT NULL,
        "business_type" varchar(64),
        "description" text,
        "phone" varchar(64),
        "whatsapp" varchar(64),
        "email" varchar(255),
        "address" text,
        "website" text,
        "tax_id" varchar(64),
        "cif" varchar(64),
        "ccc" varchar(64),
        "logo_filename" text,
        "header_background_filename" text,
        "public_background_color" varchar(32),
        "opening_hours" text,
        "immediate_payment_required" boolean NOT NULL DEFAULT false,
        "currency_code" varchar(8) DEFAULT 'EUR',
        "currency" varchar(8) DEFAULT '€',
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "tax" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(128) NOT NULL,
        "rate_percent" integer NOT NULL,
        "valid_from" date NOT NULL,
        "valid_to" date,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "user" (
        "id" serial PRIMARY KEY,
        "email" varchar(255) NOT NULL UNIQUE,
        "hashed_password" text NOT NULL,
        "full_name" text,
        "role" user_role NOT NULL DEFAULT 'waiter',
        "tenant_id" integer REFERENCES "tenant"("id") ON DELETE CASCADE,
        "provider_id" integer,
        "token_version" integer NOT NULL DEFAULT 0,
        "otp_secret" text,
        "otp_enabled" boolean NOT NULL DEFAULT false,
        "employee_number" varchar(64),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "kitchen_station" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(128) NOT NULL,
        "color" varchar(32) DEFAULT '#1976d2',
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "product" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(255) NOT NULL,
        "price_cents" integer NOT NULL,
        "cost_cents" integer,
        "description" text,
        "image_filename" text,
        "ingredients" text,
        "category" varchar(128),
        "subcategory" varchar(128),
        "tax_id" integer REFERENCES "tax"("id"),
        "kitchen_station_id" integer REFERENCES "kitchen_station"("id"),
        "available_from" date,
        "available_until" date,
        "stock_alert_enabled" boolean NOT NULL DEFAULT false,
        "stock_qty" integer NOT NULL DEFAULT 0,
        "stock_alert_level" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "floor" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(128) NOT NULL,
        "sort_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "seating_zone" varchar(32) NOT NULL DEFAULT 'any',
        "default_waiter_id" integer REFERENCES "user"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "table_group" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(128) NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "table" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "name" varchar(64) NOT NULL,
        "token" varchar(64) NOT NULL UNIQUE,
        "floor_id" integer REFERENCES "floor"("id"),
        "table_group_id" integer REFERENCES "table_group"("id"),
        "assigned_waiter_id" integer REFERENCES "user"("id"),
        "x_position" double precision NOT NULL DEFAULT 0,
        "y_position" double precision NOT NULL DEFAULT 0,
        "rotation" double precision NOT NULL DEFAULT 0,
        "shape" varchar(32) NOT NULL DEFAULT 'rectangle',
        "width" double precision NOT NULL DEFAULT 100,
        "height" double precision NOT NULL DEFAULT 60,
        "seat_count" integer NOT NULL DEFAULT 4,
        "order_pin" varchar(16),
        "is_active" boolean NOT NULL DEFAULT false,
        "active_order_id" integer,
        "activated_at" timestamptz,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "customer" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "email" varchar(255),
        "phone" varchar(64),
        "full_name" varchar(255),
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "order" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "table_id" integer REFERENCES "table"("id"),
        "status" order_status NOT NULL DEFAULT 'pending',
        "notes" text,
        "session_id" varchar(255),
        "customer_name" varchar(255),
        "customer_id" integer REFERENCES "customer"("id"),
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "cancelled_at" timestamptz,
        "cancelled_by" varchar(64),
        "bill_requested_at" timestamptz,
        "paid_at" timestamptz,
        "paid_by_user_id" integer REFERENCES "user"("id"),
        "payment_method" varchar(64),
        "revolut_order_id" varchar(255),
        "tip_percent_applied" integer,
        "tip_amount_cents" integer,
        "tip_attributed_user_id" integer REFERENCES "user"("id"),
        "location_verified" boolean,
        "flagged_for_review" boolean NOT NULL DEFAULT false,
        "flag_reason" text,
        "deleted_at" timestamptz,
        "deleted_by_user_id" integer REFERENCES "user"("id"),
        "staff_urgent" boolean NOT NULL DEFAULT false
      );

      CREATE TABLE IF NOT EXISTS "order_item" (
        "id" serial PRIMARY KEY,
        "order_id" integer NOT NULL REFERENCES "order"("id") ON DELETE CASCADE,
        "product_id" integer NOT NULL REFERENCES "product"("id") ON DELETE CASCADE,
        "product_name" varchar(255) NOT NULL,
        "quantity" integer NOT NULL,
        "price_cents" integer NOT NULL,
        "cost_cents" integer,
        "notes" text,
        "customization_answers" jsonb,
        "customization_summary" varchar(1024),
        "line_modifiers" jsonb,
        "line_modifiers_summary" varchar(1024),
        "list_price_cents" integer,
        "discount_cents" integer NOT NULL DEFAULT 0,
        "tax_id" integer REFERENCES "tax"("id"),
        "tax_rate_percent" integer,
        "tax_amount_cents" integer,
        "status" order_item_status NOT NULL DEFAULT 'pending',
        "status_updated_at" timestamptz,
        "prepared_by_user_id" integer REFERENCES "user"("id"),
        "delivered_by_user_id" integer REFERENCES "user"("id"),
        "removed_by_customer" boolean NOT NULL DEFAULT false,
        "removed_at" timestamptz,
        "removed_reason" text,
        "removed_by_user_id" integer REFERENCES "user"("id"),
        "modified_by_user_id" integer REFERENCES "user"("id")
      );

      CREATE TABLE IF NOT EXISTS "order_payment" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "order_id" integer NOT NULL REFERENCES "order"("id") ON DELETE CASCADE,
        "amount_cents" integer NOT NULL,
        "payment_method" varchar(64) NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'completed',
        "created_at" timestamptz NOT NULL DEFAULT now(),
        "created_by_user_id" integer REFERENCES "user"("id")
      );

      CREATE TABLE IF NOT EXISTS "reservation" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "customer_name" varchar(255) NOT NULL,
        "customer_phone" varchar(64),
        "customer_email" varchar(255),
        "party_size" integer NOT NULL,
        "start_time" timestamptz NOT NULL,
        "end_time" timestamptz,
        "table_id" integer REFERENCES "table"("id"),
        "floor_id" integer REFERENCES "floor"("id"),
        "status" reservation_status NOT NULL DEFAULT 'pending',
        "notes" text,
        "seating_preference" varchar(32) DEFAULT 'any',
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "shift" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "start_time" timestamptz NOT NULL,
        "end_time" timestamptz NOT NULL,
        "status" varchar(32) NOT NULL DEFAULT 'scheduled',
        "notes" text,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );

      CREATE TABLE IF NOT EXISTS "work_session" (
        "id" serial PRIMARY KEY,
        "tenant_id" integer NOT NULL REFERENCES "tenant"("id") ON DELETE CASCADE,
        "user_id" integer NOT NULL REFERENCES "user"("id") ON DELETE CASCADE,
        "clock_in" timestamptz NOT NULL,
        "clock_out" timestamptz,
        "total_minutes" integer NOT NULL DEFAULT 0,
        "created_at" timestamptz NOT NULL DEFAULT now()
      );
    `);

    console.log('✅ All Neon Postgres POS tables & types created successfully!');
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
