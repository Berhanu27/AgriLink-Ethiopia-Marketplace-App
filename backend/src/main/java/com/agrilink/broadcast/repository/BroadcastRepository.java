package com.agrilink.broadcast.repository;

import com.agrilink.broadcast.model.BroadcastMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Sort;

import java.util.List;

public interface BroadcastRepository extends JpaRepository<BroadcastMessage, Long> {
    default List<BroadcastMessage> findAllLatest() {
        return findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }
}
