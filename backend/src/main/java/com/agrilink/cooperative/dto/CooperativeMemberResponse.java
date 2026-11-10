package com.agrilink.cooperative.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CooperativeMemberResponse(
        Long id,
        String fullName,
        String phone,
        String cropName,
        BigDecimal quantity,
        String unit,
        BigDecimal pricePerUnit,
        LocalDateTime createdAt
) {
}
