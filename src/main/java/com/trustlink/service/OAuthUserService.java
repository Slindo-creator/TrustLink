package com.trustlink.service;

import com.trustlink.entity.AuthProvider;
import com.trustlink.entity.Role;
import com.trustlink.entity.User;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class OAuthUserService {

    private final UserRepository userRepository;

    /**
     * Finds the user for this exact provider account, or provisions a new one.
     *
     * Deliberately does NOT auto-link by email to an existing account under a
     * different provider (or a LOCAL password account). Google and Facebook only
     * return verified emails, so that linking would probably be safe in practice -
     * but "probably safe" isn't a bar worth clearing when the alternative (reject
     * and tell the user to use their original sign-in method) is just as easy and
     * removes the account-takeover question entirely.
     *
     * New OAuth users land as CUSTOMER by default - there's no natural place in an
     * OAuth redirect flow to ask "are you a vendor or a customer?" up front, so that
     * choice happens afterwards via POST /api/users/me/become-vendor.
     */
    @Transactional
    public User findOrCreateOAuthUser(AuthProvider provider, String providerId, String email, String name) {
        return userRepository.findByAuthProviderAndProviderId(provider, providerId)
            .orElseGet(() -> provisionNewOAuthUser(provider, providerId, email, name));
    }

    private User provisionNewOAuthUser(AuthProvider provider, String providerId, String email, String name) {
        if (email == null || email.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                "Your " + provider + " account didn't share an email address, which TrustLink requires.");
        }
        String normalisedEmail = email.toLowerCase();

        if (userRepository.existsByEmail(normalisedEmail)) {
            throw ApiException.conflict(
                "An account already exists for " + normalisedEmail + ". Log in with your original method instead."
            );
        }

        User user = User.builder()
            .role(Role.CUSTOMER)
            .name(name != null && !name.isBlank() ? name : "TrustLink User")
            .email(normalisedEmail)
            .authProvider(provider)
            .providerId(providerId)
            .build();

        return userRepository.save(user);
    }
}
