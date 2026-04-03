package com.agrilink.user.service;

import com.agrilink.user.dto.CreateUserRequest;
import com.agrilink.user.dto.TransporterPublicResponse;
import com.agrilink.user.dto.UserResponse;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAll() {
        return userRepository.findAll().stream()
                .map(u -> new UserResponse(
                        u.getId(),
                        u.getFullName(),
                        u.getPhone(),
                        u.getEmail(),
                    u.getNationalId(),
                    u.getRegion(),
                    u.getVehicleType(),
                    u.getVehicleCapacity(),
                    u.getVehicleImageUrl(),
                        u.getAvailable(),
                    u.getCooperativeName(),
                    u.getMemberCount(),
                        u.getVerificationStatus(),
                        u.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
                ))
                .toList();
    }

    @Override
    public UserResponse create(CreateUserRequest request) {
        User user = new User();
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setEmail(request.email());
        if (request.verificationStatus() != null) {
            user.setVerificationStatus(request.verificationStatus());
        }
        User saved = userRepository.save(user);
        return new UserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getEmail(),
            saved.getNationalId(),
            saved.getRegion(),
            saved.getVehicleType(),
            saved.getVehicleCapacity(),
            saved.getVehicleImageUrl(),
            saved.getAvailable(),
            saved.getCooperativeName(),
            saved.getMemberCount(),
                saved.getVerificationStatus(),
                saved.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Override
    public UserResponse updateVerificationStatus(Long userId, String verificationStatus) {
        System.out.println("[UserService] Update verification: userId=" + userId + ", status=" + verificationStatus);

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        System.out.println("[UserService] Current status before update: " + user.getVerificationStatus());
        user.setVerificationStatus(verificationStatus);
        System.out.println("[UserService] Status after set: " + user.getVerificationStatus());
        
        User saved = userRepository.save(user);
        userRepository.flush(); // Force flush to database
        System.out.println("[UserService] Status after save and flush: " + saved.getVerificationStatus());

        // Verify it was saved by fetching again
        User verified = userRepository.findById(userId).orElse(null);
        if (verified != null) {
            System.out.println("[UserService] Verified from DB: " + verified.getVerificationStatus());
        }

        return new UserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getEmail(),
            saved.getNationalId(),
            saved.getRegion(),
            saved.getVehicleType(),
            saved.getVehicleCapacity(),
            saved.getVehicleImageUrl(),
            saved.getAvailable(),
            saved.getCooperativeName(),
            saved.getMemberCount(),
                saved.getVerificationStatus(),
                saved.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getByPhone(String phone) {
        User user = userRepository.findByPhone(phone)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
            user.getNationalId(),
            user.getRegion(),
            user.getVehicleType(),
            user.getVehicleCapacity(),
            user.getVehicleImageUrl(),
            user.getAvailable(),
            user.getCooperativeName(),
            user.getMemberCount(),
                user.getVerificationStatus(),
                user.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getById(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getPhone(),
                user.getEmail(),
            user.getNationalId(),
            user.getRegion(),
            user.getVehicleType(),
            user.getVehicleCapacity(),
            user.getVehicleImageUrl(),
            user.getAvailable(),
            user.getCooperativeName(),
            user.getMemberCount(),
                user.getVerificationStatus(),
                user.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Override
    public UserResponse updateAvailability(Long userId, boolean available) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setAvailable(available);
        User saved = userRepository.save(user);

        return new UserResponse(
                saved.getId(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getEmail(),
                saved.getNationalId(),
                saved.getRegion(),
                saved.getVehicleType(),
                saved.getVehicleCapacity(),
                saved.getVehicleImageUrl(),
                saved.getAvailable(),
                saved.getCooperativeName(),
                saved.getMemberCount(),
                saved.getVerificationStatus(),
                saved.getRoles().stream().map(r -> r.getUserName()).collect(java.util.stream.Collectors.toSet())
        );
    }

    @Override
    public void deleteUser(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new IllegalArgumentException("User not found"));
        
        System.out.println("[UserService] Deleting user: " + user.getFullName() + " (ID: " + userId + ")");
        userRepository.delete(user);
        System.out.println("[UserService] User deleted successfully");
    }

    @Override
    @Transactional(readOnly = true)
    public List<TransporterPublicResponse> getVerifiedTransporters() {
        return userRepository.findAll().stream()
                .filter(user -> "verified".equalsIgnoreCase(user.getVerificationStatus()))
            .filter(user -> Boolean.TRUE.equals(user.getAvailable()))
                .filter(user -> user.getRoles().stream().anyMatch(r -> "transporter".equalsIgnoreCase(r.getUserName())))
                .map(user -> new TransporterPublicResponse(
                        user.getId(),
                        user.getFullName(),
                        user.getPhone(),
                        user.getRegion(),
                        user.getVehicleType(),
                    user.getVehicleCapacity(),
                    user.getVehicleImageUrl()
                ))
                .toList();
    }
}
