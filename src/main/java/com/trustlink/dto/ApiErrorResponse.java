package com.trustlink.dto;

import java.time.Instant;
import java.util.List;

/** Deliberately generic - never includes stack traces or internal exception messages. */
public record ApiErrorResponse(
    Instant timestamp,
    int status,
    String error,
    List<String> details
) {}
