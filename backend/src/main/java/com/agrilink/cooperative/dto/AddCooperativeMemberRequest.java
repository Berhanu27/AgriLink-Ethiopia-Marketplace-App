package com.agrilink.cooperative.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record AddCooperativeMemberRequest(
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Size(max = 50) String phone,
        @NotBlank @Size(max = 200) String cropName,
        @NotNull @Positive BigDecimal quantity,
        @Size(max = 20) String unit,
        @NotNull @PositiveOrZero BigDecimal pricePerUnit
) {
}
