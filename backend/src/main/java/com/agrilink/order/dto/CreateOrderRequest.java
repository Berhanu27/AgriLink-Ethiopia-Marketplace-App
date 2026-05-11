package com.agrilink.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public record CreateOrderRequest(
        @NotNull Long sellerId,
        Long listingId,
        @NotBlank String cropName,
        @NotBlank String requestedQuantity,
        @NotBlank String unit,
        BigDecimal offeredPrice,
        String buyerMessage
) {}
