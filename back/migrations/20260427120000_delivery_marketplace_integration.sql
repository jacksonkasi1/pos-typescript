-- Delivery marketplace integrations (Uber Eats, Glovo, Deliveroo-style): settings + ingest + mappings

CREATE TABLE IF NOT EXISTS delivery_marketplace_integration (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    provider_key VARCHAR(64) NOT NULL,
    connection_status VARCHAR(32) NOT NULL DEFAULT 'disconnected',
    credentials_encrypted TEXT,
    external_store_id VARCHAR(256),
    enabled BOOLEAN NOT NULL DEFAULT FALSE,
    webhook_ingest_token VARCHAR(64) NOT NULL,
    last_test_at TIMESTAMPTZ,
    last_test_ok BOOLEAN,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (tenant_id, provider_key),
    UNIQUE (webhook_ingest_token)
);

CREATE INDEX IF NOT EXISTS ix_delivery_integration_tenant
    ON delivery_marketplace_integration (tenant_id);

CREATE TABLE IF NOT EXISTS delivery_catalog_mapping (
    id SERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    integration_id INT NOT NULL REFERENCES delivery_marketplace_integration(id) ON DELETE CASCADE,
    external_item_id VARCHAR(256) NOT NULL,
    product_id INT REFERENCES product(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (integration_id, external_item_id)
);

CREATE INDEX IF NOT EXISTS ix_delivery_catalog_mapping_tenant
    ON delivery_catalog_mapping (tenant_id);

CREATE TABLE IF NOT EXISTS delivery_integration_event_log (
    id BIGSERIAL PRIMARY KEY,
    tenant_id INT NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    integration_id INT REFERENCES delivery_marketplace_integration(id) ON DELETE SET NULL,
    provider_key VARCHAR(64) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    summary TEXT,
    detail JSONB,
    success BOOLEAN NOT NULL DEFAULT TRUE,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_delivery_event_log_tenant_created
    ON delivery_integration_event_log (tenant_id, created_at DESC);

ALTER TABLE "order" ADD COLUMN IF NOT EXISTS delivery_integration_id INT
    REFERENCES delivery_marketplace_integration(id) ON DELETE SET NULL;
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS external_order_ref VARCHAR(256);

CREATE INDEX IF NOT EXISTS ix_order_delivery_integration
    ON "order" (delivery_integration_id)
    WHERE delivery_integration_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS uq_order_delivery_external
    ON "order" (delivery_integration_id, external_order_ref)
    WHERE delivery_integration_id IS NOT NULL
      AND external_order_ref IS NOT NULL
      AND deleted_at IS NULL;
