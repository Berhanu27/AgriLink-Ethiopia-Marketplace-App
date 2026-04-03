package com.agrilink.listing.model;

import com.agrilink.user.model.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "produce_listings")
@Getter
@Setter
@NoArgsConstructor
public class ProduceListing {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "listing_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "seller_id")
    private User seller;

    @ManyToOne(optional = false)
    @JoinColumn(name = "crop_id")
    private Crop crop;

    @Column(name = "asking_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal askingPrice;

    @Column(name = "image_url", length = 1000)
    private String imageUrl;

    @Column(name = "quantity", length = 50)
    private String quantity;

    @Column(name = "unit", length = 20)
    private String unit;

    @Column(name = "location", length = 200)
    private String location;

    @Column(name = "description")
    private String description;
}
