package com.techstore.controller;

import com.techstore.service.PaymentService;
import com.techstore.service.PaymentService.MockPaymentIntent;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/create-intent")
    public ResponseEntity<Map<String, String>> createPaymentIntent(@RequestParam Long orderId) {

        // Call our mock payment service
        MockPaymentIntent mockIntent = paymentService.createPaymentIntent(orderId);

        Map<String, String> response = new HashMap<>();
        response.put("clientSecret", mockIntent.getClientSecret());
        response.put("paymentIntentId", mockIntent.getId());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/webhook")
    public ResponseEntity<String> handleStripeWebhook(@RequestBody String payload) {
        return ResponseEntity.ok("Webhook (mock) received");
    }
}
