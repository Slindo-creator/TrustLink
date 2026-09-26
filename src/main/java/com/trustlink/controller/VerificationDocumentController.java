package com.trustlink.controller;

import com.trustlink.dto.VerificationDocumentResponse;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.VerificationDocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/vendors/me/verification-documents")
@RequiredArgsConstructor
@PreAuthorize("hasRole('VENDOR')")
public class VerificationDocumentController {

    private final VerificationDocumentService verificationDocumentService;

    @PostMapping(consumes = "multipart/form-data")
    public ResponseEntity<VerificationDocumentResponse> upload(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "documentType", required = false) String documentType
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(verificationDocumentService.uploadForOwnProfile(caller, file, documentType));
    }

    @GetMapping
    public List<VerificationDocumentResponse> listOwn(@AuthenticationPrincipal AppUserPrincipal caller) {
        return verificationDocumentService.listForOwnProfile(caller);
    }
}
