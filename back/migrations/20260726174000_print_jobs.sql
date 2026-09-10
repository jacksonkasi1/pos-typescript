-- Hardware printing MVP (#317): LAN print agents + queued print jobs.

CREATE TABLE IF NOT EXISTS print_agent (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    device_id VARCHAR(64) NOT NULL,
    display_name VARCHAR(120) NOT NULL DEFAULT 'Print agent',
    token_hash VARCHAR(64) NOT NULL,
    last_seen_at TIMESTAMPTZ NULL,
    revoked_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_print_agent_tenant_device UNIQUE (tenant_id, device_id),
    CONSTRAINT uq_print_agent_token_hash UNIQUE (token_hash)
);

CREATE INDEX IF NOT EXISTS ix_print_agent_tenant ON print_agent (tenant_id);
CREATE INDEX IF NOT EXISTS ix_print_agent_tenant_last_seen ON print_agent (tenant_id, last_seen_at DESC);

CREATE TABLE IF NOT EXISTS print_job (
    id SERIAL PRIMARY KEY,
    tenant_id INTEGER NOT NULL REFERENCES tenant(id) ON DELETE CASCADE,
    job_type VARCHAR(16) NOT NULL,
    printer_role VARCHAR(32) NOT NULL DEFAULT 'receipt',
    status VARCHAR(16) NOT NULL DEFAULT 'pending',
    order_id INTEGER NULL REFERENCES "order"(id) ON DELETE SET NULL,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_by_user_id INTEGER NULL REFERENCES "user"(id) ON DELETE SET NULL,
    claimed_by_agent_id INTEGER NULL REFERENCES print_agent(id) ON DELETE SET NULL,
    claimed_at TIMESTAMPTZ NULL,
    completed_at TIMESTAMPTZ NULL,
    error_message VARCHAR(500) NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT ck_print_job_type CHECK (job_type IN ('kitchen', 'receipt')),
    CONSTRAINT ck_print_job_status CHECK (
        status IN ('pending', 'claimed', 'done', 'failed', 'cancelled')
    )
);

CREATE INDEX IF NOT EXISTS ix_print_job_tenant_created ON print_job (tenant_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ix_print_job_tenant_status ON print_job (tenant_id, status);
CREATE INDEX IF NOT EXISTS ix_print_job_pending
    ON print_job (tenant_id, status, created_at)
    WHERE status = 'pending';
