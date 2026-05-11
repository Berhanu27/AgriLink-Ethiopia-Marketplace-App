package com.agrilink.order.dto;

public record UpdateOrderRequest(
        String status,
        String farmerResponse,
        String availableQuantity,
        String paymentScreenshotUrl
) {}
