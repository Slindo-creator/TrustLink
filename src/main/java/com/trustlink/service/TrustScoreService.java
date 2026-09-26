package com.trustlink.service;

import com.trustlink.entity.Review;
import com.trustlink.entity.VendorProfile;
import com.trustlink.entity.VerificationStatus;
import com.trustlink.repository.ReviewRepository;
import com.trustlink.repository.VendorProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Deliberately simple, explainable scoring - a hackathon judge (or a vendor disputing
 * their score) should be able to follow the logic without a black box.
 *
 * score (0-100) = verificationWeight + reputationWeight
 *  - verificationWeight: fixed points per tier (0/10/20/35)
 *  - reputationWeight: up to 65 points, scaled by average rating and damped for
 *    vendors with very few reviews so five 5-star reviews can't outrank a vendor
 *    with a long, consistent track record.
 */
@Service
@RequiredArgsConstructor
public class TrustScoreService {

    private static final int MIN_REVIEWS_FOR_FULL_CONFIDENCE = 20;

    private final ReviewRepository reviewRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public void recalculate(VendorProfile profile) {
        List<Review> reviews = reviewRepository.findByVendorProfileIdOrderByCreatedAtDesc(profile.getId());

        double verificationPoints = verificationPoints(profile.getVerificationStatus());
        double reputationPoints = reputationPoints(reviews);

        double score = Math.round((verificationPoints + reputationPoints) * 100.0) / 100.0;
        profile.setTrustScore(score);
        vendorProfileRepository.save(profile);
    }

    private double verificationPoints(VerificationStatus status) {
        return switch (status) {
            case UNVERIFIED -> 0;
            case PENDING -> 10;
            case COMMUNITY_VOUCHED -> 20;
            case VERIFIED -> 35;
        };
    }

    private double reputationPoints(List<Review> reviews) {
        if (reviews.isEmpty()) {
            return 0;
        }
        double averageRating = reviews.stream().mapToInt(Review::getRating).average().orElse(0);
        // Normalise 1-5 stars to 0-1, then to the 65-point reputation budget.
        double normalisedRating = (averageRating - 1) / 4.0;

        // Confidence damping: fewer reviews => pull the score toward the midpoint (0.5)
        // rather than letting a handful of ratings swing it to the extremes.
        double confidence = Math.min(1.0, (double) reviews.size() / MIN_REVIEWS_FOR_FULL_CONFIDENCE);
        double damped = 0.5 + confidence * (normalisedRating - 0.5);

        return damped * 65.0;
    }
}
