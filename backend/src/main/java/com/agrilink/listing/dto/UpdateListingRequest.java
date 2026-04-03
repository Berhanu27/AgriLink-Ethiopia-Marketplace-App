package com.agrilink.listing.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateListingRequest(
        Long cropId,
        String cropName,
        @Positive BigDecimal askingPrice,
        @Size(max = 1000) String imageUrl,
        @Size(max = 50) String quantity,
        @Size(max = 20) String unit,
        @Size(max = 200) String location,
        String description
) {
}
