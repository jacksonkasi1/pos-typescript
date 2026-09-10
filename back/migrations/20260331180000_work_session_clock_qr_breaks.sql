-- Staff clock QR (hashed token on tenant), breaks, manual adjustment audit
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS clock_qr_token_hash VARCHAR(128) NULL;
ALTER TABLE tenant ADD COLUMN IF NOT EXISTS clock_qr_location_verify BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE work_session ADD COLUMN IF NOT EXISTS break_started_at TIMESTAMPTZ NULL;

CREATE TABLE IF NOT EXISTS work_session_break (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    work_session_id INTEGER NOT NULL REFERENCES work_session(id) ON DELETE CASCADE,
    started_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_work_session_break_tenant ON work_session_break(tenant_id, started_at);
CREATE INDEX IF NOT EXISTS idx_work_session_break_session ON work_session_break(work_session_id);

CREATE TABLE IF NOT EXISTS work_session_adjustment (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    work_session_id INTEGER NOT NULL REFERENCES work_session(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    actor_user_id INTEGER REFERENCES "user"(id) ON DELETE SET NULL,
    note TEXT NOT NULL DEFAULT '',
    previous_started_at TIMESTAMP WITH TIME ZONE,
    previous_ended_at TIMESTAMP WITH TIME ZONE,
    new_started_at TIMESTAMP WITH TIME ZONE,
    new_ended_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_work_session_adj_tenant ON work_session_adjustment(tenant_id, created_at);
