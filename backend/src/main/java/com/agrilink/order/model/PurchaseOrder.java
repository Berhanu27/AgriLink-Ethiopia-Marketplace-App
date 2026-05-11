package com.agrilink.order.model;

import com.agrilink.listing.model.ProduceListing;
import com.agrilink.user.model.User;
import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_orders")
public class PurchaseOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "buyer_id", nullable = false)
    private User buyer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "seller_id", nullable = false)
    private User seller;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "listing_id")
    private ProduceListing listing;

    @Column(name = "crop_name", nullable = false)
    private String cropName;

    @Column(name = "requested_quantity", nullable = false)
    private String requestedQuantity;

    @Column(name = "unit", nullable = false)
    private String unit;

    @Column(name = "offered_price", precision = 10, scale = 2)
    private BigDecimal offeredPrice;

    @Column(name = "buyer_message", columnDefinition = "TEXT")
    private String buyerMessage;

    @Column(name = "status", nullable = false)
    private String status = "pending"; // pending, accepted, rejected, completed, cancelled

    @Column(name = "farmer_response", columnDefinition = "TEXT")
    private String farmerResponse;

    @Column(name = "available_quantity")
    private String availableQuantity;

    @Column(name = "payment_screenshot_url")
    private String paymentScreenshotUrl;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "seller_viewed_at")
    private LocalDateTime sellerViewedAt;

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public ProduceListing getListing() {
        return listing;
    }

    public void setListing(ProduceListing listing) {
        this.listing = listing;
    }

    public String getCropName() {
        return cropName;
    }

    public void setCropName(String cropName) {
        this.cropName = cropName;
    }

    public String getRequestedQuantity() {
        return requestedQuantity;
    }

    public void setRequestedQuantity(String requestedQuantity) {
        this.requestedQuantity = requestedQuantity;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getOfferedPrice() {
        return offeredPrice;
    }

    public void setOfferedPrice(BigDecimal offeredPrice) {
        this.offeredPrice = offeredPrice;
    }

    public String getBuyerMessage() {
        return buyerMessage;
    }

    public void setBuyerMessage(String buyerMessage) {
        this.buyerMessage = buyerMessage;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getFarmerResponse() {
        return farmerResponse;
    }

    public void setFarmerResponse(String farmerResponse) {
        this.farmerResponse = farmerResponse;
    }

    public String getAvailableQuantity() {
        return availableQuantity;
    }

    public void setAvailableQuantity(String availableQuantity) {
        this.availableQuantity = availableQuantity;
    }

    public String getPaymentScreenshotUrl() {
        return paymentScreenshotUrl;
    }

    public void setPaymentScreenshotUrl(String paymentScreenshotUrl) {
        this.paymentScreenshotUrl = paymentScreenshotUrl;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public LocalDateTime getSellerViewedAt() {
        return sellerViewedAt;
    }

    public void setSellerViewedAt(LocalDateTime sellerViewedAt) {
        this.sellerViewedAt = sellerViewedAt;
    }
}
