-- Tip entry mode (preset % vs overpayment difference) and per-order tip attribution (GitHub #123)
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS tip_entry_mode VARCHAR(32) NOT NULL DEFAULT 'preset';

ALTER TABLE "order" ADD COLUMN IF NOT EXISTS tip_attributed_user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS ix_order_tip_attributed_user_id ON "order"(tip_attributed_user_id);
