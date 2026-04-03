package com.agrilink.auth.dto;

import java.util.Set;

public record AuthResponse(Long userId, String fullName, String phone, Set<String> roles, String token, String verificationStatus) {
}
