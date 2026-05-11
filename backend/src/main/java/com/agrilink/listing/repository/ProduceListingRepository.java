package com.agrilink.listing.repository;

import com.agrilink.listing.model.ProduceListing;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProduceListingRepository extends JpaRepository<ProduceListing, Long> {
    List<ProduceListing> findBySellerId(Long sellerId);
}
