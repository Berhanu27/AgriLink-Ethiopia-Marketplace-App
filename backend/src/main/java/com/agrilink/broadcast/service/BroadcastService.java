package com.agrilink.broadcast.service;

import com.agrilink.broadcast.dto.BroadcastResponse;
import com.agrilink.broadcast.dto.CreateBroadcastRequest;
import com.agrilink.broadcast.dto.UpdateBroadcastRequest;

import java.util.List;

public interface BroadcastService {
    List<BroadcastResponse> listAll();
    BroadcastResponse create(CreateBroadcastRequest request);
    BroadcastResponse update(Long broadcastId, UpdateBroadcastRequest request);
}
