package com.agrilink.order.repository;

import com.agrilink.order.model.PurchaseOrder;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    List<PurchaseOrder> findByBuyerId(Long buyerId);
    List<PurchaseOrder> findBySellerId(Long sellerId);
    long countByStatus(String status);
}
