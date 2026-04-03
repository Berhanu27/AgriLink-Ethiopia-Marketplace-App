package com.agrilink.listing.repository;

import com.agrilink.listing.model.Market;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MarketRepository extends JpaRepository<Market, Long> {
}
