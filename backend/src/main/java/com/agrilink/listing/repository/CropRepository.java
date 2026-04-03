package com.agrilink.listing.repository;

import com.agrilink.listing.model.Crop;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface CropRepository extends JpaRepository<Crop, Long> {
	Optional<Crop> findByCropNameIgnoreCase(String cropName);
}
