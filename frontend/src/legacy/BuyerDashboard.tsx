"use client";

import { useState } from "react";
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
} from "lucide-react";

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
  },
} as const;

export default function BuyerDashboard() {
  const { currentUser, listings, marketPrices, transporters, language, createDeliveryRequest } = useApp();
  const t = translations[language] ?? translations.en;
  const [searchQuery, setSearchQuery] = useState('');
  const [savedListings] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handleRequestChange = (field: keyof typeof requestForm, value: string) => {
    setRequestForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleRequestSubmit = async () => {
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
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.availableTransporters}</h3>
            <Badge variant="secondary">{transporters.length} available</Badge>
          </div>
          {transporters.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {transporters.map((transporter) => (
                <Card key={transporter.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-12 w-12 flex-shrink-0 rounded-lg border border-border overflow-hidden bg-muted/40">
                      {transporter.vehicleImageUrl ? (
                        <img
                          src={transporter.vehicleImageUrl}
                          alt={transporter.fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-semibold">{transporter.fullName}</h4>
                          <p className="text-sm text-muted-foreground">{transporter.region || 'Region not set'}</p>
                          <p className="text-sm text-muted-foreground">{transporter.phone}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">Verified</Badge>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">
                        {transporter.vehicleType || 'Vehicle'} · {transporter.vehicleCapacity || 'Capacity not set'}
                      </p>
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleRequestChange('transporterId', transporter.id)}
                        >
                          {t.selectTransporter}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
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
              <div className="rounded-xl border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">Admin Products</h4>
                    <p className="text-xs text-muted-foreground">Major products with official price per kg</p>
                  </div>
                  <Badge variant="secondary">{adminListings.length} items</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {adminListings.map((listing) => (
                    <Card key={listing.id} className="p-2">
                      <div className="flex gap-2">
                        <div className="h-16 w-16 flex-shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={listing.cropName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-8 w-8 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-xs">{listing.cropName}</h4>
                            {listing.farmerVerified && (
                              <Badge variant="secondary" className="text-[10px]">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs font-bold text-primary">
                            {listing.pricePerUnit} ETB/{listing.unit}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card/70 p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-lg font-semibold">Farmer Products</h4>
                    <p className="text-xs text-muted-foreground">Contact farmers directly for availability</p>
                  </div>
                  <Badge variant="secondary">{farmerListings.length} items</Badge>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
                  {farmerListings.map((listing) => (
                    <Card key={listing.id} className="p-2">
                      <div className="flex gap-2">
                        <div className="h-20 w-20 flex-shrink-0 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                          {listing.imageUrl ? (
                            <img
                              src={listing.imageUrl}
                              alt={listing.cropName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="h-10 w-10 text-primary" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h4 className="font-semibold text-xs">{listing.cropName}</h4>
                            <Button variant="ghost" size="icon" className="h-7 w-7">
                              <Heart className="h-3.5 w-3.5" />
                            </Button>
                          </div>

                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] text-muted-foreground">{listing.farmerName}</span>
                                {listing.farmerVerified && (
                                  <Badge variant="secondary" className="text-[10px]">
                                    <CheckCircle2 className="h-3 w-3 mr-1" />
                                    Verified
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <Phone className="h-2.5 w-2.5" />
                                  {listing.farmerPhone || 'Phone not provided'}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="h-2.5 w-2.5" />
                                  {listing.location}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-muted-foreground">
                                  {listing.quantity} {listing.unit} available
                                </div>
                                <span className="text-xs font-bold text-primary">
                                  {listing.pricePerUnit} ETB/{listing.unit}
                                </span>
                              </div>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              <Button size="sm" variant="outline" className="h-5 w-5 p-0" aria-label={t.call}>
                                <Phone className="h-3 w-3" />
                              </Button>
                              <Button size="sm" className="h-5 w-5 p-0" aria-label={t.message}>
                                <MessageSquare className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
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
    </DashboardLayout>
  );
}
