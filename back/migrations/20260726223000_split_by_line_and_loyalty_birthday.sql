-- Overnight completeness (#331): split-bill by line (#318) + loyalty birthday bonus (#327).

-- Line allocations for payment legs (an order item may appear on at most one active payment).
CREATE TABLE IF NOT EXISTS order_payment_item (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    order_payment_id INTEGER NOT NULL REFERENCES order_payment(id) ON DELETE CASCADE,
    order_item_id INTEGER NOT NULL REFERENCES orderitem(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    CONSTRAINT ck_order_payment_item_amount CHECK (amount_cents > 0)
);

CREATE INDEX IF NOT EXISTS ix_order_payment_item_payment
    ON order_payment_item (order_payment_id);
CREATE INDEX IF NOT EXISTS ix_order_payment_item_order_item
    ON order_payment_item (order_item_id);
CREATE UNIQUE INDEX IF NOT EXISTS uq_order_payment_item_active_line
    ON order_payment_item (order_item_id);

-- Loyalty birthday bonus (units awarded once per calendar year when linked member pays on birthday).
ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS birthday_bonus_units INTEGER NOT NULL DEFAULT 0;

ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS birthday_month INTEGER NULL;
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS birthday_day INTEGER NULL;
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS birthday_bonus_year INTEGER NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_program_birthday_bonus'
    ) THEN
        ALTER TABLE loyalty_program
            ADD CONSTRAINT ck_loyalty_program_birthday_bonus
            CHECK (birthday_bonus_units >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_membership_birthday_month'
    ) THEN
        ALTER TABLE loyalty_membership
            ADD CONSTRAINT ck_loyalty_membership_birthday_month
            CHECK (birthday_month IS NULL OR (birthday_month >= 1 AND birthday_month <= 12));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_membership_birthday_day'
    ) THEN
        ALTER TABLE loyalty_membership
            ADD CONSTRAINT ck_loyalty_membership_birthday_day
            CHECK (birthday_day IS NULL OR (birthday_day >= 1 AND birthday_day <= 31));
    END IF;
END $$;
