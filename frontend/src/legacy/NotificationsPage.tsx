"use client";

import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bell, MessageSquare, Package, TrendingUp, CheckCircle2, X } from "lucide-react";

const translations = {
  en: {
    title: "Notifications",
    unread: (count: number) => `You have ${count} unread notification${count !== 1 ? 's' : ''}`,
    markAll: "Mark all as read",
    newLabel: "New",
    emptyTitle: "No Notifications",
    emptySubtitle: "You're all caught up! New notifications will appear here.",
  },
  am: {
    title: "ማሳወቂያዎች",
    unread: (count: number) => `${count} ያልተነበቡ ማሳወቂያዎች አሉዎት`,
    markAll: "ሁሉንም እንደተነበበ ምልክት ያድርጉ",
    newLabel: "አዲስ",
    emptyTitle: "ማሳወቂያ የለም",
    emptySubtitle: "ሁሉንም ተመልክተዋል። አዳዲስ ማሳወቂያዎች እዚህ ይታያሉ።",
  },
  or: {
    title: "Beeksisa",
    unread: (count: number) => `${count} beeksisa hin dubbifamin siif jiru`,
    markAll: "Hunda dubbifame godhi",
    newLabel: "Haarawa",
    emptyTitle: "Beeksisni hin jiru",
    emptySubtitle: "Hunda dubbiftee jirta! Beeksisni haaraan as ni mul'ata.",
  },
} as const;

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, language } = useApp();
  const t = translations[language] ?? translations.en;

  // Mock notifications removed - using real API data only
  const mockNotifications: any[] = [];

  const allNotifications = [...notifications, ...mockNotifications];
  const unreadCount = allNotifications.filter((n) => !n.read).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'inquiry':
        return <MessageSquare className="h-5 w-5 text-primary" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-600" />;
      case 'delivery':
        return <Package className="h-5 w-5 text-purple-600" />;
      case 'verification':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'system':
        return <TrendingUp className="h-5 w-5 text-orange-600" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const formatTimestamp = (timestamp: Date) => {
    const now = new Date();
    const diffInMs = now.getTime() - timestamp.getTime();
    const diffInMins = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMins < 60) {
      return `${diffInMins} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      return `${diffInDays} days ago`;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t.title}</h2>
            {unreadCount > 0 && (
              <p className="text-muted-foreground">{t.unread(unreadCount)}</p>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="outline" size="sm">
              {t.markAll}
            </Button>
          )}
        </div>

        {/* Notifications List */}
        {allNotifications.length > 0 ? (
          <div className="space-y-2">
            {allNotifications
              .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
              .map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 ${!notification.read ? 'bg-primary/5 border-primary/20' : ''}`}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{notification.title}</h4>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              {t.newLabel}
                            </Badge>
                          )}
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => markNotificationAsRead(notification.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatTimestamp(notification.timestamp)}
                      </p>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">{t.emptyTitle}</h4>
            <p className="text-sm text-muted-foreground">{t.emptySubtitle}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
