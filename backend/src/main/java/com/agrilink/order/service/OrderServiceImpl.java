package com.agrilink.order.service;

import com.agrilink.email.service.EmailNotificationService;
import com.agrilink.listing.model.ProduceListing;
import com.agrilink.listing.repository.ProduceListingRepository;
import com.agrilink.order.dto.CreateOrderRequest;
import com.agrilink.order.dto.MessageRequest;
import com.agrilink.order.dto.MessageResponse;
import com.agrilink.order.dto.OrderResponse;
import com.agrilink.order.dto.UpdateOrderRequest;
import com.agrilink.order.model.OrderMessage;
import com.agrilink.order.model.PurchaseOrder;
import com.agrilink.order.repository.OrderMessageRepository;
import com.agrilink.order.repository.PurchaseOrderRepository;
import com.agrilink.user.model.User;
import com.agrilink.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final PurchaseOrderRepository orderRepository;
    private final UserRepository userRepository;
    private final ProduceListingRepository listingRepository;
    private final OrderMessageRepository messageRepository;
    private final EmailNotificationService emailNotificationService;

    public OrderServiceImpl(PurchaseOrderRepository orderRepository,
                            UserRepository userRepository,
                            ProduceListingRepository listingRepository,
                            OrderMessageRepository messageRepository,
                            EmailNotificationService emailNotificationService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.messageRepository = messageRepository;
        this.emailNotificationService = emailNotificationService;
    }

    @Override
    public OrderResponse createOrder(CreateOrderRequest request, Long buyerId) {
        User buyer = userRepository.findById(buyerId)
                .orElseThrow(() -> new IllegalArgumentException("Buyer not found"));

        User seller = userRepository.findById(request.sellerId())
                .orElseThrow(() -> new IllegalArgumentException("Seller not found"));

        PurchaseOrder order = new PurchaseOrder();
        order.setBuyer(buyer);
        order.setSeller(seller);
        order.setCropName(request.cropName());
        order.setRequestedQuantity(request.requestedQuantity());
        order.setUnit(request.unit());
        order.setOfferedPrice(request.offeredPrice());
        order.setBuyerMessage(request.buyerMessage());
        order.setStatus("pending");

        if (request.listingId() != null) {
            ProduceListing listing = listingRepository.findById(request.listingId())
                    .orElse(null);
            order.setListing(listing);
        }

        PurchaseOrder saved = orderRepository.save(order);
        
        // Send email notification to farmer about new order
        try {
            emailNotificationService.notifyNewOrder(saved, seller);
        } catch (Exception e) {
            System.err.println("[OrderService] Failed to send new order email: " + e.getMessage());
        }
        
        return toResponse(saved, buyerId);
    }

    @Override
    public OrderResponse updateOrder(Long orderId, UpdateOrderRequest request, Long userId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Check if user is buyer or seller
        if (!order.getBuyer().getId().equals(userId) && !order.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("You can only update your own orders");
        }

        if (StringUtils.hasText(request.status())) {
            String oldStatus = order.getStatus();
            order.setStatus(request.status());
            
            // Send email notification to buyer when status changes
            if (!request.status().equals(oldStatus)) {
                try {
                    emailNotificationService.notifyOrderStatusChange(order, order.getBuyer(), request.status());
                } catch (Exception e) {
                    System.err.println("[OrderService] Failed to send order status email: " + e.getMessage());
                }
            }
        }

        if (StringUtils.hasText(request.farmerResponse())) {
            // Only seller can set farmer response
            if (!order.getSeller().getId().equals(userId)) {
                throw new AccessDeniedException("Only seller can respond to orders");
            }
            order.setFarmerResponse(request.farmerResponse());
        }

        if (StringUtils.hasText(request.availableQuantity())) {
            order.setAvailableQuantity(request.availableQuantity());
        }

        if (StringUtils.hasText(request.paymentScreenshotUrl())) {
            // Only buyer can upload payment screenshot
            if (!order.getBuyer().getId().equals(userId)) {
                throw new AccessDeniedException("Only buyer can upload payment proof");
            }
            order.setPaymentScreenshotUrl(request.paymentScreenshotUrl());
        }

        PurchaseOrder saved = orderRepository.save(order);
        return toResponse(saved, userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForBuyer(Long buyerId) {
        return orderRepository.findByBuyerId(buyerId).stream()
                .map(order -> toResponse(order, buyerId))
                .toList();
    }

    @Override
    public List<OrderResponse> getOrdersForSeller(Long sellerId) {
        List<PurchaseOrder> orders = orderRepository.findBySellerId(sellerId);
        
        // Mark all pending orders as viewed
        LocalDateTime now = LocalDateTime.now();
        orders.stream()
                .filter(order -> order.getSellerViewedAt() == null && "pending".equals(order.getStatus()))
                .forEach(order -> {
                    order.setSellerViewedAt(now);
                    orderRepository.save(order);
                });
        
        return orders.stream()
                .map(order -> toResponse(order, sellerId))
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long orderId, Long userId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Check if user is buyer or seller
        if (!order.getBuyer().getId().equals(userId) && !order.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("You can only view your own orders");
        }

        return toResponse(order, userId);
    }

    private OrderResponse toResponse(PurchaseOrder order, Long currentUserId) {
        User buyer = order.getBuyer();
        User seller = order.getSeller();
        
        // Count unread messages for current user
        long unreadCount = messageRepository.countUnreadMessages(order.getId(), currentUserId);
        
        // Check if order is new for seller (not viewed yet and status is pending)
        boolean isNew = false;
        if (seller != null && seller.getId().equals(currentUserId)) {
            isNew = order.getSellerViewedAt() == null && "pending".equals(order.getStatus());
        }

        return new OrderResponse(
                order.getId(),
                buyer != null ? buyer.getId() : null,
                buyer != null ? buyer.getFullName() : null,
                buyer != null ? buyer.getPhone() : null,
                seller != null ? seller.getId() : null,
                seller != null ? seller.getFullName() : null,
                seller != null ? seller.getPhone() : null,
                order.getListing() != null ? order.getListing().getId() : null,
                order.getCropName(),
                order.getRequestedQuantity(),
                order.getUnit(),
                order.getOfferedPrice(),
                order.getBuyerMessage(),
                order.getStatus(),
                order.getFarmerResponse(),
                order.getAvailableQuantity(),
                order.getPaymentScreenshotUrl(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                unreadCount,
                isNew
        );
    }

    @Override
    public MessageResponse sendMessage(Long orderId, MessageRequest request, Long senderId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check if user is buyer or seller
        if (!order.getBuyer().getId().equals(senderId) && !order.getSeller().getId().equals(senderId)) {
            throw new AccessDeniedException("You can only send messages to your own orders");
        }

        OrderMessage message = new OrderMessage();
        message.setOrder(order);
        message.setSender(sender);
        message.setMessage(request.getMessage());

        OrderMessage saved = messageRepository.save(message);
        return toMessageResponse(saved);
    }

    @Override
    public List<MessageResponse> getMessages(Long orderId, Long userId) {
        PurchaseOrder order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Order not found"));

        // Check if user is buyer or seller
        if (!order.getBuyer().getId().equals(userId) && !order.getSeller().getId().equals(userId)) {
            throw new AccessDeniedException("You can only view messages for your own orders");
        }

        // Mark all messages from the other party as read
        messageRepository.markMessagesAsRead(orderId, userId);

        return messageRepository.findByOrderIdOrderByCreatedAtAsc(orderId).stream()
                .map(this::toMessageResponse)
                .toList();
    }

    private MessageResponse toMessageResponse(OrderMessage message) {
        return new MessageResponse(
                message.getId(),
                message.getOrder().getId(),
                message.getSender().getId(),
                message.getSender().getFullName(),
                message.getMessage(),
                message.getCreatedAt(),
                message.getUpdatedAt(),
                message.getIsEdited()
        );
    }

    @Override
    public MessageResponse updateMessage(Long messageId, Long userId, MessageRequest request) {
        OrderMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify the user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only edit your own messages");
        }

        message.setMessage(request.getMessage());
        message.setUpdatedAt(java.time.LocalDateTime.now());
        message.setIsEdited(true);

        OrderMessage updated = messageRepository.save(message);
        return toMessageResponse(updated);
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        OrderMessage message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found"));

        // Verify the user is the sender
        if (!message.getSender().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }
}
