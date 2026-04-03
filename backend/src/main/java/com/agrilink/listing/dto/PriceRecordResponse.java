package com.agrilink.listing.dto;

import java.math.BigDecimal;

public record PriceRecordResponse(Long id, Long cropId, Long marketId, BigDecimal minPrice, BigDecimal maxPrice, BigDecimal averagePrice) {
}
