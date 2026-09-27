package com.trustlink.dto;

public record UserProfileResponse(
    Long id,
    String name,
    String email,
    String role
) {}
