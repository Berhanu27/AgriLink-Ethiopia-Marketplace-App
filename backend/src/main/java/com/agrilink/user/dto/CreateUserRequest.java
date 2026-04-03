package com.agrilink.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Size(max = 200) String fullName,
        @NotBlank @Size(max = 50) String phone,
        @Size(max = 200) String email,
        @Size(max = 50) String verificationStatus
) {
}
