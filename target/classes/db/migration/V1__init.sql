CREATE TABLE users (
    id                  BIGSERIAL PRIMARY KEY,
    role                VARCHAR(20)  NOT NULL CHECK (role IN ('CUSTOMER', 'VENDOR', 'ADMIN')),
    name                VARCHAR(120) NOT NULL,
    email               VARCHAR(190) NOT NULL UNIQUE,
    password_hash       VARCHAR(255) NOT NULL,
    phone               VARCHAR(30),
    preferred_language  VARCHAR(10)  NOT NULL DEFAULT 'en',
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE vendor_profiles (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT       NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    business_name         VARCHAR(150) NOT NULL,
    description           TEXT,
    -- Coarse, always-public location (e.g. suburb/township name). Safer default than a pin.
    general_area          VARCHAR(150),
    -- Precise coordinates are optional and only ever returned when location_visible = true.
    precise_latitude      DOUBLE PRECISION,
    precise_longitude     DOUBLE PRECISION,
    location_visible      BOOLEAN      NOT NULL DEFAULT false,
    verification_status   VARCHAR(20)  NOT NULL DEFAULT 'UNVERIFIED'
                           CHECK (verification_status IN ('UNVERIFIED', 'PENDING', 'COMMUNITY_VOUCHED', 'VERIFIED')),
    trust_score           DOUBLE PRECISION NOT NULL DEFAULT 0,
    active                BOOLEAN      NOT NULL DEFAULT true,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at            TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_profile_id   BIGINT       NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    name                VARCHAR(150) NOT NULL,
    description         TEXT,
    price               NUMERIC(10,2),
    available           BOOLEAN      NOT NULL DEFAULT true,
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE reviews (
    id                  BIGSERIAL PRIMARY KEY,
    vendor_profile_id   BIGINT   NOT NULL REFERENCES vendor_profiles(id) ON DELETE CASCADE,
    customer_id         BIGINT   NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating              SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment             TEXT,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    -- One review per customer per vendor - the simplest defence against review-bombing / fake reviews.
    UNIQUE (vendor_profile_id, customer_id)
);

CREATE INDEX idx_vendor_profiles_area ON vendor_profiles (general_area);
CREATE INDEX idx_vendor_profiles_active ON vendor_profiles (active);
CREATE INDEX idx_products_vendor ON products (vendor_profile_id);
CREATE INDEX idx_reviews_vendor ON reviews (vendor_profile_id);
