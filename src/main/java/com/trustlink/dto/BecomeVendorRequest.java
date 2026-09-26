package com.trustlink.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record BecomeVendorRequest(
    @NotBlank @Size(max = 150) String businessName
) {}
