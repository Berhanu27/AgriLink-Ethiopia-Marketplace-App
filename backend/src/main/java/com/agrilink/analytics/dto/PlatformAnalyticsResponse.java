package com.agrilink.analytics.dto;

import java.util.Map;

public class PlatformAnalyticsResponse {
    private UserStatistics userStatistics;
    private ListingStatistics listingStatistics;
    private OrderStatistics orderStatistics;
    private DeliveryStatistics deliveryStatistics;
    private Map<String, Integer> usersByRegion;

    public PlatformAnalyticsResponse() {
    }

    public PlatformAnalyticsResponse(UserStatistics userStatistics, ListingStatistics listingStatistics,
                                     OrderStatistics orderStatistics, DeliveryStatistics deliveryStatistics,
                                     Map<String, Integer> usersByRegion) {
        this.userStatistics = userStatistics;
        this.listingStatistics = listingStatistics;
        this.orderStatistics = orderStatistics;
        this.deliveryStatistics = deliveryStatistics;
        this.usersByRegion = usersByRegion;
    }

    // Getters and Setters
    public UserStatistics getUserStatistics() {
        return userStatistics;
    }

    public void setUserStatistics(UserStatistics userStatistics) {
        this.userStatistics = userStatistics;
    }

    public ListingStatistics getListingStatistics() {
        return listingStatistics;
    }

    public void setListingStatistics(ListingStatistics listingStatistics) {
        this.listingStatistics = listingStatistics;
    }

    public OrderStatistics getOrderStatistics() {
        return orderStatistics;
    }

    public void setOrderStatistics(OrderStatistics orderStatistics) {
        this.orderStatistics = orderStatistics;
    }

    public DeliveryStatistics getDeliveryStatistics() {
        return deliveryStatistics;
    }

    public void setDeliveryStatistics(DeliveryStatistics deliveryStatistics) {
        this.deliveryStatistics = deliveryStatistics;
    }

    public Map<String, Integer> getUsersByRegion() {
        return usersByRegion;
    }

    public void setUsersByRegion(Map<String, Integer> usersByRegion) {
        this.usersByRegion = usersByRegion;
    }

    public static class UserStatistics {
        private long totalUsers;
        private long farmers;
        private long buyers;
        private long transporters;
        private long cooperatives;
        private long verifiedUsers;
        private long pendingVerification;

        public UserStatistics() {
        }

        public UserStatistics(long totalUsers, long farmers, long buyers, long transporters,
                              long cooperatives, long verifiedUsers, long pendingVerification) {
            this.totalUsers = totalUsers;
            this.farmers = farmers;
            this.buyers = buyers;
            this.transporters = transporters;
            this.cooperatives = cooperatives;
            this.verifiedUsers = verifiedUsers;
            this.pendingVerification = pendingVerification;
        }

        // Getters and Setters
        public long getTotalUsers() {
            return totalUsers;
        }

        public void setTotalUsers(long totalUsers) {
            this.totalUsers = totalUsers;
        }

        public long getFarmers() {
            return farmers;
        }

        public void setFarmers(long farmers) {
            this.farmers = farmers;
        }

        public long getBuyers() {
            return buyers;
        }

        public void setBuyers(long buyers) {
            this.buyers = buyers;
        }

        public long getTransporters() {
            return transporters;
        }

        public void setTransporters(long transporters) {
            this.transporters = transporters;
        }

        public long getCooperatives() {
            return cooperatives;
        }

        public void setCooperatives(long cooperatives) {
            this.cooperatives = cooperatives;
        }

        public long getVerifiedUsers() {
            return verifiedUsers;
        }

        public void setVerifiedUsers(long verifiedUsers) {
            this.verifiedUsers = verifiedUsers;
        }

        public long getPendingVerification() {
            return pendingVerification;
        }

        public void setPendingVerification(long pendingVerification) {
            this.pendingVerification = pendingVerification;
        }
    }

    public static class ListingStatistics {
        private long totalListings;
        private long activeListings;

