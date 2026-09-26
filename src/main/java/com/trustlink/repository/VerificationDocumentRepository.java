package com.trustlink.repository;

import com.trustlink.entity.VerificationDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface VerificationDocumentRepository extends JpaRepository<VerificationDocument, Long> {
    List<VerificationDocument> findByVendorProfileIdOrderByUploadedAtDesc(Long vendorProfileId);
}
