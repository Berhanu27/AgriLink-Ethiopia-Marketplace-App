package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreatePriceRecordRequest;
import com.agrilink.listing.dto.PriceRecordResponse;

import java.util.List;

public interface PriceRecordService {
    List<PriceRecordResponse> getAll();
    PriceRecordResponse create(CreatePriceRecordRequest request);
}
