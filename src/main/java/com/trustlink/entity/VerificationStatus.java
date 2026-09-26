package com.trustlink.entity;

/**
 * Tiered verification, not a single pass/fail ID check.
 * Many informal traders don't hold the formal documents a bank-grade KYC flow would
 * demand, so COMMUNITY_VOUCHED gives them a credible standing before/instead of
 * full document verification.
 */
public enum VerificationStatus {
    UNVERIFIED,
    PENDING,
    COMMUNITY_VOUCHED,
    VERIFIED
}