        public ListingStatistics() {
        }

        public ListingStatistics(long totalListings, long activeListings) {
            this.totalListings = totalListings;
            this.activeListings = activeListings;
        }

        // Getters and Setters
        public long getTotalListings() {
            return totalListings;
        }

        public void setTotalListings(long totalListings) {
            this.totalListings = totalListings;
        }

        public long getActiveListings() {
            return activeListings;
        }

        public void setActiveListings(long activeListings) {
            this.activeListings = activeListings;
        }
    }

    public static class OrderStatistics {
        private long totalOrders;
        private long pendingOrders;
        private long acceptedOrders;
        private long completedOrders;
        private long rejectedOrders;

        public OrderStatistics() {
        }

        public OrderStatistics(long totalOrders, long pendingOrders, long acceptedOrders,
                               long completedOrders, long rejectedOrders) {
            this.totalOrders = totalOrders;
            this.pendingOrders = pendingOrders;
            this.acceptedOrders = acceptedOrders;
            this.completedOrders = completedOrders;
            this.rejectedOrders = rejectedOrders;
        }

        // Getters and Setters
        public long getTotalOrders() {
            return totalOrders;
        }

        public void setTotalOrders(long totalOrders) {
            this.totalOrders = totalOrders;
        }

        public long getPendingOrders() {
            return pendingOrders;
        }

        public void setPendingOrders(long pendingOrders) {
            this.pendingOrders = pendingOrders;
        }

        public long getAcceptedOrders() {
            return acceptedOrders;
        }

        public void setAcceptedOrders(long acceptedOrders) {
            this.acceptedOrders = acceptedOrders;
        }

        public long getCompletedOrders() {
            return completedOrders;
        }

        public void setCompletedOrders(long completedOrders) {
            this.completedOrders = completedOrders;
        }

        public long getRejectedOrders() {
            return rejectedOrders;
        }

        public void setRejectedOrders(long rejectedOrders) {
            this.rejectedOrders = rejectedOrders;
        }
    }

    public static class DeliveryStatistics {
        private long totalDeliveryRequests;
        private long pendingRequests;
        private long acceptedRequests;
        private long inTransitRequests;
        private long deliveredRequests;
        private long rejectedRequests;

        public DeliveryStatistics() {
        }

        public DeliveryStatistics(long totalDeliveryRequests, long pendingRequests, long acceptedRequests,
                                  long inTransitRequests, long deliveredRequests, long rejectedRequests) {
            this.totalDeliveryRequests = totalDeliveryRequests;
            this.pendingRequests = pendingRequests;
            this.acceptedRequests = acceptedRequests;
            this.inTransitRequests = inTransitRequests;
            this.deliveredRequests = deliveredRequests;
            this.rejectedRequests = rejectedRequests;
        }

        // Getters and Setters
        public long getTotalDeliveryRequests() {
            return totalDeliveryRequests;
        }

        public void setTotalDeliveryRequests(long totalDeliveryRequests) {
            this.totalDeliveryRequests = totalDeliveryRequests;
        }

        public long getPendingRequests() {
            return pendingRequests;
        }

        public void setPendingRequests(long pendingRequests) {
            this.pendingRequests = pendingRequests;
        }

        public long getAcceptedRequests() {
            return acceptedRequests;
        }

        public void setAcceptedRequests(long acceptedRequests) {
            this.acceptedRequests = acceptedRequests;
        }

        public long getInTransitRequests() {
            return inTransitRequests;
        }

        public void setInTransitRequests(long inTransitRequests) {
            this.inTransitRequests = inTransitRequests;
        }

        public long getDeliveredRequests() {
            return deliveredRequests;
        }

        public void setDeliveredRequests(long deliveredRequests) {
            this.deliveredRequests = deliveredRequests;
        }

        public long getRejectedRequests() {
            return rejectedRequests;
        }

        public void setRejectedRequests(long rejectedRequests) {
            this.rejectedRequests = rejectedRequests;
        }
    }
}
