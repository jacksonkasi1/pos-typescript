-- Offline cash order sync: idempotency ledger for staff offline → online flush (#319).

CREATE TABLE IF NOT EXISTS offline_order_idempotency (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    idempotency_key VARCHAR(64) NOT NULL,
    order_id INTEGER NOT NULL REFERENCES "order"(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_offline_order_idempotency_tenant_key UNIQUE (tenant_id, idempotency_key)
);

CREATE INDEX IF NOT EXISTS ix_offline_order_idempotency_tenant_id
    ON offline_order_idempotency(tenant_id);

CREATE INDEX IF NOT EXISTS ix_offline_order_idempotency_order_id
    ON offline_order_idempotency(order_id);
