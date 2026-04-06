package com.agrilink.delivery.service;

import com.agrilink.delivery.dto.CreateDeliveryRequest;
import com.agrilink.delivery.dto.DeliveryRequestResponse;
import com.agrilink.delivery.dto.UpdateDeliveryStatusRequest;

import java.util.List;

public interface DeliveryRequestService {
    DeliveryRequestResponse create(Long buyerId, CreateDeliveryRequest request);
    List<DeliveryRequestResponse> getForBuyer(Long buyerId);
    List<DeliveryRequestResponse> getForTransporter(Long transporterId);
    DeliveryRequestResponse updateStatus(Long transporterId, Long requestId, UpdateDeliveryStatusRequest request);
}
