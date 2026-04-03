package com.agrilink.listing.controller;

import com.agrilink.listing.dto.CreateCropRequest;
import com.agrilink.listing.dto.CropResponse;
import com.agrilink.listing.service.CropService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crops")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class CropController {

    private final CropService cropService;

    public CropController(CropService cropService) {
        this.cropService = cropService;
    }

    @GetMapping
    public List<CropResponse> list() {
        return cropService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('admin')")
    public CropResponse create(@Valid @RequestBody CreateCropRequest request) {
        return cropService.create(request);
    }
}
