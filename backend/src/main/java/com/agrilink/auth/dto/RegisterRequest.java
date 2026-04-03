package com.agrilink.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Size(max = 50) String phone,
        @Size(max = 200) String email,
        @Size(max = 50) String nationalId,
        @Size(max = 50) String role,
        @Size(max = 100) String region,
        @Size(max = 100) String vehicleType,
        @Size(max = 100) String vehicleCapacity,
        @Size(max = 1000) String vehicleImageUrl,
        @Size(max = 200) String cooperativeName,
        Integer memberCount,
        @NotBlank @Size(min = 6, max = 100) String password
) {
}
