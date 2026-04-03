package com.agrilink.auth.service;

import com.agrilink.auth.dto.AdminSetupRequest;
import com.agrilink.auth.dto.AuthResponse;
import com.agrilink.auth.dto.LoginRequest;
import com.agrilink.auth.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse login(LoginRequest request);
    AuthResponse setupAdmin(AdminSetupRequest request);
}
