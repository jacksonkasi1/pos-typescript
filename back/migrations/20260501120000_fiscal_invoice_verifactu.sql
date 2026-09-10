-- VeriFactu-ready fiscal invoicing: per-tenant mode and persisted issued documents.
-- AEAT submission payloads/endpoints are not wired here; see docs/0018-verifactu-fiscal-invoicing.md
-- Idempotent: safe when fiscal_invoice table exists but tenant columns were never added.

ALTER TABLE tenant ADD COLUMN IF NOT EXISTS fiscal_mode VARCHAR(16) NOT NULL DEFAULT 'off';
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS fiscal_invoice_series VARCHAR(32) NOT NULL DEFAULT 'VF';
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS fiscal_invoice_next_number INTEGER NOT NULL DEFAULT 1;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS fiscal_aeat_api_secret VARCHAR(512) NULL;

DO $$ BEGIN
    ALTER TABLE tenant ADD CONSTRAINT tenant_fiscal_mode_check
      CHECK (fiscal_mode IN ('off', 'test', 'live'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS fiscal_invoice (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    order_id INTEGER NOT NULL REFERENCES "order"(id),
    series VARCHAR(32) NOT NULL,
    doc_number INTEGER NOT NULL,
    full_number VARCHAR(64) NOT NULL,
    mode VARCHAR(16) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'issued',
    issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    request_payload JSONB,
    response_payload JSONB,
    verification_qr_content TEXT NOT NULL DEFAULT '',
    verification_text TEXT NOT NULL DEFAULT '',
    CONSTRAINT uq_fiscal_invoice_tenant_order UNIQUE (tenant_id, order_id)
);

CREATE INDEX IF NOT EXISTS ix_fiscal_invoice_tenant_id ON fiscal_invoice(tenant_id);
