CREATE TABLE refresh_tokens (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    -- SHA-256 hash of the token, hex-encoded. The raw token is only ever seen by the
    -- client - if this table leaked, it would not hand out usable refresh tokens.
    token_hash          VARCHAR(64)  NOT NULL UNIQUE,
    expires_at          TIMESTAMPTZ  NOT NULL,
    revoked             BOOLEAN      NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_refresh_tokens_user ON refresh_tokens (user_id);
-- Cleans up the common "is this token still usable" lookup; expired/revoked rows are
-- left for now (no scheduled purge yet - see README).
CREATE INDEX idx_refresh_tokens_lookup ON refresh_tokens (token_hash, revoked, expires_at);
