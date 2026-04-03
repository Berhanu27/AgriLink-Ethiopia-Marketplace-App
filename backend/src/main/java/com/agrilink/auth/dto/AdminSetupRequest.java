package com.agrilink.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record AdminSetupRequest(
        @NotBlank @Size(max = 200) String name,
        @NotBlank @Size(max = 50) String phone,
        @Email @Size(max = 200) String email,
        @NotBlank @Size(min = 6, max = 100) String password,
        String setupKey
) {
}
