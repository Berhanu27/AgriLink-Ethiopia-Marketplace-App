package com.agrilink.broadcast.dto;

import java.math.BigDecimal;
import java.time.Instant;

public record BroadcastResponse(
        Long id,
        String cropName,
        BigDecimal price,
        String unit,
        String note,
        String imageUrl,
        Instant createdAt
) {
}
