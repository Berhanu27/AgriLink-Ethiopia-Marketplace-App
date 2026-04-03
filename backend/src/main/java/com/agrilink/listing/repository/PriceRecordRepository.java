package com.agrilink.listing.repository;

import com.agrilink.listing.model.PriceRecord;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PriceRecordRepository extends JpaRepository<PriceRecord, Long> {
}
