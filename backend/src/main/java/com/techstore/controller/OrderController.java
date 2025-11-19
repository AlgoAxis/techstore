package com.techstore.controller;

import com.techstore.model.Order;
import com.techstore.model.ShippingAddress;
import com.techstore.security.UserDetailsImpl;
import com.techstore.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {
    
    private final OrderService orderService;
    
    @PostMapping
    public ResponseEntity<Order> createOrder(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            @RequestBody ShippingAddress shippingAddress) {
        return ResponseEntity.ok(
                orderService.createOrder(userDetails.getId(), shippingAddress));
    }
    
    @GetMapping
    public ResponseEntity<Page<Order>> getUserOrders(
            @AuthenticationPrincipal UserDetailsImpl userDetails,
            Pageable pageable) {
        return ResponseEntity.ok(orderService.getUserOrders(userDetails.getId(), pageable));
    }
    
    @GetMapping("/{orderId}")
    public ResponseEntity<Order> getOrderById(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<Order> getOrderByNumber(@PathVariable String orderNumber) {
        return ResponseEntity.ok(orderService.getOrderByNumber(orderNumber));
    }
}