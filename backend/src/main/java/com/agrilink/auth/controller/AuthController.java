package com.agrilink.auth.controller;

import com.agrilink.auth.dto.AdminSetupRequest;
import com.agrilink.auth.dto.AuthResponse;
import com.agrilink.auth.dto.LoginRequest;
import com.agrilink.auth.dto.RegisterRequest;
import com.agrilink.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/setup-admin")
    public ResponseEntity<?> setupAdmin(
            @RequestHeader(value = "X-Setup-Key", required = false) String headerKey,
            @Valid @RequestBody AdminSetupRequest request) {
        
        // Verify setup key (check both header and body)
        String expectedKey = "AGRILINK_ADMIN_2024";
        String setupKey = headerKey != null ? headerKey : request.setupKey();
        
        System.out.println("Setup key received: " + setupKey);
        System.out.println("Expected key: " + expectedKey);
        
        if (setupKey == null || !setupKey.equals(expectedKey)) {
            System.out.println("Invalid setup key!");
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("message", "Invalid setup key"));
        }
        
        try {
            AuthResponse response = authService.setupAdmin(request);
            return ResponseEntity.ok(Map.of(
                "message", "Admin user created successfully",
                "phone", response.phone(),
                "name", response.fullName(),
                "roles", response.roles()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(Map.of("message", e.getMessage()));
        }
    }
}
