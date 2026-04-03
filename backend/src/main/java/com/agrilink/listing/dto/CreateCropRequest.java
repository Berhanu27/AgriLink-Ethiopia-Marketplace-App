package com.agrilink.listing.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateCropRequest(@NotBlank @Size(max = 200) String name) {
}
