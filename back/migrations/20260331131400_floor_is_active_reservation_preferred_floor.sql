-- Public booking zones: hide inactive floors; persist guest zone choice on reservation.
ALTER TABLE floor ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

COMMENT ON COLUMN floor.is_active IS 'When false, floor is hidden from public booking zone list (e.g. closed terrace).';

ALTER TABLE reservation ADD COLUMN IF NOT EXISTS preferred_floor_id INTEGER NULL REFERENCES floor(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS ix_reservation_preferred_floor_id ON reservation (preferred_floor_id);

COMMENT ON COLUMN reservation.preferred_floor_id IS 'Public/staff: seating zone for capacity and display; null = venue-wide / legacy.';
