-- Per-booking UI language for transactional emails (confirmation/reminder), optional.
ALTER TABLE reservation ADD COLUMN IF NOT EXISTS locale VARCHAR(16);
