-- Add user roles for RBAC (Role-Based Access Control)
-- Roles: owner, admin, kitchen, waiter, receptionist

-- Add role enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('owner', 'admin', 'kitchen', 'waiter', 'receptionist');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add role column to user table with default 'waiter'
ALTER TABLE "user" ADD COLUMN IF NOT EXISTS role user_role NOT NULL DEFAULT 'waiter';

-- Set existing users (first user per tenant) as owner
-- This ensures the original creator of each tenant becomes the owner
UPDATE "user" u
SET role = 'owner'
WHERE u.id = (
    SELECT MIN(u2.id) FROM "user" u2 WHERE u2.tenant_id = u.tenant_id
);

-- Create index on role for faster permission checks
CREATE INDEX IF NOT EXISTS idx_user_role ON "user" (role);

-- Create index on tenant_id + role for listing users by role within a tenant
CREATE INDEX IF NOT EXISTS idx_user_tenant_role ON "user" (tenant_id, role);
