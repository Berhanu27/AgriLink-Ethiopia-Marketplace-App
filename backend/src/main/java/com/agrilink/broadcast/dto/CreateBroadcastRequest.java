package com.agrilink.broadcast.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;

public record CreateBroadcastRequest(
        @NotBlank String cropName,
        @NotNull @Positive BigDecimal price,
        @NotBlank String unit,
        String note,
        String imageUrl
) {
}
