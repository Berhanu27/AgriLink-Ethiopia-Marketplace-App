package com.agrilink.broadcast.controller;

import com.agrilink.broadcast.dto.BroadcastResponse;
import com.agrilink.broadcast.dto.CreateBroadcastRequest;
import com.agrilink.broadcast.dto.UpdateBroadcastRequest;
import com.agrilink.broadcast.service.BroadcastService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/broadcasts")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001"}, allowCredentials = "true")
public class BroadcastController {

    private final BroadcastService broadcastService;

    public BroadcastController(BroadcastService broadcastService) {
        this.broadcastService = broadcastService;
    }

    @GetMapping
    public List<BroadcastResponse> listAll() {
        return broadcastService.listAll();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BroadcastResponse create(@Valid @RequestBody CreateBroadcastRequest request) {
        return broadcastService.create(request);
    }

    @PatchMapping("/{id}")
    public BroadcastResponse update(
            @PathVariable Long id,
            @Valid @RequestBody UpdateBroadcastRequest request,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        return broadcastService.update(id, request);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(
            @PathVariable Long id,
            Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Not authenticated");
        }
        broadcastService.delete(id);
    }
}
