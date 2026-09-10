-- Tenant-defined product subcategory names per category (JSONB map category -> string[]).
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS custom_subcategories JSONB NULL;

COMMENT ON COLUMN tenant.custom_subcategories IS
  'Tenant-scoped subcategory names by category, e.g. {"Starters":["House Special"]}';
