package com.agrilink.delivery.service;

import com.agrilink.delivery.dto.CreateDeliveryRequest;
import com.agrilink.delivery.dto.DeliveryRequestResponse;
import com.agrilink.delivery.dto.UpdateDeliveryStatusRequest;
import com.agrilink.delivery.dto.DeliveryMessageRequest;
import com.agrilink.delivery.dto.DeliveryMessageResponse;
import com.agrilink.delivery.model.DeliveryRequest;
import com.agrilink.delivery.model.DeliveryMessage;
import com.agrilink.delivery.repository.DeliveryRequestRepository;
import com.agrilink.delivery.repository.DeliveryMessageRepository;
import com.agrilink.email.service.EmailNotificationService;
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
    private final DeliveryMessageRepository deliveryMessageRepository;
    private final UserRepository userRepository;
    private final EmailNotificationService emailNotificationService;

    public DeliveryRequestServiceImpl(DeliveryRequestRepository deliveryRequestRepository,
                                      DeliveryMessageRepository deliveryMessageRepository,
                                      UserRepository userRepository,
                                      EmailNotificationService emailNotificationService) {
        this.deliveryRequestRepository = deliveryRequestRepository;
        this.deliveryMessageRepository = deliveryMessageRepository;
        this.userRepository = userRepository;
        this.emailNotificationService = emailNotificationService;
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
        
        // Send email notification to transporter about new delivery request
        try {
            emailNotificationService.notifyNewDeliveryRequest(saved, buyer, transporter);
        } catch (Exception e) {
            System.err.println("[DeliveryService] Failed to send new delivery request email: " + e.getMessage());
        }
        
        return toResponse(saved, buyer, transporter, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestResponse> getForBuyer(Long buyerId) {
        return deliveryRequestRepository.findByBuyerIdOrderByCreatedAtDesc(buyerId).stream()
                .map(request -> toResponse(request, buyerId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryRequestResponse> getForTransporter(Long transporterId) {
        return deliveryRequestRepository.findByTransporterIdOrderByCreatedAtDesc(transporterId).stream()
                .map(request -> toResponse(request, transporterId))
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

        String oldStatus = deliveryRequest.getStatus();
        deliveryRequest.setStatus(status);
        deliveryRequest.setRejectReason(request.rejectReason());

        DeliveryRequest saved = deliveryRequestRepository.save(deliveryRequest);
        
        // Send email notification to buyer when status changes
        if (!status.equals(oldStatus)) {
            try {
                User buyer = userRepository.findById(saved.getBuyerId()).orElse(null);
                User transporter = userRepository.findById(saved.getTransporterId()).orElse(null);
                if (buyer != null && transporter != null) {
                    emailNotificationService.notifyDeliveryStatusChange(saved, buyer, transporter, status);
                }
            } catch (Exception e) {
                System.err.println("[DeliveryService] Failed to send delivery status email: " + e.getMessage());
            }
        }
        
        return toResponse(saved, safeTransporterId);
    }

    private DeliveryRequestResponse toResponse(DeliveryRequest request, Long userId) {
        Long buyerId = request.getBuyerId();
        User buyer = buyerId != null ? userRepository.findById(buyerId).orElse(null) : null;
        Long transporterId = request.getTransporterId();
        User transporter = transporterId != null ? userRepository.findById(transporterId).orElse(null) : null;
        
        // Calculate unread message count for this user
        long unreadCount = deliveryMessageRepository.countUnreadMessages(request.getId(), userId);
        System.out.println("=== Delivery Request " + request.getId() + " unread count for user " + userId + ": " + unreadCount);
        
        return toResponse(request, buyer, transporter, unreadCount);
    }

    private DeliveryRequestResponse toResponse(DeliveryRequest request) {
        Long buyerId = request.getBuyerId();
        User buyer = buyerId != null ? userRepository.findById(buyerId).orElse(null) : null;
        Long transporterId = request.getTransporterId();
        User transporter = transporterId != null ? userRepository.findById(transporterId).orElse(null) : null;
        return toResponse(request, buyer, transporter, 0L);
    }

    private DeliveryRequestResponse toResponse(DeliveryRequest request, User buyer, User transporter, Long unreadCount) {
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
                request.getCreatedAt(),
                unreadCount
        );
    }

    private boolean hasRole(User user, String roleName) {
        Set<Role> roles = user.getRoles();
        return roles.stream().anyMatch(role -> roleName.equalsIgnoreCase(role.getUserName()));
    }

    @Override
    public DeliveryMessageResponse sendMessage(Long deliveryRequestId, Long senderId, DeliveryMessageRequest request) {
        DeliveryRequest deliveryRequest = deliveryRequestRepository.findById(deliveryRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery request not found"));
        
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("Sender not found"));

        // Verify sender is part of this delivery request
        if (!deliveryRequest.getBuyerId().equals(senderId) && !deliveryRequest.getTransporterId().equals(senderId)) {
            throw new IllegalArgumentException("You are not authorized to send messages for this delivery request");
        }

        DeliveryMessage message = new DeliveryMessage();
        message.setDeliveryRequest(deliveryRequest);
        message.setSender(sender);
        message.setMessage(request.getMessage());
        message.setIsRead(false);

        DeliveryMessage saved = deliveryMessageRepository.save(message);
        return new DeliveryMessageResponse(
                saved.getId(),
                saved.getSender().getId(),
                saved.getSender().getFullName(),
                saved.getMessage(),
                saved.getIsRead(),
                saved.getCreatedAt(),
                saved.getUpdatedAt(),
                saved.getIsEdited()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<DeliveryMessageResponse> getMessages(Long deliveryRequestId, Long userId) {
        DeliveryRequest deliveryRequest = deliveryRequestRepository.findById(deliveryRequestId)
                .orElseThrow(() -> new IllegalArgumentException("Delivery request not found"));

        // Verify user is part of this delivery request
        if (!deliveryRequest.getBuyerId().equals(userId) && !deliveryRequest.getTransporterId().equals(userId)) {
            throw new IllegalArgumentException("You are not authorized to view messages for this delivery request");
        }

        return deliveryMessageRepository.findByDeliveryRequestIdOrderByCreatedAtAsc(deliveryRequestId).stream()
                .map(msg -> new DeliveryMessageResponse(
                        msg.getId(),
                        msg.getSender().getId(),
                        msg.getSender().getFullName(),
                        msg.getMessage(),
                        msg.getIsRead(),
                        msg.getCreatedAt(),
                        msg.getUpdatedAt(),
                        msg.getIsEdited()
                ))
                .toList();
    }

    @Override
    public void markMessagesAsRead(Long deliveryRequestId, Long userId) {
        deliveryMessageRepository.markMessagesAsRead(deliveryRequestId, userId);
    }

    @Override
    public DeliveryMessageResponse updateMessage(Long messageId, Long userId, DeliveryMessageRequest request) {
        DeliveryMessage message = deliveryMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify the user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        message.setMessage(request.getMessage());
        message.setUpdatedAt(java.time.LocalDateTime.now());
        message.setIsEdited(true);

        DeliveryMessage updated = deliveryMessageRepository.save(message);
        return new DeliveryMessageResponse(
                updated.getId(),
                updated.getSender().getId(),
                updated.getSender().getFullName(),
                updated.getMessage(),
                updated.getIsRead(),
                updated.getCreatedAt(),
                updated.getUpdatedAt(),
                updated.getIsEdited()
        );
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        DeliveryMessage message = deliveryMessageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify the user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        deliveryMessageRepository.delete(message);
    }
}
