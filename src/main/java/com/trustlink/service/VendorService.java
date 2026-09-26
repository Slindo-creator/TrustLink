package com.trustlink.service;

import com.trustlink.dto.VendorProfileRequest;
import com.trustlink.dto.VendorProfileResponse;
import com.trustlink.dto.VerificationDecisionRequest;
import com.trustlink.dto.VerificationDecisionResponse;
import com.trustlink.entity.User;
import com.trustlink.entity.VendorProfile;
import com.trustlink.entity.VerificationDecision;
import com.trustlink.entity.VerificationStatus;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.ReviewRepository;
import com.trustlink.repository.UserRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.repository.VerificationDecisionRepository;
import com.trustlink.security.AppUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VendorService {

    private final VendorProfileRepository vendorProfileRepository;
    private final ReviewRepository reviewRepository;
    private final UserRepository userRepository;
    private final VerificationDecisionRepository verificationDecisionRepository;
    private final TrustScoreService trustScoreService;

    @Transactional
    public VendorProfileResponse updateOwnProfile(AppUserPrincipal caller, VendorProfileRequest request) {
        VendorProfile profile = vendorProfileRepository.findByUserId(caller.getId())
            .orElseThrow(() -> ApiException.notFound("Vendor profile not found."));

        profile.setBusinessName(request.businessName());
        profile.setDescription(request.description());
        profile.setGeneralArea(request.generalArea());
        profile.setPreciseLatitude(request.preciseLatitude());
        profile.setPreciseLongitude(request.preciseLongitude());
        // The vendor is the only one who can turn precise-location sharing on - never
        // defaulted on for them and never flipped by any other actor.
        profile.setLocationVisible(request.locationVisible());

        return toResponse(vendorProfileRepository.save(profile), true);
    }

    /**
     * Public read - precise coordinates are stripped unless the vendor opted in.
     * Also counts as a "discovery" - the view counter backs the canvas's own
     * "vendor discoveries" / competitive-differentiation metrics with a real number.
     */
    @Transactional
    public VendorProfileResponse getPublicProfile(Long vendorProfileId) {
        VendorProfile profile = vendorProfileRepository.findById(vendorProfileId)
            .orElseThrow(() -> ApiException.notFound("Vendor not found."));

        vendorProfileRepository.incrementViewCount(vendorProfileId);
        // +1 here matches what the atomic UPDATE above just committed, without a second
        // round trip to re-read it - the in-memory entity is otherwise one view stale.
        long viewCountForResponse = profile.getProfileViewCount() + 1;

        return toResponse(profile, profile.isLocationVisible(), viewCountForResponse);
    }

    public List<VendorProfileResponse> searchByArea(String area) {
        return vendorProfileRepository.findByActiveTrueAndGeneralAreaIgnoreCaseContaining(area).stream()
            .map(p -> toResponse(p, p.isLocationVisible()))
            .toList();
    }

    public List<VendorProfileResponse> searchByName(String name) {
        return vendorProfileRepository.findByActiveTrueAndBusinessNameIgnoreCaseContaining(name).stream()
            .map(p -> toResponse(p, p.isLocationVisible()))
            .toList();
    }

    /**
     * Admin-only decision on a vendor's verification tier. Recalculates the trust score
     * immediately, since verification tier is one of its two inputs (see TrustScoreService).
     * Every decision is persisted as its own immutable row (never updated in place) -
     * a vendor disputing a decision, or an auditor asking "who verified this and why",
     * gets a real answer instead of a log line that rolls off eventually.
     */
    @Transactional
    public VendorProfileResponse decideVerification(
        AppUserPrincipal admin, Long vendorProfileId, VerificationDecisionRequest request
    ) {
        VendorProfile profile = vendorProfileRepository.findById(vendorProfileId)
            .orElseThrow(() -> ApiException.notFound("Vendor not found."));
        User adminUser = userRepository.findById(admin.getId())
            .orElseThrow(() -> ApiException.notFound("Admin user not found."));

        VerificationStatus previousStatus = profile.getVerificationStatus();

        VerificationDecision decision = VerificationDecision.builder()
            .vendorProfile(profile)
            .decidedBy(adminUser)
            .previousStatus(previousStatus)
            .newStatus(request.status())
            .note(request.note())
            .build();
        verificationDecisionRepository.save(decision);

        profile.setVerificationStatus(request.status());
        vendorProfileRepository.save(profile);
        trustScoreService.recalculate(profile);

        return toResponse(profile, profile.isLocationVisible());
    }

    /** Admin-only - the full history of verification decisions for a vendor, newest first. */
    public List<VerificationDecisionResponse> getVerificationHistory(Long vendorProfileId) {
        if (!vendorProfileRepository.existsById(vendorProfileId)) {
            throw ApiException.notFound("Vendor not found.");
        }
        return verificationDecisionRepository.findByVendorProfileIdOrderByCreatedAtDesc(vendorProfileId).stream()
            .map(d -> new VerificationDecisionResponse(
                d.getId(),
                d.getDecidedBy().getName(),
                d.getPreviousStatus().name(),
                d.getNewStatus().name(),
                d.getNote(),
                d.getCreatedAt()
            ))
            .toList();
    }

    private VendorProfileResponse toResponse(VendorProfile profile, boolean includePreciseLocation) {
        return toResponse(profile, includePreciseLocation, profile.getProfileViewCount());
    }

    private VendorProfileResponse toResponse(VendorProfile profile, boolean includePreciseLocation, long viewCount) {
        long reviewCount = reviewRepository.countByVendorProfileId(profile.getId());
        return new VendorProfileResponse(
            profile.getId(),
            profile.getBusinessName(),
            profile.getDescription(),
            profile.getGeneralArea(),
            includePreciseLocation ? profile.getPreciseLatitude() : null,
            includePreciseLocation ? profile.getPreciseLongitude() : null,
            profile.getVerificationStatus().name(),
            profile.getTrustScore(),
            reviewCount,
            viewCount,
            profile.isActive()
        );
    }
}
