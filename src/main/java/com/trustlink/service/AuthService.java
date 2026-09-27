package com.trustlink.service;

import com.trustlink.dto.AuthResponse;
import com.trustlink.dto.LoginRequest;
import com.trustlink.dto.SignupRequest;
import com.trustlink.entity.Role;
import com.trustlink.entity.User;
import com.trustlink.entity.VendorProfile;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.UserRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.security.JwtUtils;
import com.trustlink.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;
    private final RefreshTokenService refreshTokenService;
    private final AuthenticationManager authenticationManager;

    @Transactional
    public AuthResponse signup(SignupRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            // Deliberately vague to avoid confirming which emails are registered elsewhere,
            // but signup specifically needs to tell the user why it failed - this is the
            // one place a slightly more specific message is a reasonable trade-off.
            throw ApiException.conflict("An account with that email already exists.");
        }
        if (request.role() == Role.ADMIN) {
            // Public signup can only ever create CUSTOMER or VENDOR accounts. Admin
            // accounts are provisioned out-of-band (DB seed/migration) - never over this API.
            throw ApiException.forbidden("Admin accounts cannot be created through signup.");
        }
        if (request.role() == Role.VENDOR && isBlank(request.businessName())) {
            throw ApiException.badRequest("businessName is required for vendor accounts.");
        }

        User user = User.builder()
                .role(request.role())
                .name(request.name())
                .email(request.email().toLowerCase())
                .passwordHash(passwordEncoder.encode(request.password()))
                .phone(request.phone())
                .build();
        user = userRepository.save(user);

        if (request.role() == Role.VENDOR) {
            VendorProfile profile = VendorProfile.builder()
                    .user(user)
                    .businessName(request.businessName())
                    .build();
            vendorProfileRepository.save(profile);
        }

        return issueTokens(user);
    }

    public AuthResponse login(LoginRequest request) {
        try {
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.email().toLowerCase(), request.password())
            );
            AppUserPrincipal principal = (AppUserPrincipal) authentication.getPrincipal();
            User user = userRepository.findByEmail(principal.getUsername())
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

            return issueTokens(user);
        } catch (BadCredentialsException ex) {
            throw ex; // handled centrally by GlobalExceptionHandler with a generic message
        }
    }

    /**
     * Exchanges a valid refresh token for a new access token + a rotated refresh
     * token. Reads the user's *current* role from the DB rather than trusting
     * anything cached, so a role change (e.g. become-vendor) is picked up on the
     * next refresh even if the old access token is still floating around unexpired.
     */
    @Transactional
    public AuthResponse refresh(String rawRefreshToken) {
        User user = refreshTokenService.consumeForRotation(rawRefreshToken);
        return issueTokens(user);
    }

    public void logout(String rawRefreshToken) {
        refreshTokenService.revoke(rawRefreshToken);
    }

    private AuthResponse issueTokens(User user) {
        String accessToken = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        String refreshToken = refreshTokenService.issue(user);
        return new AuthResponse(
                accessToken, jwtUtils.expirationSeconds(), refreshToken,
                user.getId(), user.getRole().name(), user.getName()
        );
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}