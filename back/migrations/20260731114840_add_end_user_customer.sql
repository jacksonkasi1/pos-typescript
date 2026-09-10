-- End-user customer accounts (separate from staff User and staff BillingCustomer / Factura).
-- See docs/0002-customer-features-plan.md and GitHub #340.

CREATE TABLE IF NOT EXISTS customer (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    full_name VARCHAR(255),
    phone VARCHAR(64),
    business_name VARCHAR(255),
    tax_id VARCHAR(64),
    address TEXT,
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    email_verification_token_hash VARCHAR(64),
    email_verification_sent_at TIMESTAMP WITH TIME ZONE,
    token_version INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_customer_email ON customer (email);
CREATE INDEX IF NOT EXISTS idx_customer_email_verification_token_hash
    ON customer (email_verification_token_hash)
    WHERE email_verification_token_hash IS NOT NULL;

-- Optional link from orders to end-user customer accounts (nullable; Factura uses billing_customer_id).
ALTER TABLE "order" ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customer(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_order_customer ON "order"(customer_id);
