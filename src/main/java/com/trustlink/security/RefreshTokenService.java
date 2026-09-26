package com.trustlink.security;

import com.trustlink.entity.RefreshToken;
import com.trustlink.entity.User;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.RefreshTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;

/**
 * Opaque, DB-backed refresh tokens - deliberately not JWTs. A JWT refresh token would
 * still be valid (and unrevocable) until it expires even if we wanted to kill a
 * session early; storing a hash server-side lets logout / "sign out everywhere" /
 * a suspected-compromise response actually work.
 *
 * Rotation: every refresh call issues a new token and immediately revokes the one that
 * was just used. That makes a captured-and-replayed old refresh token detectable (its
 * hash will already be revoked in the DB) rather than silently reusable forever.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final RefreshTokenRepository refreshTokenRepository;

    @Value("${app.jwt.refresh-expiration-days:30}")
    private long refreshExpirationDays;

    /** Returns the raw token to hand to the client - only the hash is ever persisted. */
    @Transactional
    public String issue(User user) {
        byte[] bytes = new byte[32];
        RANDOM.nextBytes(bytes);
        String rawToken = Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);

        RefreshToken token = RefreshToken.builder()
            .user(user)
            .tokenHash(hash(rawToken))
            .expiresAt(Instant.now().plus(Duration.ofDays(refreshExpirationDays)))
            .build();
        refreshTokenRepository.save(token);

        return rawToken;
    }

    /**
     * Validates the presented raw token, revokes it, and returns the user it belonged
     * to so the caller can issue a fresh access token + a fresh refresh token.
     */
    @Transactional
    public User consumeForRotation(String rawToken) {
        RefreshToken token = refreshTokenRepository.findByTokenHash(hash(rawToken))
            .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token."));

        if (!token.isUsable()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token.");
        }

        token.setRevoked(true);
        refreshTokenRepository.save(token);
        return token.getUser();
    }

    @Transactional
    public void revoke(String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
            .ifPresent(token -> {
                token.setRevoked(true);
                refreshTokenRepository.save(token);
            });
        // Deliberately silent if the token isn't found - logout should behave the
        // same whether the token was already invalid or never existed at all.
    }

    private String hash(String rawToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (NoSuchAlgorithmException e) {
            // SHA-256 is guaranteed available on every JVM - this branch is unreachable.
            throw new IllegalStateException(e);
        }
    }
}
