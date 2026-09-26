package com.trustlink.dto;

import com.trustlink.entity.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SignupRequest(
    @NotNull Role role,
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Email @Size(max = 190) String email,
    @NotBlank @Size(min = 8, max = 72, message = "password must be between 8 and 72 characters") String password,
    String phone,
    // Required when role == VENDOR; validated in the service layer since it's conditional.
    String businessName
) {}
