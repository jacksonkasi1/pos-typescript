-- Loyalty Club Apple/Google Wallet pass issuance (#343).
-- Shared platform certs/issuer via env; per-tenant can disable wallet passes.
-- Device registrations power PassKit push-update (updated pass, not reissue).

ALTER TABLE loyalty_program
    ADD COLUMN IF NOT EXISTS wallet_passes_enabled BOOLEAN NOT NULL DEFAULT TRUE;

ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS apple_pass_serial VARCHAR(64);
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS apple_auth_token VARCHAR(64);
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS apple_pass_updated_tag VARCHAR(64);
ALTER TABLE loyalty_membership
    ADD COLUMN IF NOT EXISTS google_loyalty_object_id VARCHAR(200);

CREATE UNIQUE INDEX IF NOT EXISTS uq_loyalty_membership_apple_pass_serial
    ON loyalty_membership (apple_pass_serial)
    WHERE apple_pass_serial IS NOT NULL;

CREATE TABLE IF NOT EXISTS loyalty_apple_device (
    id SERIAL PRIMARY KEY,
    membership_id INTEGER NOT NULL REFERENCES loyalty_membership(id) ON DELETE CASCADE,
    device_library_identifier VARCHAR(128) NOT NULL,
    push_token VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_loyalty_apple_device_membership_device
        UNIQUE (membership_id, device_library_identifier)
);

CREATE INDEX IF NOT EXISTS ix_loyalty_apple_device_membership
    ON loyalty_apple_device (membership_id);
CREATE INDEX IF NOT EXISTS ix_loyalty_apple_device_library
    ON loyalty_apple_device (device_library_identifier);
