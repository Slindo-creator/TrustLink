package com.trustlink.dto;

import com.trustlink.entity.VerificationStatus;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record VerificationDecisionRequest(
    @NotNull VerificationStatus status,
    // Internal note for the audit trail (e.g. "ID + utility bill checked", "vouched by
    // 3 existing verified vendors in the same market") - never shown to the vendor's
    // public profile, just kept for accountability on the decision.
    @Size(max = 500) String note
) {}
