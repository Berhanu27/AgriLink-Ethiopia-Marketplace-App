"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import OrderChatDialog from "@/components/OrderChatDialog";
import DeliveryChatDialog from "@/components/DeliveryChatDialog";
import {
  Search as SearchIcon,
  Filter,
  MapPin,
  Phone,
  MessageSquare,
  Heart,
  TrendingUp,
  TrendingDown,
  Package,
  CheckCircle2,
  Clock,
  Bookmark,
  Truck,
  XCircle,
  Navigation,
  ShoppingCart,
} from "lucide-react";
import { PurchaseRequestDialog } from "@/components/PurchaseRequestDialog";
import { PaymentUploadDialog } from "@/components/PaymentUploadDialog";
import { api } from "@/lib/api";

const translations = {
  en: {
    welcome: "Welcome,",
    subtitle: "Find quality produce from verified farmers",
    verified: "Verified Buyer",
    pending: "Verification Pending",
    pendingNote: "Your account is pending admin approval. You can still browse and contact farmers.",
    searchPlaceholder: "Search crops, location...",
    available: "Available",
    saved: "Saved",
    inquiries: "Inquiries",
    postDemand: "Post What You're Looking For",
    marketTitle: "Today's Market Prices",
    availableTitle: "Available Produce",
    listingsLabel: "listings",
    noResultsTitle: "No Results Found",
    noResultsSubtitle: "Try adjusting your search or filters",
    savedTitle: "Saved Listings",
    savedSubtitle: "Your saved listings will appear here",
    call: "Call",
    message: "Message",
    requestTitle: "Request Transport",
    requestSubtitle: "Send a delivery request to a verified transporter",
    transporterLabel: "Transporter",
    transporterPlaceholder: "Choose a transporter",
    pickupLabel: "Pickup location",
    pickupPlaceholder: "e.g., Addis Ababa, Bole",
    destinationLabel: "Destination",
    destinationPlaceholder: "e.g., Hawassa",
    cargoLabel: "Cargo type",
    cargoPlaceholder: "e.g., Teff",
    weightLabel: "Weight",
    weightPlaceholder: "Enter weight",
    priceLabel: "Price offer (ETB)",
    pricePlaceholder: "Enter offer",
    preferredLabel: "Preferred time",
    notesLabel: "Notes",
    notesPlaceholder: "Add extra details",
    submitRequest: "Send Request",
    requestSuccess: "Delivery request submitted.",
    requestError: "Unable to send request.",
    requiredError: "Please fill all required fields.",
    availableTransporters: "Available Transporters",
    selectTransporter: "Select",
    unverifiedError: "Your account is pending verification. Please wait for approval.",
    myRequests: "My Delivery Requests",
    requestStatus: "Status",
    statusPending: "Pending",
    statusAccepted: "Accepted",
    statusRejected: "Rejected",
    statusInTransit: "In Transit",
    statusDelivered: "Delivered",
    rejectionReason: "Rejection Reason",
    noRequests: "No delivery requests yet",
    noRequestsSubtitle: "Your delivery requests will appear here",
    myOrders: "My Purchase Orders",
    orderStatus: "Status",
    requestedQty: "Requested",
    availableQty: "Available",
    farmerResponse: "Farmer Response",
    noOrders: "No purchase orders yet",
    noOrdersSubtitle: "Your purchase requests will appear here",
    uploadPayment: "Upload Payment",
    paymentUploaded: "Payment Proof Uploaded",
  },
  am: {
    welcome: "እንኳን ደህና መጡ,",
    subtitle: "ከተረጋገጡ ገበሬዎች ጥራት ያላቸውን ምርቶች ያግኙ",
    verified: "የተረጋገጠ ገዢ",
    pending: "ማረጋገጫ በመጠባበቅ ላይ",
    pendingNote: "መለያዎ በአድሚን ማረጋገጫ ላይ ነው። ማየትና ገበሬዎችን መገናኘት ይችላሉ።",
    searchPlaceholder: "ምርት፣ አካባቢ...",
    available: "የሚገኙ",
    saved: "የተቀመጡ",
    inquiries: "ጥያቄዎች",
    postDemand: "የምትፈልጉትን ይጻፉ",
    marketTitle: "የዛሬ የገበያ ዋጋዎች",
    availableTitle: "የሚገኙ ምርቶች",
    listingsLabel: "ዝርዝሮች",
    noResultsTitle: "ውጤት አልተገኘም",
    noResultsSubtitle: "ፍለጋዎን ወይም ማጣሪያዎችን ይቀይሩ",
    savedTitle: "የተቀመጡ ዝርዝሮች",
    savedSubtitle: "የተቀመጡት ዝርዝሮች እዚህ ይታያሉ",
    call: "ይደውሉ",
    message: "መልዕክት",
    requestTitle: "የመጓጓዣ ጥያቄ",
    requestSubtitle: "የተረጋገጠ ትራንስፖርተር ይጠይቁ",
    transporterLabel: "ትራንስፖርተር",
    transporterPlaceholder: "ትራንስፖርተር ይምረጡ",
    pickupLabel: "መውሰጃ ቦታ",
    pickupPlaceholder: "ምሳሌ፦ አዲስ አበባ, ቦሌ",
    destinationLabel: "መድረሻ",
    destinationPlaceholder: "ምሳሌ፦ ሀዋሳ",
    cargoLabel: "የጭነት አይነት",
    cargoPlaceholder: "ምሳሌ፦ ጤፍ",
    weightLabel: "ክብደት",
    weightPlaceholder: "ክብደት ያስገቡ",
    priceLabel: "የዋጋ ጥያቄ (ብር)",
    pricePlaceholder: "ዋጋ ያስገቡ",
    preferredLabel: "የተመረጠ ጊዜ",
    notesLabel: "ማስታወሻ",
    notesPlaceholder: "ተጨማሪ መረጃ ያስገቡ",
    submitRequest: "ጥያቄ ላክ",
    requestSuccess: "ጥያቄው ተልኳል።",
    requestError: "ጥያቄ ላክ አልተሳካም።",
    requiredError: "እባክዎ አስፈላጊ መስኮችን ይሙሉ።",
    availableTransporters: "የሚገኙ ትራንስፖርተሮች",
    selectTransporter: "ይምረጡ",
    unverifiedError: "መለያዎ ማረጋገጫ በመጠባበቅ ላይ ነው። እባክዎ ማረጋገጫን ይጠብቁ।",
    myRequests: "የእኔ የማድረሻ ጥያቄዎች",
    requestStatus: "ሁኔታ",
    statusPending: "በመጠባበቅ ላይ",
    statusAccepted: "ተቀባይነት አግኝቷል",
    statusRejected: "ውድቅ ተደርጓል",
    statusInTransit: "በመጓጓዣ ላይ",
    statusDelivered: "ተደርሷል",
    rejectionReason: "የውድቅነት ምክንያት",
    noRequests: "ገና የማድረሻ ጥያቄ የለም",
    noRequestsSubtitle: "የማድረሻ ጥያቄዎችዎ እዚህ ይታያሉ",
  },
  or: {
    welcome: "Baga nagaan dhuftan,",
    subtitle: "Oomisha qulqullina qabu qonnaan bultoota mirkanaa'anii irraa barbaadi",
    verified: "Bittaa mirkanaa'e",
    pending: "Mirkaneessi eeggamaa jira",
    pendingNote: "Akkaawuntiin kee mirkaneessa adminiin eeggamaa jira. Amma illee qonnaan bultoota qunnamuu dandeessa.",
    searchPlaceholder: "Oomisha, bakka...",
    available: "Argamu",
    saved: "Kuufame",
    inquiries: "Gaaffilee",
    postDemand: "Wantoota barbaaddu barreessi",
    marketTitle: "Gatiin gabaa har'aa",
    availableTitle: "Oomisha argamu",
    listingsLabel: "tarreeffamoota",
    noResultsTitle: "Bu'aan hin argamne",
    noResultsSubtitle: "Barbaacha ykn faayiltara jijjiiri",
    savedTitle: "Tarreeffamoota kuufaman",
    savedSubtitle: "Tarreeffamoota kuufaman as ni mul'atu",
    call: "Waami",
    message: "Ergaa",
    requestTitle: "Gaaffii geejjibaa",
    requestSubtitle: "Gejjibaa mirkanaa'eef gaaffii ergi",
    transporterLabel: "Geesjibaa",
    transporterPlaceholder: "Geesjibaa filadhu",
    pickupLabel: "Irraa ka'iinsa",
    pickupPlaceholder: "Fakkeenya: Finfinnee, Bole",
    destinationLabel: "Bakki geessi",
    destinationPlaceholder: "Fakkeenya: Hawaasa",
    cargoLabel: "Gosa fe'umsaa",
    cargoPlaceholder: "Fakkeenya: Xaafii",
    weightLabel: "Ulfa",
    weightPlaceholder: "Ulfaa galchi",
    priceLabel: "Gatii kennitu (ETB)",
    pricePlaceholder: "Gatii galchi",
    preferredLabel: "Yeroo filatamaa",
    notesLabel: "Yaadannoo",
    notesPlaceholder: "Ibsa dabalataa barreessi",
    submitRequest: "Gaaffii ergi",
    requestSuccess: "Gaaffiin ergameera.",
    requestError: "Gaaffii erguun hin milkoofne.",
    requiredError: "Maaloo dirqama ta'an guuti.",
    availableTransporters: "Geesjiboota argaman",
    selectTransporter: "Filadhu",
    unverifiedError: "Akkaawuntiin kee mirkaneessaaf eegamaa jira. Eeggii mirkaneessaa.",
    myRequests: "Gaaffilee geejjibaa koo",
    requestStatus: "Haala",
    statusPending: "Eeggataa",
    statusAccepted: "Fudhatame",
    statusRejected: "Didame",
    statusInTransit: "Imala keessa",
    statusDelivered: "Geeffame",
    rejectionReason: "Sababa diddaa",
    noRequests: "Gaaffiin geejjibaa hin jiru",
    noRequestsSubtitle: "Gaaffilee geejjibaa kee as ni mul'atu",
  },
} as const;

