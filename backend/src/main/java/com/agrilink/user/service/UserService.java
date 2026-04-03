package com.agrilink.user.service;

import com.agrilink.user.dto.CreateUserRequest;
import com.agrilink.user.dto.TransporterPublicResponse;
import com.agrilink.user.dto.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAll();
    UserResponse create(CreateUserRequest request);
    UserResponse updateVerificationStatus(Long userId, String verificationStatus);
    UserResponse getByPhone(String phone);
    UserResponse getById(Long userId);
    UserResponse updateAvailability(Long userId, boolean available);
    void deleteUser(Long userId);
    java.util.List<TransporterPublicResponse> getVerifiedTransporters();
}
