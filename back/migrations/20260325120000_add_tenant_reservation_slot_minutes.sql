-- Public booking grid step (minutes between offered reservation start times). Null = legacy 15-minute steps.
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS reservation_slot_minutes INTEGER NULL;
