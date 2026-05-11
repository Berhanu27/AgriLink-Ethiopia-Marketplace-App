package com.agrilink.delivery.repository;

import com.agrilink.delivery.model.DeliveryMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeliveryMessageRepository extends JpaRepository<DeliveryMessage, Long> {

    List<DeliveryMessage> findByDeliveryRequestIdOrderByCreatedAtAsc(Long deliveryRequestId);

    @Query("SELECT COUNT(dm) FROM DeliveryMessage dm WHERE dm.deliveryRequest.id = :deliveryRequestId AND dm.sender.id != :userId AND dm.isRead = false")
    long countUnreadMessages(@Param("deliveryRequestId") Long deliveryRequestId, @Param("userId") Long userId);

    @Modifying
    @Query("UPDATE DeliveryMessage dm SET dm.isRead = true WHERE dm.deliveryRequest.id = :deliveryRequestId AND dm.sender.id != :userId AND dm.isRead = false")
    void markMessagesAsRead(@Param("deliveryRequestId") Long deliveryRequestId, @Param("userId") Long userId);
}
