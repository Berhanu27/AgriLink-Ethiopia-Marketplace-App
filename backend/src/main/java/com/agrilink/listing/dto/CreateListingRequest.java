package com.agrilink.listing.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateListingRequest(
        @NotNull Long sellerId,
                Long cropId,
                String cropName,
        @NotNull @Positive BigDecimal askingPrice,
        @Size(max = 1000) String imageUrl,
        @Size(max = 50) String quantity,
        @Size(max = 20) String unit,
        @Size(max = 200) String location,
        String description
) {
        @AssertTrue(message = "Either cropId or cropName is required")
        public boolean hasCropReference() {
                return cropId != null || (cropName != null && !cropName.trim().isEmpty());
        }
}
