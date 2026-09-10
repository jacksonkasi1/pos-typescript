-- Classify floors for reservation seating (indoor / outdoor / any) vs preference (indoor / terrace / no preference).
ALTER TABLE floor ADD COLUMN IF NOT EXISTS seating_zone VARCHAR(16) NOT NULL DEFAULT 'any';

COMMENT ON COLUMN floor.seating_zone IS 'Reservation zone type: indoor, outdoor, or any (matches both indoor and terrace preferences).';

UPDATE floor SET seating_zone = 'any' WHERE seating_zone IS NULL OR trim(seating_zone) = '';
