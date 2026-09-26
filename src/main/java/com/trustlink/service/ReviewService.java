package com.trustlink.service;

import com.trustlink.dto.ReviewRequest;
import com.trustlink.dto.ReviewResponse;
import com.trustlink.entity.Review;
import com.trustlink.entity.User;
import com.trustlink.entity.VendorProfile;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.ReviewRepository;
import com.trustlink.repository.UserRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.security.AppUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final UserRepository userRepository;
    private final TrustScoreService trustScoreService;

    @Transactional
    public ReviewResponse create(AppUserPrincipal caller, Long vendorProfileId, ReviewRequest request) {
        VendorProfile profile = vendorProfileRepository.findById(vendorProfileId)
            .orElseThrow(() -> ApiException.notFound("Vendor not found."));

        // DB has a UNIQUE(vendor_profile_id, customer_id) constraint as the hard backstop;
        // this check exists purely to give a clean 409 instead of a raw constraint violation.
        reviewRepository.findByVendorProfileIdAndCustomerId(vendorProfileId, caller.getId())
            .ifPresent(r -> { throw ApiException.conflict("You've already reviewed this vendor."); });

        User customer = userRepository.findById(caller.getId())
            .orElseThrow(() -> ApiException.notFound("User not found."));

        Review review = Review.builder()
            .vendorProfile(profile)
            .customer(customer)
            .rating(request.rating())
            .comment(request.comment())
            .build();
        review = reviewRepository.save(review);

        trustScoreService.recalculate(profile);

        return toResponse(review);
    }

    public List<ReviewResponse> listForVendor(Long vendorProfileId) {
        return reviewRepository.findByVendorProfileIdOrderByCreatedAtDesc(vendorProfileId).stream()
            .map(this::toResponse)
            .toList();
    }

    private ReviewResponse toResponse(Review review) {
        return new ReviewResponse(
            review.getId(),
            review.getCustomer().getName(),
            review.getRating(),
            review.getComment(),
            review.getCreatedAt()
        );
    }
}
