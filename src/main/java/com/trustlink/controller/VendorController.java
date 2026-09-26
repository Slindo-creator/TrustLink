package com.trustlink.controller;

import com.trustlink.dto.VendorProfileRequest;
import com.trustlink.dto.VendorProfileResponse;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.VendorService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@RequiredArgsConstructor
public class VendorController {

    private final VendorService vendorService;

    @GetMapping("/{id}")
    public VendorProfileResponse getProfile(@PathVariable Long id) {
        return vendorService.getPublicProfile(id);
    }

    @GetMapping(params = "area")
    public List<VendorProfileResponse> searchByArea(@RequestParam String area) {
        return vendorService.searchByArea(area);
    }

    @GetMapping(params = "name")
    public List<VendorProfileResponse> searchByName(@RequestParam String name) {
        return vendorService.searchByName(name);
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('VENDOR')")
    public VendorProfileResponse updateOwnProfile(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @Valid @RequestBody VendorProfileRequest request
    ) {
        return vendorService.updateOwnProfile(caller, request);
    }
}
