package com.agrilink.analytics.service;

import com.agrilink.analytics.dto.PlatformAnalyticsResponse;
import com.agrilink.delivery.repository.DeliveryRequestRepository;
import com.agrilink.listing.repository.ProduceListingRepository;
import com.agrilink.order.repository.PurchaseOrderRepository;
import com.agrilink.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository userRepository;
    private final ProduceListingRepository listingRepository;
    private final PurchaseOrderRepository orderRepository;
    private final DeliveryRequestRepository deliveryRequestRepository;

    public AnalyticsServiceImpl(UserRepository userRepository,
                                ProduceListingRepository listingRepository,
                                PurchaseOrderRepository orderRepository,
                                DeliveryRequestRepository deliveryRequestRepository) {
        this.userRepository = userRepository;
        this.listingRepository = listingRepository;
        this.orderRepository = orderRepository;
        this.deliveryRequestRepository = deliveryRequestRepository;
    }

    @Override
    public PlatformAnalyticsResponse getPlatformAnalytics() {
        // User Statistics
        long totalUsers = userRepository.count();
        long farmers = userRepository.countByRoleName("farmer");
        long buyers = userRepository.countByRoleName("buyer");
        long transporters = userRepository.countByRoleName("transporter");
        long cooperatives = userRepository.countByRoleName("cooperative");
        long verifiedUsers = userRepository.countByVerificationStatus("verified");
        long pendingVerification = userRepository.countByVerificationStatus("pending");

        PlatformAnalyticsResponse.UserStatistics userStats = new PlatformAnalyticsResponse.UserStatistics(
                totalUsers, farmers, buyers, transporters, cooperatives, verifiedUsers, pendingVerification
        );

        // Listing Statistics
        long totalListings = listingRepository.count();
        long activeListings = totalListings; // All listings are considered active

        PlatformAnalyticsResponse.ListingStatistics listingStats = new PlatformAnalyticsResponse.ListingStatistics(
                totalListings, activeListings
        );

        // Order Statistics
        long totalOrders = orderRepository.count();
        long pendingOrders = orderRepository.countByStatus("pending");
        long acceptedOrders = orderRepository.countByStatus("accepted");
        long completedOrders = orderRepository.countByStatus("completed");
        long rejectedOrders = orderRepository.countByStatus("rejected");

        PlatformAnalyticsResponse.OrderStatistics orderStats = new PlatformAnalyticsResponse.OrderStatistics(
                totalOrders, pendingOrders, acceptedOrders, completedOrders, rejectedOrders
        );

        // Delivery Statistics
        long totalDeliveryRequests = deliveryRequestRepository.count();
        long pendingRequests = deliveryRequestRepository.countByStatus("pending");
        long acceptedRequests = deliveryRequestRepository.countByStatus("accepted");
        long inTransitRequests = deliveryRequestRepository.countByStatus("in-transit");
        long deliveredRequests = deliveryRequestRepository.countByStatus("delivered");
        long rejectedRequests = deliveryRequestRepository.countByStatus("rejected");

        PlatformAnalyticsResponse.DeliveryStatistics deliveryStats = new PlatformAnalyticsResponse.DeliveryStatistics(
                totalDeliveryRequests, pendingRequests, acceptedRequests, inTransitRequests, deliveredRequests, rejectedRequests
        );

        // Users by Region
        List<Object[]> regionData = userRepository.countUsersByRegion();
        Map<String, Integer> usersByRegion = new HashMap<>();
        for (Object[] row : regionData) {
            String region = (String) row[0];
            Long count = (Long) row[1];
            if (region != null && !region.trim().isEmpty()) {
                usersByRegion.put(region, count.intValue());
            }
        }

        return new PlatformAnalyticsResponse(userStats, listingStats, orderStats, deliveryStats, usersByRegion);
    }
}
