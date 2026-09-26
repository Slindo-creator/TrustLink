package com.trustlink.security;

import com.trustlink.entity.AuthProvider;
import com.trustlink.entity.User;
import com.trustlink.exception.ApiException;
import com.trustlink.service.OAuthUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.net.URLEncoder;

/**
 * Bridges Spring Security's OAuth2 login (which normally ends in a server-side
 * session) back into TrustLink's stateless JWT model. On success we issue the exact
 * same kind of token /api/auth/login would, then hand it to the frontend via a
 * redirect - not a cookie, and never as a session Spring Security itself keeps alive,
 * since SecurityConfig runs everything else as STATELESS.
 *
 * The token travels in the redirect URL's query string, which is the standard pattern
 * for an SPA OAuth callback, but it does mean the token can end up in browser history
 * and server access logs. Fine for a hackathon demo; before production, swap this for
 * a short-lived one-time code that the frontend exchanges for the real JWT server-side.
 */
@Component
@RequiredArgsConstructor
public class OAuth2AuthenticationSuccessHandler implements AuthenticationSuccessHandler {

    private static final Logger log = LoggerFactory.getLogger(OAuth2AuthenticationSuccessHandler.class);

    private final OAuthUserService oAuthUserService;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    @Value("${app.oauth2.success-redirect}")
    private String successRedirect;

    @Value("${app.oauth2.failure-redirect}")
    private String failureRedirect;

    @Override
    public void onAuthenticationSuccess(
        HttpServletRequest request, HttpServletResponse response, Authentication authentication
    ) throws IOException {

        String registrationId = extractRegistrationId(request);
        AuthProvider provider = toAuthProvider(registrationId);
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();

        String providerId = String.valueOf(oauth2User.getAttributes().get("id") != null
            ? oauth2User.getAttributes().get("id")   // Facebook
            : oauth2User.getAttributes().get("sub")); // Google
        String email = (String) oauth2User.getAttributes().get("email");
        String name = (String) oauth2User.getAttributes().get("name");

        try {
            User user = oAuthUserService.findOrCreateOAuthUser(provider, providerId, email, name);
            String token = jwtService.generateToken(user.getId(), user.getEmail(), user.getRole().name());
            String refreshToken = refreshTokenService.issue(user);

            String redirectUrl = UriComponentsBuilder.fromUriString(successRedirect)
                .queryParam("token", token)
                .queryParam("refreshToken", refreshToken)
                .queryParam("expiresIn", jwtService.expirationSeconds())
                .build().toUriString();
            response.sendRedirect(redirectUrl);
        } catch (ApiException ex) {
            log.info("OAuth login rejected for provider={}: {}", provider, ex.getMessage());
            response.sendRedirect(failureRedirect + "?error=" + encode(ex.getMessage()));
        }
    }

    private String extractRegistrationId(HttpServletRequest request) {
        // e.g. /login/oauth2/code/google -> "google"
        String uri = request.getRequestURI();
        return uri.substring(uri.lastIndexOf('/') + 1);
    }

    private AuthProvider toAuthProvider(String registrationId) {
        return switch (registrationId.toLowerCase()) {
            case "google" -> AuthProvider.GOOGLE;
            case "facebook" -> AuthProvider.FACEBOOK;
            default -> throw ApiException.badRequest("Unsupported OAuth provider: " + registrationId);
        };
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
