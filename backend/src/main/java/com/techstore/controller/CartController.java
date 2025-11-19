package com.techstore.controller;

import com.techstore.model.Cart;
import com.techstore.security.UserDetailsImpl;
import com.techstore.service.CartService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {
    
    private final CartService cartService;
    
    @GetMapping
    public ResponseEntity<Cart> getCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(cartService.getCartByUserId(userDetails.getId()));
    }
    
    @PostMapping("/items")
    public ResponseEntity<Cart> addItemToCart(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestParam Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(
                cartService.addItemToCart(userDetails.getId(), productId, quantity));
    }
    
    @PutMapping("/items/{productId}")
    public ResponseEntity<Cart> updateCartItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long productId,
            @RequestParam Integer quantity) {
        return ResponseEntity.ok(
                cartService.updateCartItemQuantity(userDetails.getId(), productId, quantity));
    }
    
    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Cart> removeCartItem(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @PathVariable Long productId) {
        return ResponseEntity.ok(
                cartService.removeItemFromCart(userDetails.getId(), productId));
    }
    
    @DeleteMapping
    public ResponseEntity<Void> clearCart(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        cartService.clearCart(userDetails.getId());
        return ResponseEntity.ok().build();
    }
}
