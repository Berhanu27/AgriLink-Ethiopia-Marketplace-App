package com.agrilink.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record CreateDeliveryRequest(
        @NotNull Long transporterId,
        @NotBlank @Size(max = 200) String pickupLocation,
        @NotBlank @Size(max = 200) String destination,
        @NotBlank @Size(max = 100) String cargoType,
        BigDecimal weightValue,
        @Size(max = 20) String weightUnit,
        @Size(max = 100) String preferredTime,
        BigDecimal priceOffer,
        String notes
) {
}
