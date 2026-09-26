package com.trustlink.service;

import com.trustlink.dto.ProductRequest;
import com.trustlink.dto.ProductResponse;
import com.trustlink.entity.Product;
import com.trustlink.entity.VendorProfile;
import com.trustlink.exception.ApiException;
import com.trustlink.repository.ProductRepository;
import com.trustlink.repository.VendorProfileRepository;
import com.trustlink.security.AppUserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final VendorProfileRepository vendorProfileRepository;

    public List<ProductResponse> listForVendor(Long vendorProfileId) {
        return productRepository.findByVendorProfileId(vendorProfileId).stream()
            .map(this::toResponse)
            .toList();
    }

    @Transactional
    public ProductResponse create(AppUserPrincipal caller, ProductRequest request) {
        VendorProfile profile = ownProfileOrThrow(caller);
        Product product = Product.builder()
            .vendorProfile(profile)
            .name(request.name())
            .description(request.description())
            .price(request.price())
            .available(request.available())
            .build();
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse update(AppUserPrincipal caller, Long productId, ProductRequest request) {
        VendorProfile profile = ownProfileOrThrow(caller);
        Product product = productRepository.findByIdAndVendorProfileId(productId, profile.getId())
            .orElseThrow(() -> ApiException.notFound("Product not found."));

        product.setName(request.name());
        product.setDescription(request.description());
        product.setPrice(request.price());
        product.setAvailable(request.available());
        return toResponse(productRepository.save(product));
    }

    @Transactional
    public void delete(AppUserPrincipal caller, Long productId) {
        VendorProfile profile = ownProfileOrThrow(caller);
        Product product = productRepository.findByIdAndVendorProfileId(productId, profile.getId())
            .orElseThrow(() -> ApiException.notFound("Product not found."));
        productRepository.delete(product);
    }

    private VendorProfile ownProfileOrThrow(AppUserPrincipal caller) {
        return vendorProfileRepository.findByUserId(caller.getId())
            .orElseThrow(() -> ApiException.forbidden("Only vendors have a product catalogue."));
    }

    private ProductResponse toResponse(Product product) {
        return new ProductResponse(
            product.getId(),
            product.getName(),
            product.getDescription(),
            product.getPrice(),
            product.isAvailable(),
            product.getUpdatedAt()
        );
    }
}
