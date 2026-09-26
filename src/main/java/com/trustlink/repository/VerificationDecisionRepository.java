package com.trustlink.repository;

import com.trustlink.entity.VerificationDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationDecisionRepository extends JpaRepository<VerificationDecision, Long> {
    List<VerificationDecision> findByVendorProfileIdOrderByCreatedAtDesc(Long vendorProfileId);
}
