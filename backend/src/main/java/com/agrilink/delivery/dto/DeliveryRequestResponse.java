package com.agrilink.delivery.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record DeliveryRequestResponse(
        Long id,
        Long buyerId,
        String buyerName,
        String buyerPhone,
        Long transporterId,
        String transporterName,
        String pickupLocation,
        String destination,
        String cargoType,
        BigDecimal weightValue,
        String weightUnit,
        String preferredTime,
        BigDecimal priceOffer,
        String notes,
        String status,
        String rejectReason,
        Instant createdAt
) {
}
