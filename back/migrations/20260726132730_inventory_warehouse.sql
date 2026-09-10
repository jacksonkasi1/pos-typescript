-- Multi-warehouse inventory (almacenes): tenant-scoped stock locations.

CREATE TABLE IF NOT EXISTS warehouse (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    name VARCHAR NOT NULL,
    code VARCHAR,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_deleted BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS ix_warehouse_tenant_id ON warehouse(tenant_id);
CREATE INDEX IF NOT EXISTS ix_warehouse_tenant_active ON warehouse(tenant_id, is_active)
    WHERE is_deleted = false;

CREATE TABLE IF NOT EXISTS warehouse_stock (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id),
    warehouse_id INTEGER NOT NULL REFERENCES warehouse(id),
    inventory_item_id INTEGER NOT NULL REFERENCES inventory_item(id),
    quantity NUMERIC(12, 4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    CONSTRAINT uq_warehouse_stock_item UNIQUE (warehouse_id, inventory_item_id)
);

CREATE INDEX IF NOT EXISTS ix_warehouse_stock_tenant_id ON warehouse_stock(tenant_id);
CREATE INDEX IF NOT EXISTS ix_warehouse_stock_item ON warehouse_stock(inventory_item_id);
CREATE INDEX IF NOT EXISTS ix_warehouse_stock_warehouse ON warehouse_stock(warehouse_id);

ALTER TABLE inventory_batch
    ADD COLUMN IF NOT EXISTS warehouse_id INTEGER REFERENCES warehouse(id);

CREATE INDEX IF NOT EXISTS ix_inventory_batch_warehouse_id ON inventory_batch(warehouse_id);

ALTER TABLE inventory_transaction
    ADD COLUMN IF NOT EXISTS warehouse_id INTEGER REFERENCES warehouse(id);

CREATE INDEX IF NOT EXISTS ix_inventory_transaction_warehouse_id ON inventory_transaction(warehouse_id);

-- One default "Main" warehouse per tenant that already has inventory data (or any tenant).
INSERT INTO warehouse (tenant_id, name, code, is_default, is_active, is_deleted, created_at, updated_at)
SELECT t.id, 'Main', 'MAIN', true, true, false, NOW(), NOW()
FROM tenant t
WHERE NOT EXISTS (
    SELECT 1 FROM warehouse w WHERE w.tenant_id = t.id AND w.is_deleted = false
);

-- Attribute existing stock to the default warehouse.
INSERT INTO warehouse_stock (tenant_id, warehouse_id, inventory_item_id, quantity, updated_at)
SELECT i.tenant_id, w.id, i.id, i.current_quantity, NOW()
FROM inventory_item i
JOIN warehouse w ON w.tenant_id = i.tenant_id AND w.is_default = true AND w.is_deleted = false
WHERE i.is_deleted = false
  AND NOT EXISTS (
      SELECT 1 FROM warehouse_stock ws
      WHERE ws.warehouse_id = w.id AND ws.inventory_item_id = i.id
  );

UPDATE inventory_batch b
SET warehouse_id = w.id
FROM warehouse w
WHERE b.warehouse_id IS NULL
  AND w.tenant_id = b.tenant_id
  AND w.is_default = true
  AND w.is_deleted = false;

UPDATE inventory_transaction t
SET warehouse_id = w.id
FROM warehouse w
WHERE t.warehouse_id IS NULL
  AND w.tenant_id = t.tenant_id
  AND w.is_default = true
  AND w.is_deleted = false;
