package com.trustlink.dto;

import java.time.Instant;

public record VerificationDocumentResponse(
    Long id,
    String originalFileName,
    String contentType,
    String documentType,
    long sizeBytes,
    Instant uploadedAt
) {}
