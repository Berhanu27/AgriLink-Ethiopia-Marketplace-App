package com.agrilink.delivery.repository;

import com.agrilink.delivery.model.DeliveryRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeliveryRequestRepository extends JpaRepository<DeliveryRequest, Long> {
    List<DeliveryRequest> findByBuyerIdOrderByCreatedAtDesc(Long buyerId);
    List<DeliveryRequest> findByTransporterIdOrderByCreatedAtDesc(Long transporterId);
    long countByStatus(String status);
}
