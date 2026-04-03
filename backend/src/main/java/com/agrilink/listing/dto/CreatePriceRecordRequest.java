package com.agrilink.listing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreatePriceRecordRequest(
        @NotNull Long cropId,
        @NotNull Long marketId,
        BigDecimal minPrice,
        BigDecimal maxPrice,
        @NotNull @Positive BigDecimal averagePrice
) {
}
