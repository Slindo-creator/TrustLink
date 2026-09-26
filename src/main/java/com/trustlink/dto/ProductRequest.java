package com.trustlink.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record ProductRequest(
    @NotBlank @Size(max = 150) String name,
    @Size(max = 2000) String description,
    @DecimalMin(value = "0.0", inclusive = true) BigDecimal price,
    boolean available
) {}
