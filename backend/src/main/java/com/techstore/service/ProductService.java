package com.techstore.service;

import com.techstore.model.Product;
import com.techstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProductService {
    
    private final ProductRepository productRepository;
    
    public Page<Product> getAllProducts(Pageable pageable) {
        return productRepository.findByActiveTrue(pageable);
    }
    
    public Product getProductById(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Product not found"));
    }
    
    public Page<Product> searchProducts(String keyword, Pageable pageable) {
        return productRepository.searchProducts(keyword, pageable);
    }
    
    public Page<Product> getProductsByCategory(Long categoryId, Pageable pageable) {
        return productRepository.findByCategoryIdAndActiveTrue(categoryId, pageable);
    }
    
    public Page<Product> getProductsByPriceRange(BigDecimal minPrice, 
                                                  BigDecimal maxPrice, 
                                                  Pageable pageable) {
        return productRepository.findByPriceRange(minPrice, maxPrice, pageable);
    }
    
    public List<String> getAllBrands() {
        return productRepository.findAllActiveBrands();
    }
    
    @Transactional
    public Product createProduct(Product product) {
        product.setActive(true);
        return productRepository.save(product);
    }
    
    @Transactional
    public Product updateProduct(Long id, Product productDetails) {
        Product product = getProductById(id);
        
        product.setName(productDetails.getName());
        product.setDescription(productDetails.getDescription());
        product.setPrice(productDetails.getPrice());
        product.setDiscountPrice(productDetails.getDiscountPrice());
        product.setStockQuantity(productDetails.getStockQuantity());
        product.setBrand(productDetails.getBrand());
        product.setCategory(productDetails.getCategory());
        product.setImageUrls(productDetails.getImageUrls());
        
        return productRepository.save(product);
    }
    
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductById(id);
        product.setActive(false);
        productRepository.save(product);
    }
    
    @Transactional
    public void updateProductStock(Long productId, Integer quantity) {
        Product product = getProductById(productId);
        int newStock = product.getStockQuantity() - quantity;
        
        if (newStock < 0) {
            throw new RuntimeException("Insufficient stock");
        }
        
        product.setStockQuantity(newStock);
        productRepository.save(product);
    }
    
    @Transactional
    public void updateProductRating(Long productId) {
        Product product = getProductById(productId);
        
        List<Integer> ratings = product.getReviews().stream()
                .map(review -> review.getRating())
                .toList();
        
        if (!ratings.isEmpty()) {
            double average = ratings.stream()
                    .mapToInt(Integer::intValue)
                    .average()
                    .orElse(0.0);
            
            product.setAverageRating(average);
            product.setReviewCount(ratings.size());
            productRepository.save(product);
        }
    }
}