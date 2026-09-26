package com.trustlink.repository;

import com.trustlink.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByVendorProfileIdOrderByCreatedAtDesc(Long vendorProfileId);
    Optional<Review> findByVendorProfileIdAndCustomerId(Long vendorProfileId, Long customerId);
    long countByVendorProfileId(Long vendorProfileId);
}
