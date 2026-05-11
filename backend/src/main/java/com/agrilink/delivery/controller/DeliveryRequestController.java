package com.agrilink.delivery.controller;

import com.agrilink.delivery.dto.CreateDeliveryRequest;
import com.agrilink.delivery.dto.DeliveryRequestResponse;
import com.agrilink.delivery.dto.UpdateDeliveryStatusRequest;
import com.agrilink.delivery.dto.DeliveryMessageRequest;
import com.agrilink.delivery.dto.DeliveryMessageResponse;
import com.agrilink.delivery.service.DeliveryRequestService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/delivery-requests")
public class DeliveryRequestController {

    private final DeliveryRequestService deliveryRequestService;

    public DeliveryRequestController(DeliveryRequestService deliveryRequestService) {
        this.deliveryRequestService = deliveryRequestService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryRequestResponse create(@Valid @RequestBody CreateDeliveryRequest request,
                                          Authentication authentication) {
        System.out.println("=== DeliveryRequestController.create() ===");
        System.out.println("Authentication: " + authentication);
        if (authentication != null) {
            System.out.println("  Principal: " + authentication.getPrincipal());
            System.out.println("  Authenticated: " + authentication.isAuthenticated());
            System.out.println("  Authorities: " + authentication.getAuthorities());
        }
        Long buyerId = getUserId(authentication);
        return deliveryRequestService.create(buyerId, request);
    }

    @GetMapping("/buyer")
    public List<DeliveryRequestResponse> listForBuyer(Authentication authentication) {
        Long buyerId = getUserId(authentication);
        return deliveryRequestService.getForBuyer(buyerId);
    }

    @GetMapping("/transporter")
    public List<DeliveryRequestResponse> listForTransporter(Authentication authentication) {
        Long transporterId = getUserId(authentication);
        return deliveryRequestService.getForTransporter(transporterId);
    }

    @PatchMapping("/{id}/status")
    public DeliveryRequestResponse updateStatus(@PathVariable Long id,
                                                @Valid @RequestBody UpdateDeliveryStatusRequest request,
                                                Authentication authentication) {
        Long transporterId = getUserId(authentication);
        return deliveryRequestService.updateStatus(transporterId, id, request);
    }

    // Messaging endpoints
    @PostMapping("/{id}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public DeliveryMessageResponse sendMessage(@PathVariable Long id,
                                               @Valid @RequestBody DeliveryMessageRequest request,
                                               Authentication authentication) {
        Long senderId = getUserId(authentication);
        return deliveryRequestService.sendMessage(id, senderId, request);
    }

    @GetMapping("/{id}/messages")
    public List<DeliveryMessageResponse> getMessages(@PathVariable Long id,
                                                     Authentication authentication) {
        Long userId = getUserId(authentication);
        return deliveryRequestService.getMessages(id, userId);
    }

    @PostMapping("/{id}/messages/mark-read")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markMessagesAsRead(@PathVariable Long id,
                                   Authentication authentication) {
        Long userId = getUserId(authentication);
        deliveryRequestService.markMessagesAsRead(id, userId);
    }

    @PutMapping("/messages/{messageId}")
    public DeliveryMessageResponse updateMessage(@PathVariable Long messageId,
                                                 @Valid @RequestBody DeliveryMessageRequest request,
                                                 Authentication authentication) {
        Long userId = getUserId(authentication);
        return deliveryRequestService.updateMessage(messageId, userId, request);
    }

    @DeleteMapping("/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable Long messageId,
                             Authentication authentication) {
        Long userId = getUserId(authentication);
        deliveryRequestService.deleteMessage(messageId, userId);
    }

    private Long getUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }

        try {
            return Long.parseLong(authentication.getName());
        } catch (NumberFormatException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid user id");
        }
    }
}
