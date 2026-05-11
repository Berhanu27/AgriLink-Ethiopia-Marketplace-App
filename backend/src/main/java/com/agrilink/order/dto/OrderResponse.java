package com.agrilink.order.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record OrderResponse(
        Long id,
        Long buyerId,
        String buyerName,
        String buyerPhone,
        Long sellerId,
        String sellerName,
        String sellerPhone,
        Long listingId,
        String cropName,
        String requestedQuantity,
        String unit,
        BigDecimal offeredPrice,
        String buyerMessage,
        String status,
        String farmerResponse,
        String availableQuantity,
        String paymentScreenshotUrl,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        Long unreadCount,
        Boolean isNew
) {}
