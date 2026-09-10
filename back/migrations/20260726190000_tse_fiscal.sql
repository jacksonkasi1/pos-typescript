-- German TSE (KassenSichV) preparation (#316). Separate from VeriFactu fiscal_mode.
-- See docs/0072-tse-fiscal-compliance.md. Live mode gated by env; no invented BSI certification.

ALTER TABLE tenant ADD COLUMN IF NOT EXISTS fiscal_country VARCHAR(2) NULL;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tse_mode VARCHAR(16) NOT NULL DEFAULT 'off';
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tse_client_id VARCHAR(128) NULL;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tse_api_secret VARCHAR(512) NULL;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tse_serial_number VARCHAR(128) NULL;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tse_signature_counter INTEGER NOT NULL DEFAULT 1;

DO $$ BEGIN
    ALTER TABLE tenant ADD CONSTRAINT tenant_tse_mode_check
      CHECK (tse_mode IN ('off', 'test', 'live'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS tse_transaction (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    order_id INTEGER NOT NULL REFERENCES "order"(id),
    process_type VARCHAR(16) NOT NULL,
    mode VARCHAR(16) NOT NULL,
    tse_serial VARCHAR(128) NOT NULL DEFAULT '',
    signature_counter INTEGER NOT NULL DEFAULT 0,
    signature_value TEXT NOT NULL DEFAULT '',
    qr_content TEXT NOT NULL DEFAULT '',
    process_data TEXT NOT NULL DEFAULT '',
    transaction_number INTEGER NOT NULL DEFAULT 0,
    certificate_serial VARCHAR(128) NOT NULL DEFAULT '',
    time_start TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    time_end TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    amount_cents INTEGER NOT NULL DEFAULT 0,
    request_payload JSONB,
    response_payload JSONB,
    submission_status VARCHAR(32) NOT NULL DEFAULT 'local_stub',
    storno_of_tse_transaction_id INTEGER NULL REFERENCES tse_transaction(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_tse_transaction_tenant_order_sale
  ON tse_transaction (tenant_id, order_id)
  WHERE process_type = 'sale';

CREATE INDEX IF NOT EXISTS ix_tse_transaction_tenant_id ON tse_transaction(tenant_id);
CREATE INDEX IF NOT EXISTS ix_tse_transaction_order_id ON tse_transaction(order_id);
CREATE INDEX IF NOT EXISTS ix_tse_transaction_tenant_time
  ON tse_transaction (tenant_id, time_start);

DO $$ BEGIN
    ALTER TABLE tse_transaction ADD CONSTRAINT tse_transaction_process_type_check
      CHECK (process_type IN ('sale', 'storno', 'refund'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
