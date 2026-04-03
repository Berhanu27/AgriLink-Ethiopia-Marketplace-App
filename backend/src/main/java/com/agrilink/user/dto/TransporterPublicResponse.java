package com.agrilink.user.dto;

public record TransporterPublicResponse(
        Long id,
        String fullName,
        String phone,
        String region,
        String vehicleType,
        String vehicleCapacity,
        String vehicleImageUrl
) {
}
