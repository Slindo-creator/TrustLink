package com.trustlink.controller;

import com.trustlink.dto.VendorProfileResponse;
import com.trustlink.dto.VerificationDecisionRequest;
import com.trustlink.dto.VerificationDecisionResponse;
import com.trustlink.dto.VerificationDocumentResponse;
import com.trustlink.entity.VerificationDocument;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.VendorService;
import com.trustlink.service.VerificationDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Every endpoint here is ADMIN-only. There's no self-service path to VERIFIED or
 * COMMUNITY_VOUCHED - a vendor can request it, but only an admin account can grant it.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final VendorService vendorService;
    private final VerificationDocumentService verificationDocumentService;

    @PutMapping("/vendors/{id}/verification")
    public VendorProfileResponse decideVerification(
        @AuthenticationPrincipal AppUserPrincipal admin,
        @PathVariable Long id,
        @Valid @RequestBody VerificationDecisionRequest request
    ) {
        return vendorService.decideVerification(admin, id, request);
    }

    @GetMapping("/vendors/{id}/verification-history")
    public List<VerificationDecisionResponse> getVerificationHistory(@PathVariable Long id) {
        return vendorService.getVerificationHistory(id);
    }

    @GetMapping("/vendors/{id}/verification-documents")
    public List<VerificationDocumentResponse> listVerificationDocuments(@PathVariable Long id) {
        return verificationDocumentService.listForVendor(id);
    }

    @GetMapping("/verification-documents/{documentId}/file")
    public ResponseEntity<Resource> downloadVerificationDocument(@PathVariable Long documentId) {
        VerificationDocument document = verificationDocumentService.getDocumentForDownload(documentId);
        Resource file = verificationDocumentService.loadFile(document);

        return ResponseEntity.ok()
            .contentType(MediaType.parseMediaType(document.getContentType()))
            .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + document.getOriginalFileName() + "\"")
            .body(file);
    }
}
