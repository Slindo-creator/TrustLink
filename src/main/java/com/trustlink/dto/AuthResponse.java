package com.trustlink.dto;

public record AuthResponse(
    String token,
    long expiresInSeconds,
    // Null from endpoints that reissue an access token without touching the session's
    // refresh token (e.g. become-vendor) - the client keeps using its existing one.
    String refreshToken,
    Long userId,
    String role,
    String name
) {}
