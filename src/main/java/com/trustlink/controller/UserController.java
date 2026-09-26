package com.trustlink.controller;

import com.trustlink.dto.AuthResponse;
import com.trustlink.dto.BecomeVendorRequest;
import com.trustlink.dto.UserProfileResponse;
import com.trustlink.security.AppUserPrincipal;
import com.trustlink.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping
    public UserProfileResponse getOwnProfile(@AuthenticationPrincipal AppUserPrincipal caller) {
        return userService.getOwnProfile(caller);
    }

    @PostMapping("/become-vendor")
    public AuthResponse becomeVendor(
        @AuthenticationPrincipal AppUserPrincipal caller,
        @Valid @RequestBody BecomeVendorRequest request
    ) {
        return userService.becomeVendor(caller, request);
    }
}
