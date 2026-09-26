package com.trustlink.repository;

import com.trustlink.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByVendorProfileId(Long vendorProfileId);
    Optional<Product> findByIdAndVendorProfileId(Long id, Long vendorProfileId);
}
