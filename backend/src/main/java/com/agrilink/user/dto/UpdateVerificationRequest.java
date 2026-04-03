package com.agrilink.user.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record UpdateVerificationRequest(
        @JsonProperty("verificationStatus")
        String verificationStatus
) {
}
