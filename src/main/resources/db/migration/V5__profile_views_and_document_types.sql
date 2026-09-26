-- Backs the "vendor discoveries" / competitive-differentiation metrics from the
-- business canvas with an actual number, rather than leaving them as unmeasured claims.
ALTER TABLE vendor_profiles ADD COLUMN profile_view_count BIGINT NOT NULL DEFAULT 0;

-- Lets a vendor's evidence be reviewed as "an ID document" or "a trading permit"
-- rather than an undifferentiated file - mirrors the categories a real verification
-- process (e.g. the Johannesburg Home Affairs-linked trader permit system) uses.
ALTER TABLE verification_documents
    ADD COLUMN document_type VARCHAR(20) NOT NULL DEFAULT 'OTHER'
        CHECK (document_type IN ('ID_DOCUMENT', 'PROOF_OF_ADDRESS', 'TRADING_PERMIT', 'OTHER'));
