"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import {
  Truck,
  MapPin,
  Package,
  DollarSign,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
} from "lucide-react";

const translations = {
  en: {
    welcome: "Welcome,",
    availability: "Availability Status",
    onlineText: "You are visible to customers",
    offlineText: "You are offline",
    online: "Online",
    offline: "Offline",
    pending: "Pending",
    inTransit: "In Transit",
    completed: "Completed",
    earned: "ETB Earned",
    deliveryRequests: "Delivery Requests",
    requestedBy: "Requested by",
    pickup: "Pickup",
    destination: "Destination",
    weight: "Weight",
    acceptJob: "Accept Job",
    markDelivered: "Mark Delivered",
    noRequestsTitle: "No Active Requests",
    noRequestsSubtitle: "New delivery requests will appear here",
    profileTitle: "Your Profile",
    vehicleType: "Vehicle Type",
    capacity: "Capacity",
    region: "Region",
    rating: "Rating",
    notSet: "Not set",
    newRating: "New",
  },
  am: {
    welcome: "እንኳን ደህና መጡ,",
    availability: "የተገኝነት ሁኔታ",
    onlineText: "ለደንበኞች ይታያሉ",
    offlineText: "ከመስመር ውጭ ይገኛሉ",
    online: "በመስመር ላይ",
    offline: "ከመስመር ውጭ",
    pending: "በመጠባበቅ ላይ",
    inTransit: "በመጓጓዣ ላይ",
    completed: "ተጠናቀቀ",
    earned: "የተገኘ ብር",
    deliveryRequests: "የማድረሻ ጥያቄዎች",
    requestedBy: "የጠየቀው",
    pickup: "መውሰጃ",
    destination: "መድረሻ",
    weight: "ክብደት",
    acceptJob: "ስራውን ተቀበል",
    markDelivered: "ተደርሷል አድርግ",
    noRequestsTitle: "ንቁ ጥያቄ የለም",
    noRequestsSubtitle: "አዲስ የማድረሻ ጥያቄዎች እዚህ ይታያሉ",
    profileTitle: "የእርስዎ መግለጫ",
    vehicleType: "የተሽከርካሪ አይነት",
    capacity: "አቅም",
    region: "ክልል",
    rating: "ደረጃ",
    notSet: "አልተሞላም",
    newRating: "አዲስ",
  },
  or: {
    welcome: "Baga nagaan dhuftan,",
    availability: "Sadarkaa argamuu",
    onlineText: "Maamilaaf mul'atta",
    offlineText: "Adda ba'aa jirtu",
    online: "Online",
    offline: "Offline",
    pending: "Eeggataa",
    inTransit: "Imala keessa",
    completed: "Xumurame",
    earned: "Galii ETB",
    deliveryRequests: "Gaaffii geejjibaa",
    requestedBy: "Kan gaafate",
    pickup: "Irraa ka'iinsa",
    destination: "Bakki geessi",
    weight: "Ulfa",
    acceptJob: "Hojii fudhadhu",
    markDelivered: "Geessinee xumuri",
    noRequestsTitle: "Gaaffiin hin jiru",
    noRequestsSubtitle: "Gaaffiin geejjibaa haaraan as ni mul'ata",
    profileTitle: "Profaayilii kee",
    vehicleType: "Gosa konkolaataa",
    capacity: "Humna",
    region: "Naannoo",
    rating: "Sadarkaa",
    notSet: "Hin kaa'amne",
    newRating: "Haarawa",
  },
} as const;

