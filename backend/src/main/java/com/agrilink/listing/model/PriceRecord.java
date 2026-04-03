package com.agrilink.listing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "price_records")
@Getter
@Setter
@NoArgsConstructor
public class PriceRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "price_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "crop_id")
    private Crop crop;

    @ManyToOne(optional = false)
    @JoinColumn(name = "market_id")
    private Market market;

    @Column(name = "min_price", precision = 12, scale = 2)
    private BigDecimal minPrice;

    @Column(name = "max_price", precision = 12, scale = 2)
    private BigDecimal maxPrice;

    @Column(name = "average_price", precision = 12, scale = 2, nullable = false)
    private BigDecimal averagePrice;
}
