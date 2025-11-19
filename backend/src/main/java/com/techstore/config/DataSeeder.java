// backend/src/main/java/com/techstore/config/DataSeeder.java
package com.techstore.config;

import com.techstore.model.*;
import com.techstore.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.*;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataSeeder {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final CartRepository cartRepository;
    private final PasswordEncoder passwordEncoder;

    @EventListener(ApplicationReadyEvent.class)
    public void initDatabase() {
        // Check if data already exists
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Starting database seeding...");

        // Create Roles
        Role userRole = createRoleIfNotExists(Role.RoleType.ROLE_USER);
        Role adminRole = createRoleIfNotExists(Role.RoleType.ROLE_ADMIN);

        // Create Admin User
        User admin = createAdminUser(adminRole, userRole);

        // Create Test Users
        List<User> users = createTestUsers(userRole);

        // Create Categories
        List<Category> categories = createCategories();

        // Create Products
        createProducts(categories);

        log.info("Database seeding completed successfully!");
    }

    private Role createRoleIfNotExists(Role.RoleType roleType) {
        return roleRepository.findByName(roleType)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(roleType);
                    return roleRepository.save(role);
                });
    }

    private User createAdminUser(Role adminRole, Role userRole) {
        if (userRepository.existsByEmail("admin@techstore.com")) {
            return userRepository.findByEmail("admin@techstore.com").get();
        }

        User admin = new User();
        admin.setEmail("admin@techstore.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setFirstName("Admin");
        admin.setLastName("User");
        admin.setPhoneNumber("+1-555-0100");

        Set<Role> adminRoles = new HashSet<>();
        adminRoles.add(adminRole);
        adminRoles.add(userRole);
        admin.setRoles(adminRoles);

        User savedAdmin = userRepository.save(admin);

        Cart adminCart = new Cart();
        adminCart.setUser(savedAdmin);
        cartRepository.save(adminCart);

        log.info("Admin user created: admin@techstore.com / admin123");
        return savedAdmin;
    }

    private List<User> createTestUsers(Role userRole) {
        List<User> users = new ArrayList<>();
        String[] firstNames = {"John", "Jane", "Mike", "Sarah", "David"};
        String[] lastNames = {"Doe", "Smith", "Johnson", "Williams", "Brown"};

        for (int i = 0; i < 5; i++) {
            String email = firstNames[i].toLowerCase() + "@test.com";

            if (userRepository.existsByEmail(email)) continue;

            User user = new User();
            user.setEmail(email);
            user.setPassword(passwordEncoder.encode("password123"));
            user.setFirstName(firstNames[i]);
            user.setLastName(lastNames[i]);
            user.setPhoneNumber("+1-555-010" + i);

            user.setRoles(Set.of(userRole));

            User savedUser = userRepository.save(user);
            users.add(savedUser);

            Cart cart = new Cart();
            cart.setUser(savedUser);
            cartRepository.save(cart);
        }

        log.info("Created {} test users", users.size());
        return users;
    }

    private List<Category> createCategories() {
        List<Category> categories = new ArrayList<>();

        Category electronics = createCategory("Electronics", "Electronic devices and gadgets", null);
        categories.add(electronics);

        categories.add(createCategory("Laptops", "Portable computers", electronics));
        categories.add(createCategory("Smartphones", "Mobile phones", electronics));
        categories.add(createCategory("Tablets", "Tablet devices", electronics));

        Category accessories = createCategory("Accessories", "Tech accessories", null);
        categories.add(accessories);

        categories.add(createCategory("Headphones", "Audio devices", accessories));
        categories.add(createCategory("Cables", "Cables and adapters", accessories));

        categories.add(createCategory("Home & Office", "Products for home and office", null));

        log.info("Created {} categories", categories.size());
        return categories;
    }

    private Category createCategory(String name, String desc, Category parent) {
        Category c = new Category();
        c.setName(name);
        c.setDescription(desc);
        c.setParent(parent);
        c.setActive(true);
        return categoryRepository.save(c);
    }

    private void createProducts(List<Category> categories) {
        Category laptops = categories.stream().filter(c -> c.getName().equals("Laptops")).findFirst().orElse(null);
        Category smartphones = categories.stream().filter(c -> c.getName().equals("Smartphones")).findFirst().orElse(null);
        Category headphones = categories.stream().filter(c -> c.getName().equals("Headphones")).findFirst().orElse(null);

        // Laptops
        createProduct("MacBook Pro 16\"", "Apple M2 Pro chip, 16GB RAM, 512GB SSD", new BigDecimal("2499.99"), new BigDecimal("2299.99"), 15, "MBP16-2023", "Apple", laptops, List.of("https://via.placeholder.com/400x300?text=MacBook+Pro"));

        createProduct("Dell XPS 15", "Intel Core i7, 16GB RAM, 1TB SSD, NVIDIA RTX 3050", new BigDecimal("1899.99"), null, 20, "DELL-XPS15", "Dell", laptops, List.of("https://via.placeholder.com/400x300?text=Dell+XPS"));

        createProduct("HP Spectre x360", "Intel Core i7, 16GB RAM, 512GB SSD, Touchscreen", new BigDecimal("1599.99"), new BigDecimal("1449.99"), 10, "HP-SPECTRE", "HP", laptops, List.of("https://via.placeholder.com/400x300?text=HP+Spectre"));

        // Smartphones
        createProduct("iPhone 15 Pro", "A17 Pro chip, 256GB storage, Titanium design", new BigDecimal("1199.99"), new BigDecimal("1099.99"), 30, "IP15P-256", "Apple", smartphones, List.of("https://via.placeholder.com/400x300?text=iPhone+15"));

        createProduct("Samsung Galaxy S24 Ultra", "Snapdragon 8 Gen 3, 512GB, S Pen included", new BigDecimal("1299.99"), null, 25, "SGS24U-512", "Samsung", smartphones, List.of("https://via.placeholder.com/400x300?text=Galaxy+S24"));

        createProduct("Google Pixel 8 Pro", "Google Tensor G3, 256GB storage, Advanced camera", new BigDecimal("999.99"), new BigDecimal("899.99"), 18, "GP8P-256", "Google", smartphones, List.of("https://via.placeholder.com/400x300?text=Pixel+8"));

        // Headphones
        createProduct("Sony WH-1000XM5", "Premium noise canceling wireless headphones", new BigDecimal("399.99"), new BigDecimal("349.99"), 40, "SONY-XM5", "Sony", headphones, List.of("https://via.placeholder.com/400x300?text=Sony+XM5"));

        createProduct("AirPods Pro (2nd Gen)", "Noise Cancellation, USB-C", new BigDecimal("249.99"), null, 50, "APP2-USBC", "Apple", headphones, List.of("https://via.placeholder.com/400x300?text=AirPods+Pro"));

        createProduct("Bose QC45", "Wireless noise cancelling headphones", new BigDecimal("329.99"), new BigDecimal("279.99"), 35, "BOSE-QC45", "Bose", headphones, List.of("https://via.placeholder.com/400x300?text=Bose+QC45"));

        log.info("Created sample products");
    }

    private void createProduct(
            String name, String desc, BigDecimal price, BigDecimal discountPrice,
            Integer stock, String sku, String brand, Category category, List<String> images) {

        Product p = new Product();
        p.setName(name);
        p.setDescription(desc);
        p.setPrice(price);
        p.setDiscountPrice(discountPrice);
        p.setStockQuantity(stock);
        p.setSku(sku);
        p.setBrand(brand);
        p.setCategory(category);
        p.setImageUrls(new ArrayList<>(images));
        p.setActive(true);
        p.setAverageRating(4.5);
        p.setReviewCount(0);

        productRepository.save(p);
    }
}
