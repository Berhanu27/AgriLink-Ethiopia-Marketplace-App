package com.agrilink.delivery.service;

import com.agrilink.delivery.dto.CreateDeliveryRequest;
import com.agrilink.delivery.dto.DeliveryRequestResponse;
import com.agrilink.delivery.dto.UpdateDeliveryStatusRequest;
import com.agrilink.delivery.model.DeliveryRequest;
import com.agrilink.delivery.repository.DeliveryRequestRepository;
import com.agrilink.user.model.Role;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;
import java.util.Set;

@Service
@Transactional
public class DeliveryRequestServiceImpl implements DeliveryRequestService {

    private final DeliveryRequestRepository deliveryRequestRepository;
    private final UserRepository userRepository;

    public DeliveryRequestServiceImpl(DeliveryRequestRepository deliveryRequestRepository,
                                      UserRepository userRepository) {
        this.deliveryRequestRepository = deliveryRequestRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DeliveryRequestResponse create(Long buyerId, CreateDeliveryRequest request) {
        Long safeBuyerId = Objects.requireNonNull(buyerId, "buyerId");
        User buyer = userRepository.findById(safeBuyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));

        if (!"verified".equalsIgnoreCase(buyer.getVerificationStatus()) || !hasRole(buyer, "buyer")) {
            throw new IllegalArgumentException("Buyer is not verified");
        }

        Long transporterId = Objects.requireNonNull(request.transporterId(), "transporterId");
        User transporter = userRepository.findById(transporterId)
                .orElseThrow(() -> new IllegalArgumentException("Transporter not found"));

        if (!"verified".equalsIgnoreCase(transporter.getVerificationStatus()) || !hasRole(transporter, "transporter")) {
            throw new IllegalArgumentException("Transporter is not verified");
        }

        if (!Boolean.TRUE.equals(transporter.getAvailable())) {
            throw new IllegalArgumentException("Transporter is offline");
        }

        DeliveryRequest deliveryRequest = new DeliveryRequest();
        deliveryRequest.setBuyerId(safeBuyerId);
        deliveryRequest.setTransporterId(transporterId);
        deliveryRequest.setPickupLocation(request.pickupLocation());
        deliveryRequest.setDestination(request.destination());
        deliveryRequest.setCargoType(request.cargoType());
        deliveryRequest.setWeightValue(request.weightValue());
        deliveryRequest.setWeightUnit(request.weightUnit());
        deliveryRequest.setPreferredTime(request.preferredTime());
        deliveryRequest.setPriceOffer(request.priceOffer());
        deliveryRequest.setNotes(request.notes());
        deliveryRequest.setStatus("pending");

        DeliveryRequest saved = deliveryRequestRepository.save(deliveryRequest);
        return toResponse(saved, buyer, transporter);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestResponse> getForBuyer(Long buyerId) {
        return deliveryRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestResponse> getForTransporter(Long transporterId) {
        return deliveryRequestRepository.findByTransporterIdOrderByCreatedAtDesc(transporterId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public DeliveryRequestResponse updateStatus(Long transporterId, Long requestId, UpdateDeliveryStatusRequest request) {
        Long safeTransporterId = Objects.requireNonNull(transporterId, "transporterId");
        Long safeRequestId = Objects.requireNonNull(requestId, "requestId");
        DeliveryRequest deliveryRequest = deliveryRequestRepository.findById(safeRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery request not found"));

        if (!deliveryRequest.getTransporterId().equals(safeTransporterId)) {
            throw new IllegalArgumentException("You can only manage your own requests");
        }

        String status = request.status().trim().toLowerCase();
        if ("rejected".equals(status) && !StringUtils.hasText(request.rejectReason())) {
            throw new IllegalArgumentException("Reject reason is required");
        }

        deliveryRequest.setStatus(status);
        deliveryRequest.setRejectReason(request.rejectReason());

        DeliveryRequest saved = deliveryRequestRepository.save(deliveryRequest);
        return toResponse(saved);
    }

    private DeliveryRequestResponse toResponse(DeliveryRequest request) {
        Long buyerId = request.getBuyerId();
        User buyer = buyerId != null ? userRepository.findById(buyerId).orElse(null) : null;
        Long transporterId = request.getTransporterId();
        User transporter = transporterId != null ? userRepository.findById(transporterId).orElse(null) : null;
        return toResponse(request, buyer, transporter);
    }

    private DeliveryRequestResponse toResponse(DeliveryRequest request, User buyer, User transporter) {
        return new DeliveryRequestResponse(
                request.getId(),
                request.getBuyerId(),
                buyer != null ? buyer.getFullName() : null,
                buyer != null ? buyer.getPhone() : null,
                request.getTransporterId(),
                transporter != null ? transporter.getFullName() : null,
                request.getPickupLocation(),
                request.getDestination(),
                request.getCargoType(),
                request.getWeightValue(),
                request.getWeightUnit(),
                request.getPreferredTime(),
                request.getPriceOffer(),
                request.getNotes(),
                request.getStatus(),
                request.getRejectReason(),
                request.getCreatedAt()
        );
    }

    private boolean hasRole(User user, String roleName) {
        Set<Role> roles = user.getRoles();
        return roles.stream().anyMatch(role -> roleName.equalsIgnoreCase(role.getUserName()));
    }
}
