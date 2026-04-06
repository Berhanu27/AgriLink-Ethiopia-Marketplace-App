package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreatePriceRecordRequest;
import com.agrilink.listing.dto.PriceRecordResponse;
import com.agrilink.listing.model.Crop;
import com.agrilink.listing.model.Market;
import com.agrilink.listing.model.PriceRecord;
import com.agrilink.listing.repository.CropRepository;
import com.agrilink.listing.repository.MarketRepository;
import com.agrilink.listing.repository.PriceRecordRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class PriceRecordServiceImpl implements PriceRecordService {

    private final PriceRecordRepository priceRecordRepository;
    private final CropRepository cropRepository;
    private final MarketRepository marketRepository;

    public PriceRecordServiceImpl(PriceRecordRepository priceRecordRepository,
                                  CropRepository cropRepository,
                                  MarketRepository marketRepository) {
        this.priceRecordRepository = priceRecordRepository;
        this.cropRepository = cropRepository;
        this.marketRepository = marketRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PriceRecordResponse> getAll() {
        return priceRecordRepository.findAll().stream()
                .map(pr -> new PriceRecordResponse(
                        pr.getId(),
                        pr.getCrop() != null ? pr.getCrop().getId() : null,
                        pr.getMarket() != null ? pr.getMarket().getId() : null,
                        pr.getMinPrice(),
                        pr.getMaxPrice(),
                        pr.getAveragePrice()
                ))
                .toList();
    }

    @Override
    public PriceRecordResponse create(CreatePriceRecordRequest request) {
        Long cropId = Objects.requireNonNull(request.cropId(), "cropId");
        Long marketId = Objects.requireNonNull(request.marketId(), "marketId");
        Crop crop = cropRepository.findById(cropId)
                .orElseThrow(() -> new IllegalArgumentException("Crop not found: " + cropId));
        Market market = marketRepository.findById(marketId)
                .orElseThrow(() -> new IllegalArgumentException("Market not found: " + marketId));

        PriceRecord record = new PriceRecord();
        record.setCrop(crop);
        record.setMarket(market);
        record.setMinPrice(request.minPrice());
        record.setMaxPrice(request.maxPrice());
        record.setAveragePrice(request.averagePrice());

        PriceRecord saved = priceRecordRepository.save(record);
                return new PriceRecordResponse(saved.getId(), crop.getId(), market.getId(), saved.getMinPrice(), saved.getMaxPrice(), saved.getAveragePrice());
    }
}
