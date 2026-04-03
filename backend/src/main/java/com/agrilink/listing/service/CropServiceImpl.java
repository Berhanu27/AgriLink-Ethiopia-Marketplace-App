package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreateCropRequest;
import com.agrilink.listing.dto.CropResponse;
import com.agrilink.listing.model.Crop;
import com.agrilink.listing.repository.CropRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class CropServiceImpl implements CropService {

    private final CropRepository cropRepository;

    public CropServiceImpl(CropRepository cropRepository) {
        this.cropRepository = cropRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CropResponse> getAll() {
        return cropRepository.findAll().stream()
                .map(c -> new CropResponse(c.getId(), c.getCropName()))
                .toList();
    }

    @Override
    public CropResponse create(CreateCropRequest request) {
        Crop crop = new Crop();
        crop.setCropName(request.name());
        Crop saved = cropRepository.save(crop);
        return new CropResponse(saved.getId(), saved.getCropName());
    }
}
