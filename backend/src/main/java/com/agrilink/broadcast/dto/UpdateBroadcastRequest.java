package com.agrilink.broadcast.dto;

import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record UpdateBroadcastRequest(
        @Size(max = 200) String cropName,
        @Positive BigDecimal price,
        @Size(max = 50) String unit,
        String note,
        @Size(max = 10000) String imageUrl
) {
}
