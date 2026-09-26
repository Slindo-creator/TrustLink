package com.trustlink.repository;

import com.trustlink.entity.VendorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface VendorProfileRepository extends JpaRepository<VendorProfile, Long> {
    Optional<VendorProfile> findByUserId(Long userId);

    List<VendorProfile> findByActiveTrueAndGeneralAreaIgnoreCaseContaining(String generalArea);

    List<VendorProfile> findByActiveTrueAndBusinessNameIgnoreCaseContaining(String name);

    /**
     * A single atomic UPDATE rather than load-increment-save, so two concurrent profile
     * views can't race and lose one of the increments (which a
     * findById -> setCount(count+1) -> save round trip would be prone to).
     */
    @Modifying
    @Query("update VendorProfile v set v.profileViewCount = v.profileViewCount + 1 where v.id = :id")
    void incrementViewCount(@Param("id") Long id);
}
