-- Split bill / partial payments (#318): append-only payment legs per order.

CREATE TABLE IF NOT EXISTS order_payment (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    payment_method VARCHAR(32) NOT NULL,
    payer_label VARCHAR(120) NULL,
    tip_amount_cents INTEGER NULL,
    stripe_payment_intent_id VARCHAR(128) NULL,
    paid_by_user_id INTEGER NULL REFERENCES "user"(id) ON DELETE SET NULL,
    paid_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    voided_at TIMESTAMPTZ NULL,
    note VARCHAR(500) NULL,
    CONSTRAINT ck_order_payment_amount CHECK (amount_cents > 0),
    CONSTRAINT ck_order_payment_tip CHECK (tip_amount_cents IS NULL OR tip_amount_cents >= 0)
);

CREATE INDEX IF NOT EXISTS ix_order_payment_order ON order_payment (order_id);
CREATE INDEX IF NOT EXISTS ix_order_payment_tenant_paid ON order_payment (tenant_id, paid_at DESC);
CREATE INDEX IF NOT EXISTS ix_order_payment_order_active
    ON order_payment (order_id)
    WHERE voided_at IS NULL;
