package com.techstore.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import com.techstore.model.Order;

import jakarta.annotation.PostConstruct;
import java.util.UUID;

@Service
public class PaymentService {

    @Value("${stripe.api-key:dummy_key}")
    private String stripeApiKey;

    private final OrderService orderService;

    public PaymentService(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostConstruct
    public void init() {
    
        System.out.println("⚠ Stripe Mock Mode Enabled — No real payments involved.");
    }

    
    public MockPaymentIntent createPaymentIntent(Long orderId) {

        Order order = orderService.getOrderById(orderId);

        // calculate fake amount (not sent to Stripe)
        long amount = order.getTotal()
                .multiply(java.math.BigDecimal.valueOf(100))
                .longValue();

        //
        String fakePaymentIntentId = "pi_mock_" + UUID.randomUUID();
        String fakeClientSecret = fakePaymentIntentId + "_secret_" + UUID.randomUUID();

        
        order.setPaymentIntentId(fakePaymentIntentId);
        orderService.updateOrderStatus(orderId, Order.OrderStatus.PENDING);

        
        return new MockPaymentIntent(fakePaymentIntentId, fakeClientSecret, amount);
    }

    public void handlePaymentSuccess(String paymentIntentId) {
        orderService.updatePaymentStatus(paymentIntentId, Order.PaymentStatus.PAID);
    }

    
    public void handlePaymentFailure(String paymentIntentId) {
        orderService.updatePaymentStatus(paymentIntentId, Order.PaymentStatus.FAILED);
    }

    
    public static class MockPaymentIntent {
        private String id;
        private String clientSecret;
        private long amount;

        public MockPaymentIntent(String id, String clientSecret, long amount) {
            this.id = id;
            this.clientSecret = clientSecret;
            this.amount = amount;
        }

        public String getId() { return id; }
        public String getClientSecret() { return clientSecret; }
        public long getAmount() { return amount; }
    }
}