CREATE TABLE verification_decisions (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_profile_id   BIGINT      NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    decided_by_user_id  BIGINT      NOT NULL REFERENCES users(id),
    previous_status     VARCHAR(20) NOT NULL,
    new_status          VARCHAR(20) NOT NULL,
    note                TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_decisions_vendor ON verification_decisions (vendor_profile_id);

CREATE TABLE verification_documents (
    id                    BIGSERIAL PRIMARY KEY,
    vendor_profile_id     BIGINT       NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    -- Randomly generated name the file is actually stored under on disk - never the
    -- vendor-supplied original name, so nothing user-controlled ever becomes a path.
    stored_file_name      VARCHAR(80)  NOT NULL UNIQUE,
    original_file_name    VARCHAR(255) NOT NULL,
    content_type          VARCHAR(100) NOT NULL,
    size_bytes            BIGINT       NOT NULL,
    uploaded_at           TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE INDEX idx_verification_documents_vendor ON verification_documents (vendor_profile_id);
