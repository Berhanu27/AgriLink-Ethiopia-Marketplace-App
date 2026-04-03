package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreateCropRequest;
import com.agrilink.listing.dto.CropResponse;

import java.util.List;

public interface CropService {
    List<CropResponse> getAll();
    CropResponse create(CreateCropRequest request);
}
