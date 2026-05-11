package com.agrilink.order.dto;

import jakarta.validation.constraints.NotBlank;

public class MessageRequest {
    @NotBlank(message = "Message cannot be empty")
    private String message;

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
