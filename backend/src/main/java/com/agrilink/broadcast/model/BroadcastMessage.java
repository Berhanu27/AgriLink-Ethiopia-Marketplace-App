package com.agrilink.broadcast.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "broadcast_messages")
@Getter
@Setter
@NoArgsConstructor
public class BroadcastMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "broadcast_id")
    private Long id;

    @Column(name = "crop_name", nullable = false, length = 200)
    private String cropName;

    @Column(name = "price", nullable = false, precision = 12, scale = 2)
    private BigDecimal price;

    @Column(name = "unit", nullable = false, length = 50)
    private String unit = "unit";

    @Column(name = "note", columnDefinition = "text")
    private String note;

    @Column(name = "image_url", length = 10000)
    private String imageUrl;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();
}
