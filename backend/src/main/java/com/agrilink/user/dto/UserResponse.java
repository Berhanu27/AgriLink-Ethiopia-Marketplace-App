package com.agrilink.user.dto;

import java.util.Set;

public record UserResponse(
        Long id,
        String fullName,
        String phone,
        String email,
        String nationalId,
        String region,
        String vehicleType,
        String vehicleCapacity,
        String vehicleImageUrl,
        Boolean available,
        String cooperativeName,
        Integer memberCount,
        String verificationStatus,
        Set<String> roles
) {
}
