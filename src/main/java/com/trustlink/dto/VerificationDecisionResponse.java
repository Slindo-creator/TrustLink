package com.trustlink.dto;

import java.time.Instant;

public record VerificationDecisionResponse(
    Long id,
    String decidedByName,
    String previousStatus,
    String newStatus,
    String note,
    Instant createdAt
) {}
