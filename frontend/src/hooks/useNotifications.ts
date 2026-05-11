import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { api, ApiError } from '@/lib/api';

export function useNotifications() {
  const { currentUser } = useApp();
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser?.id) return;

    // Check if we have a valid token before attempting to fetch
    const token = typeof window !== 'undefined' ? localStorage.getItem('agrilink_token') : null;
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') {
      console.log('No valid token found, skipping notification fetch');
      setTotalCount(0);
      return;
    }

    const fetchNotifications = async () => {
      setLoading(true);
      try {
        let count = 0;
        console.log('=== Fetching notifications for role:', currentUser.role);

        if (currentUser.role === 'admin') {
          // Get pending verification count for admin
          console.log('Fetching pending verifications for admin...');
          const pendingCount = await api.users.getPendingCount({ silent: true });
          console.log('Pending verification count:', pendingCount);
          count = pendingCount;
        } else if (currentUser.role === 'buyer') {
          console.log('=== BUYER NOTIFICATIONS ===');
          
          // Get buyer's orders and count unread messages
          try {
            const orders = await api.orders.getForBuyer();
            console.log('Buyer orders:', orders);
            const orderUnreadCount = orders.reduce((sum, order) => sum + (order.unreadCount || 0), 0);
            console.log('Buyer order unread count:', orderUnreadCount);
            count += orderUnreadCount;
          } catch (error) {
            // Silently handle auth errors - user may have been logged out
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              console.log('Auth error fetching buyer orders, skipping');
            } else {
              console.error('Error fetching buyer orders:', error);
            }
          }
          
          // Get buyer's delivery requests and count unread messages
          try {
            const deliveryRequests = await api.deliveryRequests.listForBuyer();
            console.log('Buyer delivery requests:', deliveryRequests);
            const deliveryUnreadCount = deliveryRequests.reduce((sum, req) => {
              console.log(`Delivery request ${req.id}: unreadCount = ${req.unreadCount}`);
              return sum + (req.unreadCount || 0);
            }, 0);
            console.log('Buyer delivery unread count:', deliveryUnreadCount);
            count += deliveryUnreadCount;
          } catch (error) {
            // Silently handle auth errors - user may have been logged out
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              console.log('Auth error fetching buyer delivery requests, skipping');
            } else {
              console.error('Error fetching buyer delivery requests:', error);
            }
          }
          
          console.log('Total buyer notification count:', count);
        } else if (currentUser.role === 'farmer') {
          // Get farmer's orders and count new orders + unread messages
          try {
            const orders = await api.orders.getForSeller();
            const newOrdersCount = orders.filter(o => o.isNew).length;
            const unreadMessagesCount = orders.reduce((sum, order) => sum + (order.unreadCount || 0), 0);
            count = newOrdersCount + unreadMessagesCount;
          } catch (error) {
            // Silently handle auth errors
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              console.log('Auth error fetching farmer orders, skipping');
            } else {
              console.error('Error fetching farmer orders:', error);
            }
          }
        } else if (currentUser.role === 'transporter') {
          console.log('=== TRANSPORTER NOTIFICATIONS ===');
          // Get transporter's delivery requests and count unread messages
          try {
            const deliveryRequests = await api.deliveryRequests.listForTransporter();
            console.log('Transporter delivery requests:', deliveryRequests);
            const deliveryUnreadCount = deliveryRequests.reduce((sum, req) => {
              console.log(`Delivery request ${req.id}: unreadCount = ${req.unreadCount}`);
              return sum + (req.unreadCount || 0);
            }, 0);
            console.log('Transporter delivery unread count:', deliveryUnreadCount);
            count = deliveryUnreadCount;
          } catch (error) {
            // Silently handle auth errors
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              console.log('Auth error fetching transporter delivery requests, skipping');
            } else {
              console.error('Error fetching transporter delivery requests:', error);
            }
          }
        } else if (currentUser.role === 'cooperative') {
          // Get cooperative's orders and count unread messages
          try {
            const orders = await api.orders.getForSeller();
            const unreadMessagesCount = orders.reduce((sum, order) => sum + (order.unreadCount || 0), 0);
            count = unreadMessagesCount;
          } catch (error) {
            // Silently handle auth errors
            if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
              console.log('Auth error fetching cooperative orders, skipping');
            } else {
              console.error('Error fetching cooperative orders:', error);
            }
          }
        }

        console.log('Total notification count:', count);
        setTotalCount(count);
      } catch (error) {
        // Silently handle authentication errors to prevent console spam
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          console.log('Authentication error in notifications, user may need to re-login');
        } else {
          console.error('Failed to fetch notifications:', error);
        }
        setTotalCount(0);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();

    // Refresh every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    // Listen for manual refresh events
    const handleRefresh = () => {
      console.log('Manual notification refresh triggered');
      fetchNotifications();
    };
    window.addEventListener('refreshNotifications', handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener('refreshNotifications', handleRefresh);
    };
  }, [currentUser?.id, currentUser?.role]);

  return { totalCount, loading };
}
