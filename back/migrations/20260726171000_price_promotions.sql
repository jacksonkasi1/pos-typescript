-- Price promotions MVP (#322): %-off category with time/channel eligibility + line audit.

CREATE TABLE IF NOT EXISTS price_promotion (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    name VARCHAR(120) NOT NULL,
    promo_type VARCHAR(32) NOT NULL DEFAULT 'percent_off_category',
    percent_off INTEGER NOT NULL,
    category VARCHAR(120) NOT NULL,
    channels JSONB NULL,
    starts_at TIMESTAMPTZ NULL,
    ends_at TIMESTAMPTZ NULL,
    days_of_week JSONB NULL,
    start_time_local VARCHAR(5) NULL,
    end_time_local VARCHAR(5) NULL,
    stackable BOOLEAN NOT NULL DEFAULT FALSE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_price_promotion_type CHECK (promo_type IN ('percent_off_category')),
    CONSTRAINT ck_price_promotion_percent CHECK (percent_off >= 1 AND percent_off <= 100)
);

CREATE INDEX IF NOT EXISTS ix_price_promotion_tenant ON price_promotion (tenant_id);
CREATE INDEX IF NOT EXISTS ix_price_promotion_tenant_enabled ON price_promotion (tenant_id, enabled);

ALTER TABLE orderitem
    ADD COLUMN IF NOT EXISTS list_price_cents INTEGER NULL;
ALTER TABLE orderitem
    ADD COLUMN IF NOT EXISTS discount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE orderitem
    ADD COLUMN IF NOT EXISTS promo_id INTEGER NULL REFERENCES price_promotion(id) ON DELETE SET NULL;
ALTER TABLE orderitem
    ADD COLUMN IF NOT EXISTS promo_snapshot JSONB NULL;

CREATE INDEX IF NOT EXISTS ix_orderitem_promo ON orderitem (promo_id);
