package com.agrilink.auth.service;

import com.agrilink.auth.dto.AdminSetupRequest;
import com.agrilink.auth.dto.AuthResponse;
import com.agrilink.auth.dto.LoginRequest;
import com.agrilink.auth.dto.RegisterRequest;
import com.agrilink.security.JwtService;
import com.agrilink.user.model.Role;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.RoleRepository;
import com.agrilink.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
@Transactional
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    private static final String DEFAULT_ROLE = "user";

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new IllegalArgumentException("Phone already registered");
        }

        String requestedRole = request.role() == null || request.role().isBlank()
                ? DEFAULT_ROLE
                : request.role().trim().toLowerCase();

        Role role = roleRepository.findByUserName(requestedRole)
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setUserName(requestedRole);
                    return roleRepository.save(r);
                });

        User user = new User();
        user.setFullName(request.fullName());
        user.setPhone(request.phone());
        user.setEmail(request.email());
        user.setNationalId(request.nationalId());
        user.setRegion(request.region());
        user.setVehicleType(request.vehicleType());
        user.setVehicleCapacity(request.vehicleCapacity());
        user.setVehicleImageUrl(request.vehicleImageUrl());
        user.setAvailable(true);
        user.setCooperativeName(request.cooperativeName());
        user.setMemberCount(request.memberCount());
        user.setVerificationStatus("unverified");
        user.setPasswordHash(passwordEncoder.encode(request.password()));
        user.getRoles().add(role);

        User saved = userRepository.save(user);
        String token = jwtService.generate(saved);
        Set<String> roles = saved.getRoles().stream().map(Role::getUserName).collect(java.util.stream.Collectors.toSet());
        return new AuthResponse(saved.getId(), saved.getFullName(), saved.getPhone(), roles, token, saved.getVerificationStatus());
    }

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        System.out.println("Login attempt for phone: " + request.phone());
        
        User user = userRepository.findByPhone(request.phone())
                .orElseThrow(() -> {
                    System.out.println("User not found for phone: " + request.phone());
                    return new IllegalArgumentException("Invalid credentials");
                });

        System.out.println("User found: " + user.getFullName() + ", checking password...");
        
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            System.out.println("Password does not match for user: " + user.getFullName());
            throw new IllegalArgumentException("Invalid credentials");
        }

        System.out.println("Login successful for user: " + user.getFullName());
        String token = jwtService.generate(user);
        Set<String> roles = user.getRoles().stream().map(Role::getUserName).collect(java.util.stream.Collectors.toSet());
        return new AuthResponse(user.getId(), user.getFullName(), user.getPhone(), roles, token, user.getVerificationStatus());
    }

    @Override
    public AuthResponse setupAdmin(AdminSetupRequest request) {
        // Check if admin already exists
        if (userRepository.findByPhone(request.phone()).isPresent()) {
            throw new IllegalStateException("Admin user already exists with this phone number");
        }

        // Get or create admin role
        Role adminRole = roleRepository.findByUserName("admin")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setUserName("admin");
                    return roleRepository.save(r);
                });

        Role adminRoleUpper = roleRepository.findByUserName("ADMIN")
                .orElseGet(() -> {
                    Role r = new Role();
                    r.setUserName("ADMIN");
                    return roleRepository.save(r);
                });

        // Create admin user with provided details
        User admin = new User();
        admin.setFullName(request.name());
        admin.setPhone(request.phone());
        admin.setEmail(request.email());
        admin.setVerificationStatus("verified");
        admin.setPasswordHash(passwordEncoder.encode(request.password()));
        admin.getRoles().add(adminRole);
        admin.getRoles().add(adminRoleUpper);

        User saved = userRepository.save(admin);
        
        System.out.println("Admin user created successfully!");
        System.out.println("Name: " + saved.getFullName());
        System.out.println("Phone: " + saved.getPhone());
        System.out.println("Email: " + saved.getEmail());
        
        String token = jwtService.generate(saved);
        Set<String> roles = saved.getRoles().stream().map(Role::getUserName).collect(java.util.stream.Collectors.toSet());
        return new AuthResponse(saved.getId(), saved.getFullName(), saved.getPhone(), roles, token, saved.getVerificationStatus());
    }
}
