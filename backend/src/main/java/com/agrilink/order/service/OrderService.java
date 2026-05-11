package com.agrilink.order.service;

import com.agrilink.order.dto.CreateOrderRequest;
import com.agrilink.order.dto.MessageRequest;
import com.agrilink.order.dto.MessageResponse;
import com.agrilink.order.dto.OrderResponse;
import com.agrilink.order.dto.UpdateOrderRequest;

import java.util.List;

public interface OrderService {
    OrderResponse createOrder(CreateOrderRequest request, Long buyerId);
    OrderResponse updateOrder(Long orderId, UpdateOrderRequest request, Long userId);
    List<OrderResponse> getOrdersForBuyer(Long buyerId);
    List<OrderResponse> getOrdersForSeller(Long sellerId);
    OrderResponse getOrderById(Long orderId, Long userId);
    MessageResponse sendMessage(Long orderId, MessageRequest request, Long senderId);
    List<MessageResponse> getMessages(Long orderId, Long userId);
    MessageResponse updateMessage(Long messageId, Long userId, MessageRequest request);
    void deleteMessage(Long messageId, Long userId);
}
