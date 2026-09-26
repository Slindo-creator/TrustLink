package com.trustlink.controller;

import com.trustlink.dto.ProductRequest;
import com.trustlink.dto.ProductResponse;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping("/api/vendors/{vendorId}/products")
    public List<ProductResponse> listForVendor(@PathVariable Long vendorId) {
        return productService.listForVendor(vendorId);
    }

    @PostMapping("/api/products")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<ProductResponse> create(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @Valid @RequestBody ProductRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(caller, request));
    }

    @PutMapping("/api/products/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ProductResponse update(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @PathVariable Long id,
        @Valid @RequestBody ProductRequest request
    ) {
        return productService.update(caller, id, request);
    }

    @DeleteMapping("/api/products/{id}")
    @PreAuthorize("hasRole('VENDOR')")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AppUserPrincipal caller, @PathVariable Long id) {
        productService.delete(caller, id);
        return ResponseEntity.noContent().build();
    }
}
