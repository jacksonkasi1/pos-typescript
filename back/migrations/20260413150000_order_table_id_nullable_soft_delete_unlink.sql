-- Soft-deleted orders are unlinked from tables (nullable FK) so deleting a table is not blocked
-- by orders already removed in the UI (deleted_at set).
ALTER TABLE "order" ALTER COLUMN table_id DROP NOT NULL;

UPDATE "order" SET table_id = NULL WHERE deleted_at IS NOT NULL;
