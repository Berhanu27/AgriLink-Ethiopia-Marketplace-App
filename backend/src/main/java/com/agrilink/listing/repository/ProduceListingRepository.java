package com.agrilink.listing.repository;

import com.agrilink.listing.model.ProduceListing;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProduceListingRepository extends JpaRepository<ProduceListing, Long> {
}
