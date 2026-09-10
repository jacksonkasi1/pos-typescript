-- Tenant: optional cap on total guests bookable per time slot (in addition to physical table pool).
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS reservation_max_guests_per_slot INTEGER NULL;

COMMENT ON COLUMN tenant.reservation_max_guests_per_slot IS 'When set (>0), caps total guests per slot to min(physical pool, this value).';

-- Reservation: meal service, seating preference, allergies (public/staff booking).
ALTER TABLE reservation ADD COLUMN IF NOT EXISTS service_type VARCHAR(16) NULL;
ALTER TABLE reservation ADD COLUMN IF NOT EXISTS seating_preference VARCHAR(32) NULL;
ALTER TABLE reservation ADD COLUMN IF NOT EXISTS allergies_has BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE reservation ADD COLUMN IF NOT EXISTS allergies_detail TEXT NULL;
