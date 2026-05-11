package com.agrilink.listing.service;

import com.agrilink.listing.dto.CreateListingRequest;
import com.agrilink.listing.dto.ListingResponse;
import com.agrilink.listing.dto.UpdateListingRequest;
import com.agrilink.listing.model.Crop;
import com.agrilink.listing.model.ProduceListing;
import com.agrilink.listing.repository.CropRepository;
import com.agrilink.listing.repository.ProduceListingRepository;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@Transactional
public class ListingServiceImpl implements ListingService {

    private final ProduceListingRepository listingRepository;
    private final UserRepository userRepository;
    private final CropRepository cropRepository;

    public ListingServiceImpl(ProduceListingRepository listingRepository,
                              UserRepository userRepository,
                              CropRepository cropRepository) {
        this.listingRepository = listingRepository;
        this.userRepository = userRepository;
        this.cropRepository = cropRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListingResponse> getAll() {
        return listingRepository.findAll().stream()
                .map(l -> new ListingResponse(
                        l.getId(),
                        l.getSeller() != null ? l.getSeller().getId() : null,
                        l.getSeller() != null ? l.getSeller().getFullName() : null,
                        l.getSeller() != null ? l.getSeller().getPhone() : null,
                        l.getSeller() != null ? l.getSeller().getRegion() : null,
                        l.getCrop() != null ? l.getCrop().getId() : null,
                        l.getCrop() != null ? l.getCrop().getCropName() : null,
                        l.getAskingPrice(),
                        l.getImageUrl(),
                        l.getQuantity(),
                        l.getUnit(),
                        l.getLocation(),
                        l.getDescription()))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<ListingResponse> getBySellerId(Long sellerId) {
        return listingRepository.findBySellerId(sellerId).stream()
                .map(l -> new ListingResponse(
                        l.getId(),
                        l.getSeller() != null ? l.getSeller().getId() : null,
                        l.getSeller() != null ? l.getSeller().getFullName() : null,
                        l.getSeller() != null ? l.getSeller().getPhone() : null,
                        l.getSeller() != null ? l.getSeller().getRegion() : null,
                        l.getCrop() != null ? l.getCrop().getId() : null,
                        l.getCrop() != null ? l.getCrop().getCropName() : null,
                        l.getAskingPrice(),
                        l.getImageUrl(),
                        l.getQuantity(),
                        l.getUnit(),
                        l.getLocation(),
                        l.getDescription()))
                .toList();
    }

    @Override
    public ListingResponse create(CreateListingRequest request) {
        User seller = userRepository.findById(request.sellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found: " + request.sellerId()));

                Crop crop;
                if (request.cropId() != null) {
                        crop = cropRepository.findById(request.cropId())
                                        .orElseThrow(() -> new IllegalArgumentException("Crop not found: " + request.cropId()));
                } else if (StringUtils.hasText(request.cropName())) {
                        String normalizedCropName = request.cropName().trim();
                        crop = cropRepository.findByCropNameIgnoreCase(normalizedCropName)
                                        .orElseGet(() -> {
                                                Crop newCrop = new Crop();
                                                newCrop.setCropName(normalizedCropName);
                                                return cropRepository.save(newCrop);
                                        });
                } else {
                        throw new IllegalArgumentException("Either cropId or cropName must be provided");
                }

        ProduceListing listing = new ProduceListing();
        listing.setSeller(seller);
        listing.setCrop(crop);
        listing.setAskingPrice(request.askingPrice());
                listing.setImageUrl(request.imageUrl());
                listing.setQuantity(request.quantity());
                listing.setUnit(request.unit());
                listing.setLocation(request.location());
                listing.setDescription(request.description());

        ProduceListing saved = listingRepository.save(listing);
                return new ListingResponse(
                                saved.getId(),
                                seller.getId(),
                                seller.getFullName(),
                                seller.getPhone(),
                                seller.getRegion(),
                                crop.getId(),
                                crop.getCropName(),
                                saved.getAskingPrice(),
                                saved.getImageUrl(),
                                saved.getQuantity(),
                                saved.getUnit(),
                                saved.getLocation(),
                                saved.getDescription()
                );
    }

        @Override
        public ListingResponse update(Long listingId, UpdateListingRequest request, Long userId) {
                ProduceListing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

                if (listing.getSeller() == null || !listing.getSeller().getId().equals(userId)) {
                        throw new AccessDeniedException("You can only edit your own listings");
                }

                if (request.cropId() != null || StringUtils.hasText(request.cropName())) {
                        Crop crop;
                        if (request.cropId() != null) {
                                crop = cropRepository.findById(request.cropId())
                                                .orElseThrow(() -> new IllegalArgumentException("Crop not found: " + request.cropId()));
                        } else {
                                String normalizedCropName = request.cropName().trim();
                                crop = cropRepository.findByCropNameIgnoreCase(normalizedCropName)
                                                .orElseGet(() -> {
                                                        Crop newCrop = new Crop();
                                                        newCrop.setCropName(normalizedCropName);
                                                        return cropRepository.save(newCrop);
                                                });
                        }
                        listing.setCrop(crop);
                }

                if (request.askingPrice() != null) {
                        listing.setAskingPrice(request.askingPrice());
                }
                if (request.imageUrl() != null) {
                        listing.setImageUrl(request.imageUrl());
                }
                if (request.quantity() != null) {
                        listing.setQuantity(request.quantity());
                }
                if (request.unit() != null) {
                        listing.setUnit(request.unit());
                }
                if (request.location() != null) {
                        listing.setLocation(request.location());
                }
                if (request.description() != null) {
                        listing.setDescription(request.description());
                }

                ProduceListing saved = listingRepository.save(listing);
                User seller = saved.getSeller();
                Crop crop = saved.getCrop();

                return new ListingResponse(
                                saved.getId(),
                                seller != null ? seller.getId() : null,
                                seller != null ? seller.getFullName() : null,
                                seller != null ? seller.getPhone() : null,
                                seller != null ? seller.getRegion() : null,
                                crop != null ? crop.getId() : null,
                                crop != null ? crop.getCropName() : null,
                                saved.getAskingPrice(),
                                saved.getImageUrl(),
                                saved.getQuantity(),
                                saved.getUnit(),
                                saved.getLocation(),
                                saved.getDescription()
                );
        }

        @Override
        public void delete(Long listingId, Long userId) {
                ProduceListing listing = listingRepository.findById(listingId)
                                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

                if (listing.getSeller() == null || !listing.getSeller().getId().equals(userId)) {
                        throw new AccessDeniedException("You can only delete your own listings");
                }

                listingRepository.delete(listing);
        }
}
