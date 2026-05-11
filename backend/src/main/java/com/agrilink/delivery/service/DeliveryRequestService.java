package com.agrilink.delivery.service;

import com.agrilink.delivery.dto.CreateDeliveryRequest;
import com.agrilink.delivery.dto.DeliveryRequestResponse;
import com.agrilink.delivery.dto.UpdateDeliveryStatusRequest;
import com.agrilink.delivery.dto.DeliveryMessageRequest;
import com.agrilink.delivery.dto.DeliveryMessageResponse;

import java.util.List;

public interface DeliveryRequestService {
    DeliveryRequestResponse create(Long buyerId, CreateDeliveryRequest request);
    List<DeliveryRequestResponse> getForBuyer(Long buyerId);
    List<DeliveryRequestResponse> getForTransporter(Long transporterId);
    DeliveryRequestResponse updateStatus(Long transporterId, Long requestId, UpdateDeliveryStatusRequest request);
    
    // Messaging methods
    DeliveryMessageResponse sendMessage(Long deliveryRequestId, Long senderId, DeliveryMessageRequest request);
    List<DeliveryMessageResponse> getMessages(Long deliveryRequestId, Long userId);
    void markMessagesAsRead(Long deliveryRequestId, Long userId);
    DeliveryMessageResponse updateMessage(Long messageId, Long userId, DeliveryMessageRequest request);
    void deleteMessage(Long messageId, Long userId);
}
