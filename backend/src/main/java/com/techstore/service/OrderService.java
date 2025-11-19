package com.techstore.service;

import com.techstore.model.*;
import com.techstore.repository.OrderRepository;
import com.techstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class OrderService {
    
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final CartService cartService;
    private final ProductService productService;
    
    @Transactional
    public Order createOrder(Long userId, ShippingAddress shippingAddress) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Cart cart = cartService.getCartByUserId(userId);
        
        if (cart.getItems().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }
        
        Order order = new Order();
        order.setUser(user);
        order.setOrderNumber(generateOrderNumber());
        order.setShippingAddress(shippingAddress);
        order.setStatus(Order.OrderStatus.PENDING);
        order.setPaymentStatus(Order.PaymentStatus.PENDING);
        
        // Create order items from cart
        List<OrderItem> orderItems = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        
        for (CartItem cartItem : cart.getItems()) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());
            orderItem.setPrice(cartItem.getPrice());
            orderItem.setProductName(cartItem.getProduct().getName());
            orderItem.setProductSku(cartItem.getProduct().getSku());
            
            orderItems.add(orderItem);
            
            BigDecimal itemTotal = cartItem.getPrice()
                    .multiply(BigDecimal.valueOf(cartItem.getQuantity()));
            subtotal = subtotal.add(itemTotal);
            
            // Update product stock
            productService.updateProductStock(
                    cartItem.getProduct().getId(), 
                    cartItem.getQuantity()
            );
        }
        
        order.setItems(orderItems);
        order.setSubtotal(subtotal);
        order.setTax(subtotal.multiply(BigDecimal.valueOf(0.1))); // 10% tax
        order.setShippingCost(BigDecimal.valueOf(10)); // Flat $10 shipping
        order.setTotal(order.getSubtotal().add(order.getTax()).add(order.getShippingCost()));
        
        Order savedOrder = orderRepository.save(order);
        
        // Clear the cart
        cartService.clearCart(userId);
        
        return savedOrder;
    }
    
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public Order getOrderByNumber(String orderNumber) {
        return orderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Order not found"));
    }
    
    public Page<Order> getUserOrders(Long userId, Pageable pageable) {
        return orderRepository.findByUserId(userId, pageable);
    }
    
    public Page<Order> getAllOrders(Pageable pageable) {
        return orderRepository.findAll(pageable);
    }
    
    @Transactional
    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }
    
    @Transactional
    public Order updatePaymentStatus(String paymentIntentId, 
                                      Order.PaymentStatus paymentStatus) {
        Order order = orderRepository.findByPaymentIntentId(paymentIntentId)
                .orElseThrow(() -> new RuntimeException("Order not found"));
        
        order.setPaymentStatus(paymentStatus);
        
        if (paymentStatus == Order.PaymentStatus.PAID) {
            order.setStatus(Order.OrderStatus.PROCESSING);
        }
        
        return orderRepository.save(order);
    }
    
    private String generateOrderNumber() {
        return "ORD-" + LocalDateTime.now().getYear() + "-" + 
               UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