export default function TransporterDashboard() {
  const { currentUser, updateDeliveryStatus, updateTransporterAvailability, language } = useApp();
  const t = translations[language] ?? translations.en;
  const [isOnline, setIsOnline] = useState(currentUser?.available ?? true);

  useEffect(() => {
    if (currentUser?.available === undefined) return;
    setIsOnline(currentUser.available);
  }, [currentUser?.available]);

  // Mock delivery requests
  const deliveryRequests = [
    {
      id: 'dr1',
      pickupLocation: 'Addis Ababa, Bole',
      destination: 'Hawassa',
      cargo: 'Teff - 500kg',
      weight: '500kg',
      status: 'pending' as const,
      requesterId: 'req1',
      requesterName: 'Abebe Kebede',
      createdAt: new Date('2026-03-29'),
      price: 2500,
    },
    {
      id: 'dr2',
      pickupLocation: 'Mekelle',
      destination: 'Addis Ababa',
      cargo: 'Coffee - 200kg',
      weight: '200kg',
      status: 'in-transit' as const,
      requesterId: 'req2',
      requesterName: 'Tigist Mekonnen',
      createdAt: new Date('2026-03-28'),
      price: 1800,
    },
  ];

  const pendingRequests = deliveryRequests.filter((d) => d.status === 'pending').length;
  const inTransit = deliveryRequests.filter((d) => d.status === 'in-transit').length;
  const completed = 12; // Mock completed deliveries
  const totalEarnings = 45000; // Mock earnings

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
      case 'accepted':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'in-transit':
        return 'bg-purple-500/10 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-500/10 text-green-700 border-green-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in-transit':
        return <Navigation className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const handleAcceptRequest = (id: string) => {
    updateDeliveryStatus(id, 'accepted');
  };

  const handleCompleteDelivery = (id: string) => {
    updateDeliveryStatus(id, 'delivered');
  };

  const handleAvailabilityChange = async (nextValue: boolean) => {
    setIsOnline(nextValue);
    const ok = await updateTransporterAvailability(nextValue);
    if (!ok) {
      setIsOnline((prev) => !prev);
      toast.error("Unable to update availability. Please try again.");
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold mb-1">{t.welcome} {currentUser?.name}!</h2>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Truck className="h-4 w-4" />
            {currentUser?.vehicleType} • {currentUser?.vehicleCapacity}
          </div>
        </div>

        {/* Availability Toggle */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold mb-1">{t.availability}</h4>
              <p className="text-sm text-muted-foreground">
                {isOnline ? t.onlineText : t.offlineText}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium">{isOnline ? t.online : t.offline}</span>
              <Switch checked={isOnline} onCheckedChange={handleAvailabilityChange} />
            </div>
          </div>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Clock className="h-8 w-8 text-yellow-600 mb-2" />
              <p className="text-2xl font-bold">{pendingRequests}</p>
              <p className="text-xs text-muted-foreground">{t.pending}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Navigation className="h-8 w-8 text-purple-600 mb-2" />
              <p className="text-2xl font-bold">{inTransit}</p>
              <p className="text-xs text-muted-foreground">{t.inTransit}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <CheckCircle2 className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{completed}</p>
              <p className="text-xs text-muted-foreground">{t.completed}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t.earned}</p>
            </div>
          </Card>
        </div>

        {/* Delivery Requests */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.deliveryRequests}</h3>
          
          {deliveryRequests.length > 0 ? (
            <div className="space-y-3">
              {deliveryRequests.map((request) => (
                <Card key={request.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold">{request.cargo}</h4>
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(request.status)} text-xs capitalize`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          {t.requestedBy} {request.requesterName}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-primary">
                        {request.price} ETB
                      </span>
                    </div>

                    {/* Route Info */}
                    <div className="space-y-2 bg-muted/30 p-3 rounded-lg">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">{t.pickup}</p>
                          <p className="text-sm font-medium">{request.pickupLocation}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Navigation className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">{t.destination}</p>
                          <p className="text-sm font-medium">{request.destination}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Package className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">{t.weight}</p>
                          <p className="text-sm font-medium">{request.weight}</p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {request.status === 'pending' && (
                        <>
                          <Button
                            className="flex-1 min-h-[44px]"
                            onClick={() => handleAcceptRequest(request.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t.acceptJob}
                          </Button>
                          <Button variant="outline" size="icon" className="h-11 w-11">
                            <Phone className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      {request.status === 'in-transit' && (
                        <>
                          <Button
                            className="flex-1 min-h-[44px]"
                            onClick={() => handleCompleteDelivery(request.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            {t.markDelivered}
                          </Button>
                          <Button variant="outline" size="icon" className="h-11 w-11">
                            <Phone className="h-5 w-5" />
                          </Button>
                        </>
                      )}
                      {request.status === 'delivered' && (
                        <Button variant="outline" className="flex-1" disabled>
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Completed
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Truck className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t.noRequestsTitle}</h4>
              <p className="text-sm text-muted-foreground">
                {t.noRequestsSubtitle}
              </p>
            </Card>
          )}
        </div>

        {/* Profile Info */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.profileTitle}</h3>
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.vehicleType}</span>
                <span className="font-medium">{currentUser?.vehicleType || t.notSet}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.capacity}</span>
                <span className="font-medium">{currentUser?.vehicleCapacity || t.notSet}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.region}</span>
                <span className="font-medium">{currentUser?.region}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{t.rating}</span>
                <span className="font-medium">⭐ {currentUser?.rating || t.newRating}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