export default function BuyerDashboard() {
  const { currentUser, listings, marketPrices, transporters, language, createDeliveryRequest, deliveryRequests } = useApp();
  const t = translations[language] ?? translations.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [savedListings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [purchaseDialogOpen, setPurchaseDialogOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<any>(null);
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [chatDialogOpen, setChatDialogOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [deliveryChatDialogOpen, setDeliveryChatDialogOpen] = useState(false);
  const [selectedDeliveryRequestId, setSelectedDeliveryRequestId] = useState<number | null>(null);
  const [requestForm, setRequestForm] = useState({
    transporterId: '',
    pickupLocation: '',
    destination: '',
    cargoType: '',
    weightValue: '',
    weightUnit: 'kg',
    priceOffer: '',
    preferredTime: '',
    notes: '',
  });

  // Fetch purchase orders
  React.useEffect(() => {
    const fetchOrders = async () => {
      if (!currentUser) return;
      try {
        const orders = await api.orders.getForBuyer();
        setPurchaseOrders(orders);
      } catch (error) {
        console.error('Failed to fetch orders:', error);
      }
    };
    fetchOrders();
  }, [currentUser]);

  const refreshOrders = async () => {
    try {
      const orders = await api.orders.getForBuyer();
      setPurchaseOrders(orders);
    } catch (error) {
      console.error('Failed to refresh orders:', error);
    }
  };

  const handlePurchaseRequest = (listing: any) => {
    if (!currentUser?.verified) {
      toast.error(t.unverifiedError);
      return;
    }
    setSelectedListing(listing);
    setPurchaseDialogOpen(true);
  };

  const handleRequestChange = (field: keyof typeof requestForm, value: string) => {
    setRequestForm((prev) => ({ ...prev, [field]: value }));
  };

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

  const handleRequestSubmit = async () => {
    if (!currentUser?.verified) {
      toast.error(t.unverifiedError);
      return;
    }

    if (!requestForm.transporterId || !requestForm.pickupLocation || !requestForm.destination || !requestForm.cargoType) {
      toast.error(t.requiredError);
      return;
    }

    const weightValue = requestForm.weightValue ? Number(requestForm.weightValue) : undefined;
    const priceOffer = requestForm.priceOffer ? Number(requestForm.priceOffer) : undefined;

    if ((requestForm.weightValue && Number.isNaN(weightValue)) || (requestForm.priceOffer && Number.isNaN(priceOffer))) {
      toast.error(t.requestError);
      return;
    }

    setIsSubmitting(true);
    const ok = await createDeliveryRequest({
      transporterId: requestForm.transporterId,
      pickupLocation: requestForm.pickupLocation.trim(),
      destination: requestForm.destination.trim(),
      cargoType: requestForm.cargoType.trim(),
      weightValue,
      weightUnit: requestForm.weightValue ? requestForm.weightUnit : undefined,
      preferredTime: requestForm.preferredTime || undefined,
      priceOffer,
      notes: requestForm.notes.trim() || undefined,
    });
    setIsSubmitting(false);

    if (ok) {
      toast.success(t.requestSuccess);
      setRequestForm({
        transporterId: '',
        pickupLocation: '',
        destination: '',
        cargoType: '',
        weightValue: '',
        weightUnit: 'kg',
        priceOffer: '',
        preferredTime: '',
        notes: '',
      });
    } else {
      toast.error(t.requestError);
    }
  };

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
      case 'rejected':
        return 'bg-red-500/10 text-red-700 border-red-200';
      default:
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return t.statusPending;
      case 'accepted':
        return t.statusAccepted;
      case 'in-transit':
        return t.statusInTransit;
      case 'delivered':
        return t.statusDelivered;
      case 'rejected':
        return t.statusRejected;
      default:
        return status;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'accepted':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'in-transit':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const filteredListings = listings.filter(
    (l) =>
      l.status === 'active' &&
      (searchQuery === '' ||
        l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.location.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  const adminListings = filteredListings.filter((l) => l.farmerId === 'admin');
  const farmerListings = filteredListings.filter((l) => l.farmerId !== 'admin');

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold mb-1">{t.welcome} {currentUser?.name}!</h2>
          <p className="text-muted-foreground">{t.subtitle}</p>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={currentUser?.verified ? 'default' : 'secondary'}>
              {currentUser?.verified ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t.verified}
                </>
              ) : (
                <>
                  <Clock className="h-3 w-3 mr-1" />
                  {t.pending}
                </>
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">• {currentUser?.region || 'N/A'}</span>
          </div>
        </div>

        {!currentUser?.verified && (
          <Card className="p-4 border-amber-200 bg-amber-50">
            <p className="text-sm text-amber-900">{t.pendingNote}</p>
          </Card>
        )}

        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder={t.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 min-h-[48px]"
            />
          </div>
          <Button variant="outline" size="icon" className="h-12 w-12 flex-shrink-0">
            <Filter className="h-5 w-5" />
          </Button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{filteredListings.length}</p>
              <p className="text-xs text-muted-foreground">{t.available}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Bookmark className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{savedListings.length}</p>
              <p className="text-xs text-muted-foreground">{t.saved}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">0</p>
              <p className="text-xs text-muted-foreground">{t.inquiries}</p>
            </div>
          </Card>
        </div>

        {/* Post Demand Button */}
        <Button className="w-full min-h-[48px]" variant="outline">
          <MessageSquare className="h-4 w-4 mr-2" />
          {t.postDemand}
        </Button>

        {/* Available Transporters */}
        <div id="find-transport">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.availableTransporters}</h3>
            <Badge variant="secondary">{transporters.length} available</Badge>
          </div>
          {transporters.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehicle</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Vehicle Type</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Capacity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transporters.map((transporter) => (
                      <tr key={transporter.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="h-10 w-14 rounded-md overflow-hidden bg-muted/40 border flex items-center justify-center">
                            {transporter.vehicleImageUrl ? (
                              <img src={transporter.vehicleImageUrl} alt={transporter.fullName} className="h-full w-full object-cover" />
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-semibold">{transporter.fullName}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.phone}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.region || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.vehicleType || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{transporter.vehicleCapacity || '—'}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8"
                            onClick={() => handleRequestChange('transporterId', transporter.id)}
                          >
                            {t.selectTransporter}
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : (
            <Card className="p-6 text-center">
              <p className="text-sm text-muted-foreground">No verified transporters available yet.</p>
            </Card>
          )}
        </div>

        {/* Transport Request */}
        <Card className="p-6">
          <div className="flex flex-col gap-1 mb-4">
            <h3 className="text-xl font-bold">{t.requestTitle}</h3>
            <p className="text-sm text-muted-foreground">{t.requestSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.transporterLabel}</label>
              <Select
                value={requestForm.transporterId}
                onValueChange={(value) => handleRequestChange('transporterId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.transporterPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {transporters.map((transporter) => (
                    <SelectItem key={transporter.id} value={transporter.id}>
                      {transporter.fullName} • {transporter.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.pickupLabel}</label>
              <Input
                value={requestForm.pickupLocation}
                onChange={(e) => handleRequestChange('pickupLocation', e.target.value)}
                placeholder={t.pickupPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.destinationLabel}</label>
              <Input
                value={requestForm.destination}
                onChange={(e) => handleRequestChange('destination', e.target.value)}
                placeholder={t.destinationPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.cargoLabel}</label>
              <Input
                value={requestForm.cargoType}
                onChange={(e) => handleRequestChange('cargoType', e.target.value)}
                placeholder={t.cargoPlaceholder}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.weightLabel}</label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={requestForm.weightValue}
                  onChange={(e) => handleRequestChange('weightValue', e.target.value)}
                  placeholder={t.weightPlaceholder}
                  min="0"
                  className="flex-1"
                />
                <Select
                  value={requestForm.weightUnit}
                  onValueChange={(value) => handleRequestChange('weightUnit', value)}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="quintal">quintal</SelectItem>
                    <SelectItem value="ton">ton</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.priceLabel}</label>
              <Input
                type="number"
                value={requestForm.priceOffer}
                onChange={(e) => handleRequestChange('priceOffer', e.target.value)}
                placeholder={t.pricePlaceholder}
                min="0"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">{t.preferredLabel}</label>
              <Input
                type="datetime-local"
                value={requestForm.preferredTime}
                onChange={(e) => handleRequestChange('preferredTime', e.target.value)}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">{t.notesLabel}</label>
              <Textarea
                value={requestForm.notes}
                onChange={(e) => handleRequestChange('notes', e.target.value)}
                placeholder={t.notesPlaceholder}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end">
            <Button onClick={handleRequestSubmit} disabled={isSubmitting}>
              {isSubmitting ? '...' : t.submitRequest}
            </Button>
          </div>
        </Card>

        {/* My Delivery Requests */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.myRequests}</h3>
          {deliveryRequests.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Cargo</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Route</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Transporter</th>
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
                            {request.preferredTime && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                                <Clock className="h-3 w-3" />
                                {formatPreferredTime(request.preferredTime)}
                              </p>
                            )}
                          </div>
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
                          <p className="font-medium">{request.transporterName || 'N/A'}</p>
                        </td>
                        <td className="px-4 py-3">
                          {request.weightValue ? (
                            <span>{request.weightValue}{request.weightUnit || ''}</span>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-primary font-semibold">
                          {request.priceOffer?.toLocaleString() ?? "—"} ETB
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Badge
                              variant="outline"
                              className={`${getStatusColor(request.status)} text-xs capitalize`}
                            >
                              {getStatusIcon(request.status)}
                              <span className="ml-1">{getStatusLabel(request.status)}</span>
                            </Badge>
                            {request.status === 'rejected' && request.rejectReason && (
                              <p className="text-xs text-red-600 mt-1 italic">"{request.rejectReason}"</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            {(request.status === 'accepted' || request.status === 'in-transit') && (
                              <>
                                <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                                  <Phone className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="h-8 relative"
                                  onClick={() => {
                                    setSelectedDeliveryRequestId(request.id);
                                    setDeliveryChatDialogOpen(true);
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
              <h4 className="font-semibold mb-2">{t.noRequests}</h4>
              <p className="text-sm text-muted-foreground">{t.noRequestsSubtitle}</p>
            </Card>
          )}
        </div>
        {/* My Purchase Orders */}
        <div id="my-orders">
          <h3 className="text-xl font-bold mb-4">{t.myOrders}</h3>
          {purchaseOrders.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Seller</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {purchaseOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{order.cropName}</p>
                            {order.buyerMessage && (
                              <p className="text-xs text-muted-foreground italic mt-1">"{order.buyerMessage}"</p>
                            )}
                            {order.farmerResponse && (
                              <div className="text-xs text-green-600 mt-1">
                                <p className="font-semibold">Farmer: "{order.farmerResponse}"</p>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{order.sellerName}</p>
                            <p className="text-xs text-muted-foreground">{order.sellerPhone}</p>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p>{order.requestedQuantity} {order.unit}</p>
                            {order.availableQuantity && (
                              <p className="text-xs text-green-600">Available: {order.availableQuantity}</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-primary font-semibold">
                          {order.offeredPrice} ETB/{order.unit}
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <Badge
                              variant={
                                order.status === 'completed' ? 'default' :
                                order.status === 'accepted' ? 'secondary' :
                                order.status === 'rejected' ? 'destructive' :
                                'outline'
                              }
                              className="capitalize text-xs"
                            >
                              {order.status}
                            </Badge>
                            {order.paymentScreenshotUrl && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Payment Uploaded
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'accepted' && !order.paymentScreenshotUrl && (
                              <Button 
                                size="sm" 
                                className="h-8"
                                onClick={() => {
                                  setSelectedOrderId(order.id);
                                  setPaymentDialogOpen(true);
                                }}
                              >
                                Upload Payment
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="outline"
                              className="h-8 relative"
                              onClick={() => {
                                setSelectedOrderId(order.id);
                                setChatDialogOpen(true);
                              }}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Chat
                              {order.unreadCount && order.unreadCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-[10px] font-semibold rounded-full flex items-center justify-center">
                                  {order.unreadCount}
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
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t.noOrders}</h4>
              <p className="text-sm text-muted-foreground">{t.noOrdersSubtitle}</p>
            </Card>
          )}
        </div>
        {/* Price Trends */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.marketTitle}</h3>
          <div className="grid grid-cols-2 gap-3">
            {marketPrices.slice(0, 4).map((price) => (
              <Card key={price.id} className="p-4">
                <h4 className="font-semibold mb-1">{price.cropName}</h4>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="text-xl font-bold text-primary">{price.averagePrice}</span>
                  <span className="text-xs text-muted-foreground">ETB/{price.unit}</span>
                </div>
                {price.change !== undefined && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      price.change > 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {price.change > 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {Math.abs(price.change)}%
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>

        {/* Available Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.availableTitle}</h3>
            <span className="text-sm text-muted-foreground">
              {filteredListings.length} {t.listingsLabel}
            </span>
          </div>

          {filteredListings.length > 0 ? (
            <div className="space-y-6">
              {/* Admin Products Table */}
              <div className="rounded-xl border border-border bg-card/70 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h4 className="text-lg font-semibold">Admin Products</h4>
                    <p className="text-xs text-muted-foreground">Major products with official price per kg</p>
                  </div>
                  <Badge variant="secondary">{adminListings.length} items</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {adminListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                                {listing.imageUrl ? (
                                  <img
                                    src={listing.imageUrl}
                                    alt={listing.cropName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <span className="font-medium">{listing.cropName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-primary font-semibold">
                            {listing.pricePerUnit} ETB/{listing.unit}
                          </td>
                          <td className="px-4 py-3">
                            {listing.farmerVerified && (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Farmer Products Table */}
              <div className="rounded-xl border border-border bg-card/70 overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b">
                  <div>
                    <h4 className="text-lg font-semibold">Farmer Products</h4>
                    <p className="text-xs text-muted-foreground">Contact farmers directly for availability</p>
                  </div>
                  <Badge variant="secondary">{farmerListings.length} items</Badge>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Farmer</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {farmerListings.map((listing) => (
                        <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 flex-shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                                {listing.imageUrl ? (
                                  <img
                                    src={listing.imageUrl}
                                    alt={listing.cropName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <Package className="h-6 w-6 text-primary" />
                                )}
                              </div>
                              <span className="font-medium">{listing.cropName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm">{listing.farmerName}</span>
                                {listing.farmerVerified && (
                                  <Badge variant="secondary" className="text-xs">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">{listing.farmerPhone || 'Phone not provided'}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">{listing.quantity} {listing.unit}</td>
                          <td className="px-4 py-3 text-primary font-semibold">
                            {listing.pricePerUnit} ETB/{listing.unit}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                className="h-8"
                                onClick={() => handlePurchaseRequest(listing)}
                              >
                                <ShoppingCart className="h-3 w-3 mr-1" />
                                Request
                              </Button>
                              <Button size="sm" variant="outline" className="h-8 w-8 p-0" aria-label={t.call}>
                                <Phone className="h-3 w-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t.noResultsTitle}</h4>
              <p className="text-sm text-muted-foreground">{t.noResultsSubtitle}</p>
            </Card>
          )}
        </div>

        {/* Saved Listings */}
        {savedListings.length > 0 && (
          <div>
            <h3 className="text-xl font-bold mb-4">{t.savedTitle}</h3>
            <Card className="p-6 text-center">
              <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">{t.savedSubtitle}</p>
            </Card>
          </div>
        )}
      </div>

      {/* Purchase Request Dialog */}
      {selectedListing && (
        <PurchaseRequestDialog
          open={purchaseDialogOpen}
          onOpenChange={setPurchaseDialogOpen}
          listing={selectedListing}
          onSuccess={() => {
            toast.success("Purchase request sent!");
            refreshOrders();
          }}
        />
      )}

      {/* Payment Upload Dialog */}
      {selectedOrderId && (
        <PaymentUploadDialog
          open={paymentDialogOpen}
          onOpenChange={setPaymentDialogOpen}
          orderId={selectedOrderId}
          onSuccess={() => {
            refreshOrders();
          }}
        />
      )}

      {/* Order Chat Dialog */}
      {selectedOrderId && (
        <OrderChatDialog
          open={chatDialogOpen}
          onOpenChange={setChatDialogOpen}
          orderId={selectedOrderId}
          currentUserId={currentUser?.id || 0}
          orderDetails={{
            cropName: purchaseOrders.find(o => o.id === selectedOrderId)?.cropName || '',
            buyerName: currentUser?.fullName || 'You',
            sellerName: purchaseOrders.find(o => o.id === selectedOrderId)?.sellerName || 'Farmer',
          }}
        />
      )}

      {/* Delivery Chat Dialog */}
      {selectedDeliveryRequestId && (
        <DeliveryChatDialog
          open={deliveryChatDialogOpen}
          onOpenChange={setDeliveryChatDialogOpen}
          deliveryRequestId={selectedDeliveryRequestId}
          currentUserId={currentUser?.id || 0}
          deliveryDetails={{
            cargoType: deliveryRequests.find(r => r.id === selectedDeliveryRequestId)?.cargoType || '',
            buyerName: currentUser?.fullName || 'You',
            transporterName: deliveryRequests.find(r => r.id === selectedDeliveryRequestId)?.transporterName || 'Transporter',
          }}
        />
      )}
    </DashboardLayout>
  );
}
