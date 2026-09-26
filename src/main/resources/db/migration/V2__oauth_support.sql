-- OAuth-only accounts never set a local password.
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

ALTER TABLE users
    ADD COLUMN auth_provider VARCHAR(20) NOT NULL DEFAULT 'LOCAL'
        CHECK (auth_provider IN ('LOCAL', 'GOOGLE', 'FACEBOOK')),
    ADD COLUMN provider_id VARCHAR(190);

-- A given provider account (e.g. this exact Google "sub") maps to exactly one user.
-- Postgres treats NULLs as distinct, so existing LOCAL rows (provider_id = NULL) are
-- unaffected by this constraint.
CREATE UNIQUE INDEX idx_users_provider_identity ON users (auth_provider, provider_id);
