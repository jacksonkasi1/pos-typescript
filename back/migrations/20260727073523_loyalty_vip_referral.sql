-- Loyalty VIP tiers + referral rewards (#334).
-- VIP is based on lifetime earn (positive earn ledger units), not current balance.
-- Referral awards the referrer once when a new member joins with their referral code.

ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS vip_silver_min_lifetime_units INTEGER NOT NULL DEFAULT 0;
ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS vip_gold_min_lifetime_units INTEGER NOT NULL DEFAULT 0;
ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS referral_bonus_units INTEGER NOT NULL DEFAULT 0;
ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS referral_invitee_bonus_units INTEGER NOT NULL DEFAULT 0;

ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS lifetime_earn_units INTEGER NOT NULL DEFAULT 0;
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS referral_code VARCHAR(32);
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS referred_by_membership_id INTEGER NULL
        REFERENCES loyalty_membership(id) ON DELETE SET NULL;
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS referral_reward_granted BOOLEAN NOT NULL DEFAULT FALSE;

-- Backfill referral codes for existing members (opaque, unique).
UPDATE loyalty_membership
SET referral_code = substr(md5(random()::text || id::text || clock_timestamp()::text), 1, 16)
WHERE referral_code IS NULL OR referral_code = '';

ALTER TABLE loyalty_membership
    ALTER COLUMN referral_code SET NOT NULL;

-- Backfill lifetime earn from ledger (earn rows with positive units only).
UPDATE loyalty_membership m
SET lifetime_earn_units = COALESCE((
    SELECT SUM(e.units)
    FROM loyalty_ledger_entry e
    WHERE e.membership_id = m.id
      AND e.entry_type = 'earn'
      AND e.units > 0
), 0);

CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_membership_referral_code
    ON loyalty_membership (referral_code);

CREATE INDEX IF NOT EXISTS ix_loyalty_membership_referred_by
    ON loyalty_membership (referred_by_membership_id);

-- One referral-reward ledger row per referred membership (note encodes invitee id).
CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_ledger_referral_reward_note
    ON loyalty_ledger_entry (tenant_id, note)
    WHERE entry_type = 'earn' AND note LIKE 'Referral reward for membership %';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_program_vip_silver'
    ) THEN
        ALTER TABLE loyalty_program
            ADD CONSTRAINT ck_loyalty_program_vip_silver
            CHECK (vip_silver_min_lifetime_units >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_program_vip_gold'
    ) THEN
        ALTER TABLE loyalty_program
            ADD CONSTRAINT ck_loyalty_program_vip_gold
            CHECK (vip_gold_min_lifetime_units >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_program_referral_bonus'
    ) THEN
        ALTER TABLE loyalty_program
            ADD CONSTRAINT ck_loyalty_program_referral_bonus
            CHECK (referral_bonus_units >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_program_referral_invitee'
    ) THEN
        ALTER TABLE loyalty_program
            ADD CONSTRAINT ck_loyalty_program_referral_invitee
            CHECK (referral_invitee_bonus_units >= 0);
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'ck_loyalty_membership_lifetime_earn'
    ) THEN
        ALTER TABLE loyalty_membership
            ADD CONSTRAINT ck_loyalty_membership_lifetime_earn
            CHECK (lifetime_earn_units >= 0);
    END IF;
END $$;
