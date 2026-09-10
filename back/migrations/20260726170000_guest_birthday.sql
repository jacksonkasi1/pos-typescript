-- Guest birthday capture on reservations (#324).
-- Month/day only (no year) for privacy; tenant settings for marketing/consent.

ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS guest_birthday_month SMALLINT NULL;
ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS guest_birthday_day SMALLINT NULL;
ALTER TABLE reservation
    ADD COLUMN IF NOT EXISTS guest_birthday_marketing_consent BOOLEAN NOT NULL DEFAULT FALSE;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_reservation_guest_birthday_month'
    ) THEN
        ALTER TABLE reservation
            ADD CONSTRAINT ck_reservation_guest_birthday_month
            CHECK (guest_birthday_month IS NULL OR (guest_birthday_month BETWEEN 1 AND 12));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_reservation_guest_birthday_day'
    ) THEN
        ALTER TABLE reservation
            ADD CONSTRAINT ck_reservation_guest_birthday_day
            CHECK (guest_birthday_day IS NULL OR (guest_birthday_day BETWEEN 1 AND 31));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_reservation_guest_birthday_pair'
    ) THEN
        ALTER TABLE reservation
            ADD CONSTRAINT ck_reservation_guest_birthday_pair
            CHECK (
                (guest_birthday_month IS NULL AND guest_birthday_day IS NULL)
                OR (guest_birthday_month IS NOT NULL AND guest_birthday_day IS NOT NULL)
            );
    END IF;
END $$;

ALTER TABLE tenant
    ADD COLUMN IF NOT EXISTS guest_birthday_capture_enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE tenant
    ADD COLUMN IF NOT EXISTS guest_birthday_marketing_enabled BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE tenant
    ADD COLUMN IF NOT EXISTS guest_birthday_consent_text TEXT NULL;
