package com.trustlink.entity;

public enum AuthProvider {
    /** Signed up with email + password through /api/auth/signup. */
    LOCAL,
    GOOGLE,
    FACEBOOK
}
