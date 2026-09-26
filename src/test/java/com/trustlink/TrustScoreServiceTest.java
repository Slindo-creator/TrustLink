package com.trustlink;

import com.trustlink.entity.Review;
import com.trustlink.entity.VendorProfile;
import com.trustlink.entity.VerificationStatus;
import com.trustlink.repository.ReviewRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.service.TrustScoreService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

/**
 * Pure unit tests for the scoring formula - no Spring context, no DB, so these run
 * fast and don't need Postgres/Flyway to be available.
 */
@ExtendWith(MockitoExtension.class)
class TrustScoreServiceTest {

    @Mock
    ReviewRepository reviewRepository;

    @Mock
    VendorProfileRepository vendorProfileRepository;

    @InjectMocks
    TrustScoreService trustScoreService;

    @Test
    void unverifiedVendorWithNoReviewsScoresZero() {
        VendorProfile profile = VendorProfile.builder()
            .id(1L)
            .verificationStatus(VerificationStatus.UNVERIFIED)
            .build();
        when(reviewRepository.findByVendorProfileIdOrderByCreatedAtDesc(1L)).thenReturn(List.of());
        when(vendorProfileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        trustScoreService.recalculate(profile);

        assertThat(profile.getTrustScore()).isZero();
    }

    @Test
    void verifiedVendorWithFewGoodReviewsScoresBelowAVendorWithManyGoodReviews() {
        VendorProfile fewReviews = VendorProfile.builder().id(1L).verificationStatus(VerificationStatus.VERIFIED).build();
        VendorProfile manyReviews = VendorProfile.builder().id(2L).verificationStatus(VerificationStatus.VERIFIED).build();

        when(reviewRepository.findByVendorProfileIdOrderByCreatedAtDesc(1L))
            .thenReturn(List.of(fiveStar(), fiveStar()));
        when(reviewRepository.findByVendorProfileIdOrderByCreatedAtDesc(2L))
            .thenReturn(java.util.Collections.nCopies(20, fiveStar()));
        when(vendorProfileRepository.save(any())).thenAnswer(inv -> inv.getArgument(0));

        trustScoreService.recalculate(fewReviews);
        trustScoreService.recalculate(manyReviews);

        assertThat(fewReviews.getTrustScore()).isLessThan(manyReviews.getTrustScore());
    }

    private Review fiveStar() {
        return Review.builder().rating(5).build();
    }
}
