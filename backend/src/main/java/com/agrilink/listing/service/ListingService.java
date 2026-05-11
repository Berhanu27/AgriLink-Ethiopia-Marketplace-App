package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreateListingRequest;
import com.agrilink.listing.dto.ListingResponse;
import com.agrilink.listing.dto.UpdateListingRequest;

import java.util.List;

public interface ListingService {
    List<ListingResponse> getAll();
    List<ListingResponse> getBySellerId(Long sellerId);
    ListingResponse create(CreateListingRequest request);
    ListingResponse update(Long listingId, UpdateListingRequest request, Long userId);
    void delete(Long listingId, Long userId);
}
