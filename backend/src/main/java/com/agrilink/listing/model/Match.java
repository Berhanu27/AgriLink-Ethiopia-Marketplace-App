package com.agrilink.listing.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "matches")
@Getter
@Setter
@NoArgsConstructor
public class Match {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "match_id")
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "listing_id")
    private ProduceListing listing;

    @ManyToOne(optional = false)
    @JoinColumn(name = "demand_id")
    private DemandPost demandPost;
}
