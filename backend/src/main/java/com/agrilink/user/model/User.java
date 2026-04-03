package com.agrilink.user.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 50, unique = true)
    private String phone;

    @Column(name = "email", length = 200)
    private String email;

    @Column(name = "national_id", length = 50)
    private String nationalId;

    @Column(name = "region", length = 100)
    private String region;

    @Column(name = "vehicle_type", length = 100)
    private String vehicleType;

    @Column(name = "vehicle_capacity", length = 100)
    private String vehicleCapacity;

    @Column(name = "vehicle_image_url", length = 1000)
    private String vehicleImageUrl;

    @Column(name = "is_available")
    private Boolean available = true;

    @Column(name = "cooperative_name", length = 200)
    private String cooperativeName;

    @Column(name = "member_count")
    private Integer memberCount;

    @Column(name = "verification_status", length = 50)
    private String verificationStatus = "unverified";

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash = "";

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();
}
