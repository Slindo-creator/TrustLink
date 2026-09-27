package com.trustlink.security;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.util.Date;

import javax.crypto.SecretKey;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import jakarta.servlet.http.HttpServletRequest;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    private final SecretKey key;
    private final long jwtExpirationMs;

    public JwtUtils(
            @Value("${app.jwt.secret}") String jwtSecret,
            @Value("${app.jwt.expiration-ms}") long jwtExpirationMs
    ) {
        // The configured secret is a plain string (see application.yml / the local
        // profile template), not Base64 - it commonly contains characters like '_'
        // that aren't valid Base64, so decoding it as Base64 would throw on every
        // single request. Use its raw UTF-8 bytes as key material instead, same as
        // the rest of this project's config documents.
        if (jwtSecret == null || jwtSecret.getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret must be set to a random value of at least 32 bytes. " +
                            "Set the JWT_SECRET environment variable (or app.jwt.secret in your local " +
                            "profile) - do not use a short or default value in any real environment."
            );
        }
        this.key = Keys.hmacShaKeyFor(jwtSecret.getBytes(StandardCharsets.UTF_8));
        this.jwtExpirationMs = jwtExpirationMs;
    }

    public String getJwtFromHeader(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");

        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7).trim();
            return token.isEmpty() ? null : token;
        }

        return null;
    }

    /**
     * Issues an access token. The "role" claim is a convenience for clients (e.g. so a
     * frontend can render the right nav without an extra call) - it is NOT what
     * authorization decisions are based on. Every request still re-loads the user's
     * current role from the database via AppUserDetailsService/AuthTokenFilter, so a
     * role change (e.g. become-vendor, or an admin revoking access) takes effect on the
     * very next request rather than waiting for this token to expire.
     */
    public String generateToken(Long userId, String email, String role) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim("uid", userId)
                .claim("role", role)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + jwtExpirationMs))
                .signWith(key)
                .compact();
    }

    public long expirationSeconds() {
        return jwtExpirationMs / 1000;
    }

    public String getUsernameFromToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public Key key() {
        return key;
    }

    public boolean validateToken(String authToken) {
        try {
            Jwts.parser().verifyWith(key).build()
                    .parseSignedClaims(authToken);
            return true;
        } catch (JwtException e) {
            // Covers malformed, expired, unsupported, and bad-signature tokens -
            // JwtException is the common superclass for all of JJWT's parsing/
            // verification failures, so this also catches tampered signatures.
            log.debug("Rejected JWT: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.debug("Rejected JWT - empty or malformed claims: {}", e.getMessage());
        }
        return false;
    }
}