package com.agrilink.delivery.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateDeliveryStatusRequest(
        @NotBlank String status,
        String rejectReason
) {
}
