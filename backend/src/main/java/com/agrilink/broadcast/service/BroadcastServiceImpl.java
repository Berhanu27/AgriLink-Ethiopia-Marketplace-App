package com.agrilink.broadcast.service;

import com.agrilink.broadcast.dto.BroadcastResponse;
import com.agrilink.broadcast.dto.CreateBroadcastRequest;
import com.agrilink.broadcast.dto.UpdateBroadcastRequest;
import com.agrilink.broadcast.model.BroadcastMessage;
import com.agrilink.broadcast.repository.BroadcastRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Objects;

@Service
@Transactional
public class BroadcastServiceImpl implements BroadcastService {

    private final BroadcastRepository broadcastRepository;

    public BroadcastServiceImpl(BroadcastRepository broadcastRepository) {
        this.broadcastRepository = broadcastRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public List<BroadcastResponse> listAll() {
        return broadcastRepository.findAllLatest().stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    public BroadcastResponse create(CreateBroadcastRequest request) {
        BroadcastMessage msg = new BroadcastMessage();
        msg.setCropName(request.cropName());
        msg.setPrice(request.price());
        msg.setUnit(request.unit());
        msg.setNote(request.note());
        msg.setImageUrl(request.imageUrl());

        BroadcastMessage saved = broadcastRepository.save(msg);
        return toResponse(saved);
    }

    @Override
    public BroadcastResponse update(Long broadcastId, UpdateBroadcastRequest request) {
        Long safeBroadcastId = Objects.requireNonNull(broadcastId, "broadcastId");
        BroadcastMessage message = broadcastRepository.findById(safeBroadcastId)
                .orElseThrow(() -> new IllegalArgumentException("Broadcast not found"));

        if (StringUtils.hasText(request.cropName())) {
            message.setCropName(request.cropName().trim());
        }
        if (request.price() != null) {
            message.setPrice(request.price());
        }
        if (StringUtils.hasText(request.unit())) {
            message.setUnit(request.unit().trim());
        }
        if (request.note() != null) {
            message.setNote(request.note());
        }
        if (request.imageUrl() != null) {
            message.setImageUrl(request.imageUrl());
        }

        BroadcastMessage saved = broadcastRepository.save(message);
        return toResponse(Objects.requireNonNull(saved, "Failed to save broadcast message"));
    }

    private BroadcastResponse toResponse(BroadcastMessage msg) {
        return new BroadcastResponse(
                msg.getId(),
                msg.getCropName(),
                msg.getPrice(),
                msg.getUnit(),
                msg.getNote(),
                msg.getImageUrl(),
                msg.getCreatedAt()
        );
    }

    @Override
    public void delete(Long broadcastId) {
        BroadcastMessage message = broadcastRepository.findById(broadcastId)
                .orElseThrow(() -> new IllegalArgumentException("Broadcast not found"));
        broadcastRepository.delete(message);
    }
}
