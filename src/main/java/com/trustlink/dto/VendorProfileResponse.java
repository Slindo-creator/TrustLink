package com.trustlink.dto;

public record VendorProfileResponse(
    Long id,
    String businessName,
    String description,
    String generalArea,
    // Null unless the vendor opted in AND the caller is allowed to see it -
    // decided in VendorService, never left to the client to filter.
    Double preciseLatitude,
    Double preciseLongitude,
    String verificationStatus,
    double trustScore,
    long reviewCount,
    long profileViewCount,
    boolean active
) {}
