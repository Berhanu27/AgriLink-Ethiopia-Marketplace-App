"use client";

import { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import DeliveryChatDialog from "@/components/DeliveryChatDialog";
import {
  Truck,
  MapPin,
  Package,
  DollarSign,
  CheckCircle2,
  Clock,
  Navigation,
  Phone,
  XCircle,
  MessageSquare,
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
    preferredTime: "Preferred Time",
    notes: "Notes",
    acceptJob: "Accept Job",
    rejectJob: "Reject",
    markDelivered: "Mark Delivered",
    rejectDialogTitle: "Reject Delivery Request",
    rejectDialogDescription: "Please provide a reason for rejecting this request",
    rejectReason: "Rejection Reason",
    rejectReasonPlaceholder: "e.g., Vehicle not available, Route not covered, etc.",
    cancel: "Cancel",
    confirmReject: "Confirm Reject",
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
    preferredTime: "የተመረጠ ጊዜ",
    notes: "ማስታወሻዎች",
    acceptJob: "ስራውን ተቀበል",
    rejectJob: "ውድቅ አድርግ",
    markDelivered: "ተደርሷል አድርግ",
    rejectDialogTitle: "የማድረሻ ጥያቄን ውድቅ አድርግ",
    rejectDialogDescription: "እባክዎ ይህን ጥያቄ ለመቃወም ምክንያት ይስጡ",
    rejectReason: "የውድቅነት ምክንያት",
    rejectReasonPlaceholder: "ለምሳሌ፣ ተሽከርካሪ አይገኝም፣ መንገድ አልተሸፈነም፣ ወዘተ.",
    cancel: "ሰርዝ",
    confirmReject: "ውድቅነትን አረጋግጥ",
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
    preferredTime: "Yeroo filatame",
    notes: "Yaadannoo",
    acceptJob: "Hojii fudhadhu",
    rejectJob: "Diddaa",
    markDelivered: "Geessinee xumuri",
    rejectDialogTitle: "Gaaffii geejjibaa diddaa",
    rejectDialogDescription: "Maaloo gaaffii kana didduuf sababii kenni",
    rejectReason: "Sababa diddaa",
    rejectReasonPlaceholder: "Fakkeenyaaf: Konkolaataan hin argamu, Karaan hin haguugamne, kkf.",
    cancel: "Haqii",
    confirmReject: "Diddaa mirkaneessi",
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
  const { currentUser, updateDeliveryStatus, updateTransporterAvailability, language, deliveryRequests } = useApp();
  const t = translations[language] ?? translations.en;
  const [isOnline, setIsOnline] = useState(currentUser?.available ?? true);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedDeliveryRequestId, setSelectedDeliveryRequestId] = useState<number | null>(null);

  useEffect(() => {
    if (currentUser?.available === undefined) return;
    setIsOnline(currentUser.available);
  }, [currentUser?.available]);

  const formatPreferredTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    const locale = language === 'am' ? 'am-ET' : language === 'or' ? 'om-ET' : 'en-ET';
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(parsed);
  };

  const pendingRequests = deliveryRequests.filter((d) => d.status === 'pending').length;
  const inTransit = deliveryRequests.filter((d) => d.status === 'in-transit').length;
  const completed = deliveryRequests.filter((d) => d.status === 'delivered').length;
  const totalEarnings = deliveryRequests
    .filter((d) => d.status === 'delivered')
    .reduce((sum, d) => sum + (d.priceOffer ?? 0), 0);

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

  const handleRejectRequest = (id: string) => {
    setSelectedRequestId(id);
    setRejectDialogOpen(true);
  };

  const handleConfirmReject = () => {
    if (!selectedRequestId) return;
    
    if (!rejectReason.trim()) {
      toast.error("Please provide a reason for rejection");
      return;
    }

    updateDeliveryStatus(selectedRequestId, 'rejected', rejectReason);
    setRejectDialogOpen(false);
    setRejectReason("");
    setSelectedRequestId(null);
    toast.success("Request rejected");
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
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3" id="earnings">
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
        <div id="delivery-requests">
          <h3 className="text-xl font-bold mb-4">{t.deliveryRequests}</h3>
          
          {deliveryRequests.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Weight</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deliveryRequests.map((request) => (
                      <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{request.cargoType}</p>
                            {request.notes && (
                              <p className="text-xs text-muted-foreground italic mt-1">"{request.notes}"</p>
                            )}
                            {request.preferredTime && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatPreferredTime(request.preferredTime)}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-medium">{request.requesterName || t.notSet}</p>
                        </td>
                        <td className="px-4 py-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1 text-xs">
                              <MapPin className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">From:</span>
                              <span>{request.pickupLocation}</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <Navigation className="h-3 w-3 text-primary" />
                              <span className="text-muted-foreground">To:</span>
                              <span>{request.destination}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {request.weightValue ? `${request.weightValue}${request.weightUnit || ''}` : t.notSet}
                        </td>
                        <td className="px-4 py-3 text-primary font-semibold">
                          {request.priceOffer?.toLocaleString() ?? "—"} ETB
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="outline"
                            className={`${getStatusColor(request.status)} text-xs capitalize`}
                          >
                            {getStatusIcon(request.status)}
                            <span className="ml-1">{request.status}</span>
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {request.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleAcceptRequest(request.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  className="h-8"
                                  onClick={() => handleRejectRequest(request.id)}
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Phone className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                            {(request.status === 'accepted' || request.status === 'in-transit') && (
                              <>
                                {request.status === 'in-transit' && (
                                  <Button
                                    size="sm"
                                    className="h-8"
                                    onClick={() => handleCompleteDelivery(request.id)}
                                  >
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Mark Delivered
                                  </Button>
                                )}
                                <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 relative"
                                  onClick={() => {
                                    setSelectedDeliveryRequestId(Number(request.id));
                                    setChatDialogOpen(true);
                                  }}
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Chat
                                  {request.unreadCount && request.unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                                      {request.unreadCount}
                                    </span>
                                  )}
                                </Button>
                              </>
                            )}
                            {request.status === 'delivered' && (
                              <Badge variant="default" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Completed
                              </Badge>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
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

        {/* My Routes - Active Deliveries */}
        <div id="my-routes">
          <h3 className="text-xl font-bold mb-4">My Routes</h3>
          
          {deliveryRequests.filter(d => d.status === 'accepted' || d.status === 'in-transit').length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Customer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Weight</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {deliveryRequests
                      .filter(d => d.status === 'accepted' || d.status === 'in-transit')
                      .map((request) => (
                        <tr key={request.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium">{request.cargoType}</p>
                              {request.notes && (
                                <p className="text-xs text-muted-foreground italic mt-1">"{request.notes}"</p>
                              )}
                              {request.preferredTime && (
                                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                  <Clock className="h-3 w-3" />
                                  {formatPreferredTime(request.preferredTime)}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-medium">{request.requesterName || t.notSet}</p>
                          </td>
                          <td className="px-4 py-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="h-3 w-3 text-primary" />
                                <span className="text-muted-foreground">From:</span>
                                <span>{request.pickupLocation}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs">
                                <Navigation className="h-3 w-3 text-primary" />
                                <span className="text-muted-foreground">To:</span>
                                <span>{request.destination}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {request.weightValue ? `${request.weightValue}${request.weightUnit || ''}` : t.notSet}
                          </td>
                          <td className="px-4 py-3 text-primary font-semibold">
                            {request.priceOffer?.toLocaleString() ?? "—"} ETB
                          </td>
                          <td className="px-4 py-3">
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(request.status)} text-xs capitalize`}
                            >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{request.status}</span>
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2 flex-wrap">
                              {request.status === 'in-transit' && (
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleCompleteDelivery(request.id)}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Mark Delivered
                                </Button>
                              )}
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                                <Phone className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 relative"
                                onClick={() => {
                                  setSelectedDeliveryRequestId(Number(request.id));
                                  setChatDialogOpen(true);
                                }}
                              >
                                <MessageSquare className="h-3 w-3 mr-1" />
                                Chat
                                {request.unreadCount && request.unreadCount > 0 && (
                                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                                    {request.unreadCount}
                                  </span>
                                )}
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Navigation className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">No Active Routes</h4>
              <p className="text-sm text-muted-foreground">
                Accepted deliveries will appear here
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

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.rejectDialogTitle}</DialogTitle>
            <DialogDescription>{t.rejectDialogDescription}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.rejectReason}</label>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder={t.rejectReasonPlaceholder}
              rows={4}
              className="resize-none"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason("");
                setSelectedRequestId(null);
              }}
            >
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleConfirmReject}>
              {t.confirmReject}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Chat Dialog */}
      {selectedDeliveryRequestId && (
        <DeliveryChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          deliveryRequestId={selectedDeliveryRequestId}
          currentUserId={currentUser?.id || 0}
          deliveryDetails={{
            cargoType: deliveryRequests.find(r => r.id === String(selectedDeliveryRequestId))?.cargoType || '',
            buyerName: deliveryRequests.find(r => r.id === String(selectedDeliveryRequestId))?.requesterName || 'Buyer',
            transporterName: currentUser?.name || 'You',
          }}
        />
      )}
    </DashboardLayout>
  );
}
