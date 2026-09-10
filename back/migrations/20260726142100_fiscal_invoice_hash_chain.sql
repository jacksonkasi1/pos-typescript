-- VeriFactu production path (#326): hash chain, record type (alta/anulacion), sandbox submission metadata.
-- Official AEAT huella algorithm is middleware/spec-owned; POS stores an internal chain (pos.fiscal.hash.v1).
-- See docs/0065-verifactu-production.md

ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS record_type VARCHAR(16) NOT NULL DEFAULT 'alta';
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS previous_hash VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS record_hash VARCHAR(64) NOT NULL DEFAULT '';
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS cancels_fiscal_invoice_id INTEGER NULL REFERENCES fiscal_invoice(id);
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS amount_cents INTEGER NOT NULL DEFAULT 0;
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS submission_status VARCHAR(32) NOT NULL DEFAULT 'local_only';
ALTER TABLE fiscal_invoice ADD COLUMN IF NOT EXISTS sandbox_submitted_at TIMESTAMPTZ NULL;

-- Replace one-row-per-order uniqueness with one *alta* per order (anulaciones are additional rows).
ALTER TABLE fiscal_invoice DROP CONSTRAINT IF EXISTS uq_fiscal_invoice_tenant_order;

CREATE UNIQUE INDEX IF NOT EXISTS uq_fiscal_invoice_tenant_order_alta
  ON fiscal_invoice (tenant_id, order_id)
  WHERE record_type = 'alta';

CREATE INDEX IF NOT EXISTS ix_fiscal_invoice_tenant_issued_at
  ON fiscal_invoice (tenant_id, issued_at);

DO $$ BEGIN
    ALTER TABLE fiscal_invoice ADD CONSTRAINT fiscal_invoice_record_type_check
      CHECK (record_type IN ('alta', 'anulacion'));
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
