package com.agrilink.cooperative.model;

import com.agrilink.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "cooperative_members")
@Getter
@Setter
@NoArgsConstructor
public class CooperativeMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "member_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "cooperative_id")
    private User cooperative;

    @Column(name = "full_name", nullable = false, length = 200)
    private String fullName;

    @Column(name = "phone", nullable = false, length = 50)
    private String phone;

    @Column(name = "crop_name", nullable = false, length = 200)
    private String cropName;

    @Column(name = "quantity", nullable = false, precision = 12, scale = 2)
    private BigDecimal quantity;

    @Column(name = "unit", nullable = false, length = 20)
    private String unit = "kg";

    @Column(name = "price_per_unit", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerUnit;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
