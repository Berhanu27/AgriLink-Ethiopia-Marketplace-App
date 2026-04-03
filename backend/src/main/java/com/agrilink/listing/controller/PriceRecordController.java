package com.agrilink.listing.controller;

import com.agrilink.listing.dto.CreatePriceRecordRequest;
import com.agrilink.listing.dto.PriceRecordResponse;
import com.agrilink.listing.service.PriceRecordService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/prices")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class PriceRecordController {

    private final PriceRecordService priceRecordService;

    public PriceRecordController(PriceRecordService priceRecordService) {
        this.priceRecordService = priceRecordService;
    }

    @GetMapping
    public List<PriceRecordResponse> list() {
        return priceRecordService.getAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAuthority('admin')")
    public PriceRecordResponse create(@Valid @RequestBody CreatePriceRecordRequest request) {
        return priceRecordService.create(request);
    }
}
