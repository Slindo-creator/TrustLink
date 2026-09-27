package com.trustlink.service;

import com.trustlink.dto.AuthResponse;
import com.trustlink.dto.BecomeVendorRequest;
import com.trustlink.dto.UserProfileResponse;
import com.trustlink.entity.Role;
import com.trustlink.entity.User;
import com.trustlink.entity.VendorProfile;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.UserRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final JwtUtils jwtUtils;

    public UserProfileResponse getOwnProfile(AppUserPrincipal caller) {
        User user = userRepository.findById(caller.getId())
                .orElseThrow(() -> ApiException.notFound("User not found."));
        return toResponse(user);
    }

    /**
     * Covers the gap OAuth login leaves open: there's no natural point in a redirect
     * flow to ask "customer or vendor?", so every new OAuth user lands as CUSTOMER and
     * can self-upgrade here. A signed-in LOCAL customer can use this too, not just
     * OAuth ones - no reason to make them sign up again under a second account.
     * Returns a fresh token because the JWT's "role" claim is fixed at issuance; the
     * old token still works but keeps showing CUSTOMER until it's replaced or expires.
     */
    @Transactional
    public AuthResponse becomeVendor(AppUserPrincipal caller, BecomeVendorRequest request) {
        User user = userRepository.findById(caller.getId())
                .orElseThrow(() -> ApiException.notFound("User not found."));

        if (user.getRole() == Role.VENDOR) {
            throw ApiException.conflict("This account is already a vendor account.");
        }
        if (user.getRole() == Role.ADMIN) {
            throw ApiException.badRequest("Admin accounts can't become vendor accounts.");
        }

        user.setRole(Role.VENDOR);
        userRepository.save(user);

        VendorProfile profile = VendorProfile.builder()
                .user(user)
                .businessName(request.businessName())
                .build();
        vendorProfileRepository.save(profile);

        String token = jwtUtils.generateToken(user.getId(), user.getEmail(), user.getRole().name());
        // null refreshToken: this isn't a new session, so the client keeps using
        // whichever refresh token it already has - see AuthResponse's javadoc.
        return new AuthResponse(token, jwtUtils.expirationSeconds(), null, user.getId(), user.getRole().name(), user.getName());
    }

    private UserProfileResponse toResponse(User user) {
        return new UserProfileResponse(
                user.getId(), user.getName(), user.getEmail(), user.getRole().name()
        );
    }
}