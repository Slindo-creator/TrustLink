package com.trustlink.dto;

import java.time.Instant;

public record ReviewResponse(
    Long id,
    String customerName,
    int rating,
    String comment,
    Instant createdAt
) {}
