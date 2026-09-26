package com.trustlink.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record VendorProfileRequest(
    @NotBlank @Size(max = 150) String businessName,
    @Size(max = 2000) String description,
    @Size(max = 150) String generalArea,
    // Precise coordinates are optional. Supplying them does not make them public -
    // locationVisible is a separate, explicit opt-in the vendor controls.
    @DecimalMin("-90.0") @DecimalMax("90.0") Double preciseLatitude,
    @DecimalMin("-180.0") @DecimalMax("180.0") Double preciseLongitude,
    boolean locationVisible
) {}
