package com.agrilink.delivery.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "delivery_requests")
@Getter
@Setter
@NoArgsConstructor
public class DeliveryRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "request_id")
    private Long id;

    @Column(name = "buyer_id", nullable = false)
    private Long buyerId;

    @Column(name = "transporter_id", nullable = false)
    private Long transporterId;

    @Column(name = "pickup_location", length = 200, nullable = false)
    private String pickupLocation;

    @Column(name = "destination", length = 200, nullable = false)
    private String destination;

    @Column(name = "cargo_type", length = 100, nullable = false)
    private String cargoType;

    @Column(name = "weight_value", precision = 12, scale = 2)
    private BigDecimal weightValue;

    @Column(name = "weight_unit", length = 20)
    private String weightUnit;

    @Column(name = "preferred_time", length = 100)
    private String preferredTime;

    @Column(name = "price_offer", precision = 12, scale = 2)
    private BigDecimal priceOffer;

    @Column(name = "notes")
    private String notes;

    @Column(name = "status", length = 30, nullable = false)
    private String status = "pending";

    @Column(name = "reject_reason", length = 300)
    private String rejectReason;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = Instant.now();
    }
}
