package com.trustlink.service;

import com.trustlink.dto.VerificationDocumentResponse;
import com.trustlink.entity.DocumentType;
import com.trustlink.entity.VendorProfile;
import com.trustlink.entity.VerificationDocument;
import com.trustlink.entity.VerificationStatus;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.repository.VerificationDocumentRepository;
import com.trustlink.security.AppUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
public class VerificationDocumentService {

    private final VerificationDocumentRepository verificationDocumentRepository;
    private final VendorProfileRepository vendorProfileRepository;
    private final FileStorageService fileStorageService;
    private final TrustScoreService trustScoreService;

    @Transactional
    public VerificationDocumentResponse uploadForOwnProfile(
        AppUserPrincipal caller, MultipartFile file, String documentTypeRaw
    ) {
        VendorProfile profile = vendorProfileRepository.findByUserId(caller.getId())
            .orElseThrow(() -> ApiException.forbidden("Only vendors can upload verification documents."));

        DocumentType documentType = parseDocumentType(documentTypeRaw);
        FileStorageService.StoredFile stored = fileStorageService.store(file);

        VerificationDocument document = VerificationDocument.builder()
            .vendorProfile(profile)
            .storedFileName(stored.storedFileName())
            .originalFileName(stored.originalFileName())
            .contentType(stored.contentType())
            .documentType(documentType)
            .sizeBytes(stored.sizeBytes())
            .build();
        verificationDocumentRepository.save(document);

        // Submitting evidence is the vendor signalling "please review me" - move them
        // out of UNVERIFIED automatically. This is a status change, not an admin
        // decision, so it deliberately does NOT write a VerificationDecision row;
        // that table is reserved for actual admin judgement calls.
        if (profile.getVerificationStatus() == VerificationStatus.UNVERIFIED) {
            profile.setVerificationStatus(VerificationStatus.PENDING);
            vendorProfileRepository.save(profile);
            trustScoreService.recalculate(profile);
        }

        return toResponse(document);
    }

    public List<VerificationDocumentResponse> listForOwnProfile(AppUserPrincipal caller) {
        VendorProfile profile = vendorProfileRepository.findByUserId(caller.getId())
            .orElseThrow(() -> ApiException.forbidden("Only vendors have verification documents."));
        return listForVendor(profile.getId());
    }

    /** Admin-only. */
    public List<VerificationDocumentResponse> listForVendor(Long vendorProfileId) {
        if (!vendorProfileRepository.existsById(vendorProfileId)) {
            throw ApiException.notFound("Vendor not found.");
        }
        return verificationDocumentRepository.findByVendorProfileIdOrderByUploadedAtDesc(vendorProfileId).stream()
            .map(this::toResponse)
            .toList();
    }

    /** Admin-only. Returns the raw file plus metadata needed for the response headers. */
    public VerificationDocument getDocumentForDownload(Long documentId) {
        return verificationDocumentRepository.findById(documentId)
            .orElseThrow(() -> ApiException.notFound("Document not found."));
    }

    public Resource loadFile(VerificationDocument document) {
        return fileStorageService.load(document.getStoredFileName());
    }

    private VerificationDocumentResponse toResponse(VerificationDocument document) {
        return new VerificationDocumentResponse(
            document.getId(),
            document.getOriginalFileName(),
            document.getContentType(),
            document.getDocumentType().name(),
            document.getSizeBytes(),
            document.getUploadedAt()
        );
    }

    private DocumentType parseDocumentType(String raw) {
        if (raw == null || raw.isBlank()) {
            return DocumentType.OTHER;
        }
        try {
            return DocumentType.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badRequest(
                "documentType must be one of ID_DOCUMENT, PROOF_OF_ADDRESS, TRADING_PERMIT, OTHER."
            );
        }
    }
}
