package com.agrilink.listing.dto;

import java.math.BigDecimal;

public record ListingResponse(
	Long id,
	Long sellerId,
	String sellerName,
	String sellerPhone,
	String sellerRegion,
	Long cropId,
	String cropName,
	BigDecimal askingPrice,
	String imageUrl,
	String quantity,
	String unit,
	String location,
	String description
) {
}
