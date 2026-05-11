package com.agrilink.auth.service;

import com.agrilink.auth.dto.AdminSetupRequest;
import com.agrilink.auth.dto.AuthResponse;
import com.agrilink.auth.dto.LoginRequest;
import com.agrilink.auth.dto.RegisterRequest;
import com.agrilink.email.service.EmailNotificationService;
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
    private final EmailNotificationService emailNotificationService;

    private static final String DEFAULT_ROLE = "user";

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           EmailNotificationService emailNotificationService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailNotificationService = emailNotificationService;
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
        
        // Send welcome email to new user
        try {
            sendWelcomeEmail(saved);
        } catch (Exception e) {
            System.err.println("[AuthService] Failed to send welcome email: " + e.getMessage());
        }
        
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

    private void sendWelcomeEmail(User user) {
        if (user.getEmail() == null || user.getEmail().isEmpty()) {
            System.out.println("[AuthService] User has no email, skipping welcome email");
            return;
        }

        String subject = "Welcome to AgriLink! 🌾";
        String htmlBody = buildWelcomeEmailHtml(user);
        
        emailNotificationService.sendCustomHtmlEmail(user.getEmail(), subject, htmlBody);
        System.out.println("[AuthService] Welcome email sent to " + user.getEmail());
    }

    private String buildWelcomeEmailHtml(User user) {
        String roleDisplay = user.getRoles().stream()
            .map(Role::getUserName)
            .map(r -> r.substring(0, 1).toUpperCase() + r.substring(1))
            .findFirst()
            .orElse("User");

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #10b981 0%%, #059669 100%%); color: white; padding: 30px 20px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; }
                    .content { padding: 30px 20px; }
                    .greeting { font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #1f2937; }
                    .message { font-size: 16px; margin-bottom: 15px; color: #4b5563; }
                    .info-box { background: #f0fdf4; border-left: 4px solid #10b981; padding: 15px; margin: 20px 0; border-radius: 4px; }
                    .info-box strong { color: #059669; }
                    .button { display: inline-block; padding: 12px 30px; background: #10b981; color: white; text-decoration: none; border-radius: 6px; margin: 20px 0; font-weight: bold; }
                    .button:hover { background: #059669; }
                    .footer { background: #f9fafb; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-top: 1px solid #e5e7eb; }
                    .features { margin: 20px 0; }
                    .feature { margin: 10px 0; padding-left: 25px; position: relative; }
                    .feature:before { content: "✓"; position: absolute; left: 0; color: #10b981; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌾 Welcome to AgriLink!</h1>
                        <p style="margin: 5px 0 0 0; font-size: 14px;">Ethiopia's Agricultural Marketplace</p>
                    </div>
                    <div class="content">
                        <div class="greeting">Hello %s!</div>
                        <div class="message">
                            Thank you for joining AgriLink, the platform connecting farmers, buyers, and transporters across Ethiopia.
                        </div>
                        
                        <div class="info-box">
                            <strong>Your Account Details:</strong><br>
                            Name: %s<br>
                            Phone: %s<br>
                            Role: %s<br>
                            Status: <span style="color: #f59e0b;">Pending Verification</span>
                        </div>

                        <div class="message">
                            <strong>What's Next?</strong>
                        </div>
                        
                        <div class="features">
                            <div class="feature">Your account is currently under review by our admin team</div>
                            <div class="feature">You'll receive an email once your account is verified</div>
                            <div class="feature">After verification, you'll have full access to all features</div>
                            <div class="feature">You can login now to explore the platform</div>
                        </div>

                        <center>
                            <a href="http://localhost:3000/login" class="button">Login to AgriLink</a>
                        </center>

                        <div class="message" style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                            If you have any questions, feel free to contact our support team.
                        </div>
                    </div>
                    <div class="footer">
                        <p>This is an automated message from AgriLink Platform</p>
                        <p>© 2024 AgriLink. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, 
            user.getFullName(),
            user.getFullName(),
            user.getPhone(),
            roleDisplay
        );
    }
}
