package com.agrilink.delivery.dto;

import java.time.LocalDateTime;

public class DeliveryMessageResponse {
    private Long id;
    private Long senderId;
    private String senderName;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean isEdited;

    public DeliveryMessageResponse(Long id, Long senderId, String senderName, String message, Boolean isRead, LocalDateTime createdAt, LocalDateTime updatedAt, Boolean isEdited) {
        this.id = id;
        this.senderId = senderId;
        this.senderName = senderName;
        this.message = message;
        this.isRead = isRead;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.isEdited = isEdited;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSenderId() {
        return senderId;
    }

    public void setSenderId(Long senderId) {
        this.senderId = senderId;
    }

    public String getSenderName() {
        return senderName;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public Boolean getIsRead() {
        return isRead;
    }

    public void setIsRead(Boolean isRead) {
        this.isRead = isRead;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getIsEdited() {
        return isEdited;
    }

    public void setIsEdited(Boolean isEdited) {
        this.isEdited = isEdited;
    }
}
