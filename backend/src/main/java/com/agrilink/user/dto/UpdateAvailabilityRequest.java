package com.agrilink.user.dto;

import jakarta.validation.constraints.NotNull;

public record UpdateAvailabilityRequest(
        @NotNull Boolean available
) {
}
