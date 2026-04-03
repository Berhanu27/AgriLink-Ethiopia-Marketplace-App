package com.agrilink.user.controller;

import com.agrilink.user.dto.CreateUserRequest;
import com.agrilink.user.dto.TransporterPublicResponse;
import com.agrilink.user.dto.UpdateAvailabilityRequest;
import com.agrilink.user.dto.UpdateVerificationRequest;
import com.agrilink.user.dto.UserResponse;
import com.agrilink.user.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);
    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public List<UserResponse> listUsers(Authentication authentication) {
        logger.info("GET /api/users - Authentication: {}", authentication);
        if (authentication != null) {
            logger.info("Principal: {}", authentication.getPrincipal());
            logger.info("Authorities: {}", authentication.getAuthorities());
            logger.info("Is authenticated: {}", authentication.isAuthenticated());
        }
        
        return userService.getAll();
    }

    @GetMapping("/transporters/public")
    public List<TransporterPublicResponse> listPublicTransporters() {
        return userService.getVerifiedTransporters();
    }

    @GetMapping("/profile")
    public UserResponse getProfile(Authentication authentication) {
        logger.info("GET /api/users/profile - Authentication: {}", authentication);
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        
        // Extract user ID from JWT principal
        String principal = authentication.getName();
        logger.info("Principal from JWT: {}", principal);
        
        Long userId;
        try {
            userId = Long.parseLong(principal);
        } catch (NumberFormatException e) {
            logger.error("Could not parse user ID from principal: {}", principal);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID in token");
        }
        
        logger.info("Getting profile for userId: {}", userId);
        
        return userService.getById(userId);
    }

    @PatchMapping("/profile/availability")
    public UserResponse updateAvailability(
            @Valid @RequestBody UpdateAvailabilityRequest request,
            Authentication authentication) {
        logger.info("PATCH /api/users/profile/availability - available: {}", request.available());

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        String principal = authentication.getName();
        Long userId;
        try {
            userId = Long.parseLong(principal);
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user ID in token");
        }

        return userService.updateAvailability(userId, request.available());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public UserResponse createUser(@Valid @RequestBody CreateUserRequest request) {
        return userService.create(request);
    }

    @PatchMapping("/{id}/verification")
    public UserResponse updateVerification(
            @PathVariable Long id,
            @Valid @RequestBody UpdateVerificationRequest request,
            Authentication authentication) {
        logger.info("PATCH /api/users/{}/verification - Status: {}", id, request.verificationStatus());
        logger.info("Authentication: {}", authentication);
        
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        
        return userService.updateVerificationStatus(id, request.verificationStatus());
    }

    @RequestMapping(value = "/{id}", method = RequestMethod.DELETE)
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(
            @PathVariable Long id,
            Authentication authentication) {
        logger.info("DELETE /api/users/{} called", id);
        logger.info("Authentication: {}", authentication);
        
        if (authentication == null || !authentication.isAuthenticated()) {
            logger.warn("Unauthorized delete attempt for user {}", id);
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        
        logger.info("Deleting user with ID: {}", id);
        userService.deleteUser(id);
        logger.info("User {} deleted successfully", id);
    }
}
