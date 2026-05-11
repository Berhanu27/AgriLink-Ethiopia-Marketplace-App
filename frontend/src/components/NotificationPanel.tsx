"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Package, Users, Loader2 } from "lucide-react";

interface Notification {
  id: string;
  type: 'order' | 'delivery' | 'verification';
  title: string;
  message: string;
  count: number;
  link: string;
  timestamp: Date;
}

interface NotificationPanelProps {
  userRole: string;
  userId: number;
}

export default function NotificationPanel({ userRole, userId }: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    loadNotifications();
  }, [userRole, userId]);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const notifs: Notification[] = [];

      if (userRole === 'admin') {
        const pendingCount = await api.users.getPendingCount();
        if (pendingCount > 0) {
          notifs.push({
            id: 'admin-verifications',
            type: 'verification',
            title: 'Pending Verifications',
            message: `${pendingCount} user${pendingCount > 1 ? 's' : ''} waiting for approval`,
            count: pendingCount,
            link: '/dashboard#user-verification',
            timestamp: new Date(),
          });
        }
      } else if (userRole === 'buyer') {
        // Order messages
        const orders = await api.orders.getForBuyer();
        orders.forEach(order => {
          if (order.unreadCount && order.unreadCount > 0) {
            notifs.push({
              id: `order-${order.id}`,
              type: 'order',
              title: `New message: ${order.cropName}`,
              message: `${order.unreadCount} unread message${order.unreadCount > 1 ? 's' : ''} from ${order.sellerName}`,
              count: order.unreadCount,
              link: `/dashboard#order-${order.id}`,
              timestamp: new Date(),
            });
          }
        });

        // Delivery messages
        const deliveries = await api.deliveryRequests.listForBuyer();
        deliveries.forEach(delivery => {
          if (delivery.unreadCount && delivery.unreadCount > 0) {
            notifs.push({
              id: `delivery-${delivery.id}`,
              type: 'delivery',
              title: `New message: ${delivery.cargoType}`,
              message: `${delivery.unreadCount} unread message${delivery.unreadCount > 1 ? 's' : ''} from ${delivery.transporterName}`,
              count: delivery.unreadCount,
              link: `/dashboard#delivery-${delivery.id}`,
              timestamp: new Date(),
            });
          }
        });
      } else if (userRole === 'farmer' || userRole === 'cooperative') {
        const orders = await api.orders.getForSeller();
        
        // New orders
        const newOrders = orders.filter(o => o.isNew);
        if (newOrders.length > 0) {
          notifs.push({
            id: 'new-orders',
            type: 'order',
            title: 'New Purchase Orders',
            message: `${newOrders.length} new order${newOrders.length > 1 ? 's' : ''} received`,
            count: newOrders.length,
            link: '/dashboard#purchase-orders',
            timestamp: new Date(),
          });
        }

        // Unread messages
        orders.forEach(order => {
          if (order.unreadCount && order.unreadCount > 0) {
            notifs.push({
              id: `order-${order.id}`,
              type: 'order',
              title: `New message: ${order.cropName}`,
              message: `${order.unreadCount} unread message${order.unreadCount > 1 ? 's' : ''} from ${order.buyerName}`,
              count: order.unreadCount,
              link: `/dashboard#order-${order.id}`,
              timestamp: new Date(),
            });
          }
        });
      } else if (userRole === 'transporter') {
        const deliveries = await api.deliveryRequests.listForTransporter();
        deliveries.forEach(delivery => {
          if (delivery.unreadCount && delivery.unreadCount > 0) {
            notifs.push({
              id: `delivery-${delivery.id}`,
              type: 'delivery',
              title: `New message: ${delivery.cargoType}`,
              message: `${delivery.unreadCount} unread message${delivery.unreadCount > 1 ? 's' : ''} from ${delivery.buyerName}`,
              count: delivery.unreadCount,
              link: `/dashboard#delivery-${delivery.id}`,
              timestamp: new Date(),
            });
          }
        });
      }

      setNotifications(notifs);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Navigate to the notification link
    router.push(notification.link);
    
    // Trigger refresh after a short delay to allow navigation
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('refreshNotifications'));
    }, 500);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <Package className="h-5 w-5 text-green-600" />;
      case 'delivery':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'verification':
        return <Users className="h-5 w-5 text-orange-600" />;
      default:
        return <MessageSquare className="h-5 w-5 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="w-80 p-4 flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="w-80 p-6 text-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageSquare className="h-6 w-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-gray-900">No new notifications</p>
        <p className="text-xs text-gray-500 mt-1">You're all caught up!</p>
      </div>
    );
  }

  return (
    <div className="w-80">
      <div className="px-4 py-3 border-b">
        <h3 className="font-semibold text-gray-900">Notifications</h3>
        <p className="text-xs text-gray-500 mt-0.5">{notifications.length} unread</p>
      </div>
      <ScrollArea className="h-[400px]">
        <div className="divide-y">
          {notifications.map((notif) => (
            <button
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="w-full px-4 py-3 hover:bg-gray-50 transition-colors text-left flex items-start gap-3"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 mb-0.5">
                  {notif.title}
                </p>
                <p className="text-xs text-gray-600">
                  {notif.message}
                </p>
              </div>
              <Badge variant="destructive" className="flex-shrink-0 h-5 min-w-[20px] px-1.5">
                {notif.count}
              </Badge>
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
