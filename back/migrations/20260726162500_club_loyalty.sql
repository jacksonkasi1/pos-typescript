-- Club loyalty MVP (#327): program, membership, append-only ledger, order redemption fields.

CREATE TABLE IF NOT EXISTS loyalty_program (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    program_name VARCHAR(120) NOT NULL DEFAULT 'Club',
    mode VARCHAR(16) NOT NULL DEFAULT 'points',
    earn_units_per_order INTEGER NOT NULL DEFAULT 1,
    redemption_threshold INTEGER NOT NULL DEFAULT 10,
    reward_discount_cents INTEGER NOT NULL DEFAULT 500,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_loyalty_program_tenant UNIQUE (tenant_id),
    CONSTRAINT ck_loyalty_program_mode CHECK (mode IN ('points', 'stamps')),
    CONSTRAINT ck_loyalty_program_earn CHECK (earn_units_per_order >= 0),
    CONSTRAINT ck_loyalty_program_threshold CHECK (redemption_threshold >= 1),
    CONSTRAINT ck_loyalty_program_reward CHECK (reward_discount_cents >= 0)
);

CREATE INDEX IF NOT EXISTS ix_loyalty_program_tenant ON loyalty_program (tenant_id);

CREATE TABLE IF NOT EXISTS loyalty_membership (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    program_id INTEGER NOT NULL REFERENCES loyalty_program(id) ON DELETE CASCADE,
    billing_customer_id INTEGER NULL REFERENCES billing_customer(id) ON DELETE SET NULL,
    display_name VARCHAR(200) NOT NULL,
    email VARCHAR(320) NULL,
    phone VARCHAR(40) NULL,
    member_token VARCHAR(64) NOT NULL,
    balance INTEGER NOT NULL DEFAULT 0,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_loyalty_membership_token UNIQUE (member_token),
    CONSTRAINT ck_loyalty_membership_balance CHECK (balance >= 0)
);

CREATE INDEX IF NOT EXISTS ix_loyalty_membership_tenant ON loyalty_membership (tenant_id);
CREATE INDEX IF NOT EXISTS ix_loyalty_membership_program ON loyalty_membership (program_id);
CREATE INDEX IF NOT EXISTS ix_loyalty_membership_email ON loyalty_membership (tenant_id, email);
CREATE INDEX IF NOT EXISTS ix_loyalty_membership_phone ON loyalty_membership (tenant_id, phone);
CREATE INDEX IF NOT EXISTS ix_loyalty_membership_billing ON loyalty_membership (billing_customer_id);

CREATE TABLE IF NOT EXISTS loyalty_ledger_entry (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    membership_id INTEGER NOT NULL REFERENCES loyalty_membership(id) ON DELETE CASCADE,
    entry_type VARCHAR(16) NOT NULL,
    units INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    order_id INTEGER NULL REFERENCES "order"(id) ON DELETE SET NULL,
    note VARCHAR(500) NULL,
    created_by_user_id INTEGER NULL REFERENCES "user"(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_loyalty_ledger_type CHECK (entry_type IN ('earn', 'redeem', 'adjust')),
    CONSTRAINT ck_loyalty_ledger_balance_after CHECK (balance_after >= 0)
);

CREATE INDEX IF NOT EXISTS ix_loyalty_ledger_membership_created
    ON loyalty_ledger_entry (membership_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_loyalty_ledger_tenant_created
    ON loyalty_ledger_entry (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_loyalty_ledger_order ON loyalty_ledger_entry (order_id);

-- One earn (or redeem) ledger row per order when linked (idempotent award on paid).
CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_ledger_earn_order
    ON loyalty_ledger_entry (order_id, entry_type)
    WHERE order_id IS NOT NULL AND entry_type = 'earn';

ALTER TABLE "order"
    ADD COLUMN IF NOT EXISTS loyalty_membership_id INTEGER NULL
        REFERENCES loyalty_membership(id) ON DELETE SET NULL;
ALTER TABLE "order"
    ADD COLUMN IF NOT EXISTS loyalty_discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "order"
    ADD COLUMN IF NOT EXISTS loyalty_units_redeemed INTEGER NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS ix_order_loyalty_membership ON "order" (loyalty_membership_id);
