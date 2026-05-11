package com.agrilink.order.repository;

import com.agrilink.order.model.OrderMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderMessageRepository extends JpaRepository<OrderMessage, Long> {
    List<OrderMessage> findByOrderIdOrderByCreatedAtAsc(Long orderId);
    
    @Query("SELECT COUNT(m) FROM OrderMessage m WHERE m.order.id = :orderId AND m.sender.id != :userId AND m.isRead = false")
    long countUnreadMessages(Long orderId, Long userId);
    
    @Modifying
    @Query("UPDATE OrderMessage m SET m.isRead = true WHERE m.order.id = :orderId AND m.sender.id != :userId")
    void markMessagesAsRead(Long orderId, Long userId);
}
