package com.trustlink.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "vendor_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "business_name", nullable = false, length = 150)
    private String businessName;

    @Column(columnDefinition = "text")
    private String description;

    /** Coarse, always-public location (suburb/area name) - not exact coordinates. */
    @Column(name = "general_area", length = 150)
    private String generalArea;

    /** Only ever returned by the service layer when locationVisible is true. */
    @Column(name = "precise_latitude")
    private Double preciseLatitude;

    @Column(name = "precise_longitude")
    private Double preciseLongitude;

    @Column(name = "location_visible", nullable = false)
    @Builder.Default
    private boolean locationVisible = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "verification_status", nullable = false, length = 20)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.UNVERIFIED;

    @Column(name = "trust_score", nullable = false)
    @Builder.Default
    private double trustScore = 0.0;

    // Backs the canvas's "vendor discoveries" / competitive-differentiation metrics with
    // a real number. Incremented via a single atomic UPDATE (see VendorProfileRepository)
    // rather than read-modify-write on this entity, so concurrent profile views can't
    // silently overwrite each other's increment.
    @Column(name = "profile_view_count", nullable = false)
    @Builder.Default
    private long profileViewCount = 0L;

    @Column(nullable = false)
    @Builder.Default
    private boolean active = true;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
