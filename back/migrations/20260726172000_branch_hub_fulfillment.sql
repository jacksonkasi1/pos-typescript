-- Central kitchen hub + branch fulfillment records (#323)
-- Extends restaurant groups; aligns vocabulary with warehouses (#320) — see docs/0069-branch-hub-fulfillment.md

ALTER TABLE restaurant_group
    ADD COLUMN IF NOT EXISTS hub_tenant_id INTEGER NULL REFERENCES tenant(id);

CREATE TABLE IF NOT EXISTS branch_hub_fulfillment (
    id SERIAL PRIMARY KEY,
    group_id INTEGER NOT NULL REFERENCES restaurant_group(id) ON DELETE CASCADE,
    order_id INTEGER NOT NULL UNIQUE REFERENCES "order"(id) ON DELETE CASCADE,
    branch_tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    hub_tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    status VARCHAR(32) NOT NULL DEFAULT 'requested',
    notes TEXT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    prepared_at TIMESTAMP WITH TIME ZONE NULL,
    created_by_user_id INTEGER NULL REFERENCES "user"(id),
    prepared_by_user_id INTEGER NULL REFERENCES "user"(id),
    CONSTRAINT branch_hub_fulfillment_status_check CHECK (
        status IN ('requested', 'preparing', 'prepared_at_hq', 'cancelled')
    )
);

CREATE INDEX IF NOT EXISTS idx_branch_hub_fulfillment_hub
    ON branch_hub_fulfillment(hub_tenant_id, status);

CREATE INDEX IF NOT EXISTS idx_branch_hub_fulfillment_branch
    ON branch_hub_fulfillment(branch_tenant_id);

CREATE INDEX IF NOT EXISTS idx_branch_hub_fulfillment_group
    ON branch_hub_fulfillment(group_id);
