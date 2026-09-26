package com.trustlink.controller;

import com.trustlink.dto.ReviewRequest;
import com.trustlink.dto.ReviewResponse;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors/{vendorId}/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping
    public List<ReviewResponse> listForVendor(@PathVariable Long vendorId) {
        return reviewService.listForVendor(vendorId);
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ReviewResponse> create(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @PathVariable Long vendorId,
        @Valid @RequestBody ReviewRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(reviewService.create(caller, vendorId, request));
    }
}
