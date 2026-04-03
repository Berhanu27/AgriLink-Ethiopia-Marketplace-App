"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Eye,
  MessageSquare,
  TrendingUp,
  Package,
  CheckCircle2,
  Clock,
  XCircle,
  Users,
  DollarSign,
} from "lucide-react";

const translations = {
  en: {
    welcome: "Welcome back,",
    verified: "Verified Farmer",
    pending: "Verification Pending",
    addProduce: "Add New Produce",
    activeListings: "Active Listings",
    totalViews: "Total Views",
    inquiries: "Inquiries",
    myListings: "My Produce Listings",
    addMore: "Add More",
    noListingsTitle: "No Listings Yet",
    noListingsSubtitle: "Start selling by adding your first produce listing",
    addProduceCta: "Add Produce",
    buyersTitle: "Potential Buyers in Your Region",
    buyersSubtitle: "Upgrade to see buyers looking for your crops",
    buyersCta: "Browse Buyers",
    pricesTitle: "Market Prices Today",
    viewAll: "View All",
    connectBuyers: "Connect with Buyers",
  },
  am: {
    welcome: "እንደገና እንኳን በደህና መጡ,",
    verified: "የተረጋገጠ ገበሬ",
    pending: "ማረጋገጫ በመጠባበቅ ላይ",
    addProduce: "አዲስ ምርት ይጨምሩ",
    activeListings: "ንቁ ዝርዝሮች",
    totalViews: "ጠቅላላ ዕይታዎች",
    inquiries: "ጥያቄዎች",
    myListings: "የእኔ የምርት ዝርዝሮች",
    addMore: "ተጨማሪ ይጨምሩ",
    noListingsTitle: "ዝርዝር አልተጨመረም",
    noListingsSubtitle: "የመጀመሪያውን ምርት በመጨመር መሸጥ ይጀምሩ",
    addProduceCta: "ምርት ይጨምሩ",
    buyersTitle: "በክልልዎ ያሉ አማካይ ገዢዎች",
    buyersSubtitle: "ምርቶችዎን የሚፈልጉ ገዢዎችን ለማየት ያሻሽሉ",
    buyersCta: "ገዢዎችን ይመልከቱ",
    pricesTitle: "የዛሬ የገበያ ዋጋዎች",
    viewAll: "ሁሉንም ይመልከቱ",
    connectBuyers: "ገዢዎችን ይገናኙ",
  },
  or: {
    welcome: "Baga deebi'ee dhufte,",
    verified: "Qonnaan bultoota mirkanaa'e",
    pending: "Mirkaneessi eeggamaa jira",
    addProduce: "Oomisha haaraa dabaluu",
    activeListings: "Tarreeffamoota hojiirra jiran",
    totalViews: "Ilaalcha waliigalaa",
    inquiries: "Gaaffilee",
    myListings: "Tarreeffamoota oomisha koo",
    addMore: "Dabalata dabaluu",
    noListingsTitle: "Tarreeffamni hin jiru",
    noListingsSubtitle: "Tarreeffama oomisha jalqabaa dabaltee gurguruu jalqabi",
    addProduceCta: "Oomisha dabaluu",
    buyersTitle: "Bittoota naannoo keetii danda'aman",
    buyersSubtitle: "Oomisha kee barbaadaniif ol-ka'i",
    buyersCta: "Bittoota ilaali",
    pricesTitle: "Gatiin gabaa har'aa",
    viewAll: "Hunda ilaali",
    connectBuyers: "Bittoota wajjin wal qunnamu",
  },
} as const;

export default function FarmerDashboard() {
  const { currentUser, listings, marketPrices, language } = useApp();
  const t = translations[language] ?? translations.en;

  const myListings = listings.filter((l) => l.farmerId === currentUser?.id);
  const activeListings = myListings.filter((l) => l.status === 'active').length;
  const totalViews = myListings.reduce((sum, l) => sum + l.views, 0);
  const totalInquiries = myListings.reduce((sum, l) => sum + l.inquiries, 0);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'sold':
        return <DollarSign className="h-4 w-4" />;
      case 'expired':
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 border-green-200';
      case 'sold':
        return 'bg-blue-500/10 text-blue-700 border-blue-200';
      case 'expired':
        return 'bg-gray-500/10 text-gray-700 border-gray-200';
      default:
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Welcome Section */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">{t.welcome} {currentUser?.name}!</h2>
            <div className="flex items-center gap-2">
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
              <span className="text-sm text-muted-foreground">• {currentUser?.region}</span>
            </div>
          </div>
        </div>

        {/* Add Produce Button - Only show if verified */}
        {currentUser?.verified && (
          <Link href="/add">
            <Button size="lg" className="w-full min-h-[56px] text-lg bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 shadow-lg">
              <Plus className="h-5 w-5 mr-2" />
              {t.addProduce}
            </Button>
          </Link>
        )}

        {/* Verification Pending Message - Only show if not verified */}
        {!currentUser?.verified && (
          <Card className="p-6 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 border-2 border-amber-200 dark:border-amber-700 shadow-md">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 p-3 bg-amber-100 dark:bg-amber-900 rounded-full">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-300" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-lg text-amber-900 dark:text-amber-100 mb-1">
                  {t.pending}
                </p>
                <p className="text-sm text-amber-800 dark:text-amber-200 leading-relaxed mb-3">
                  Your account is under review by our admin team. Once verified, you'll unlock the ability to list your produce and connect with buyers.
                </p>
                <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-300 bg-white dark:bg-amber-900/30 px-3 py-2 rounded-md w-fit">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                    <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                  </div>
                  <span className="font-medium">Verification in progress</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{activeListings}</p>
              <p className="text-xs text-muted-foreground">{t.activeListings}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Eye className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{totalViews}</p>
              <p className="text-xs text-muted-foreground">{t.totalViews}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <MessageSquare className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{totalInquiries}</p>
              <p className="text-xs text-muted-foreground">{t.inquiries}</p>
            </div>
          </Card>
        </div>

        {/* My Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.myListings}</h3>
            {currentUser?.verified && (
              <Link href="/add">
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  {t.addMore}
                </Button>
              </Link>
            )}
          </div>

          {myListings.length > 0 ? (
            <div className="space-y-3">
              {myListings.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{listing.cropName}</h4>
                        <Badge
                          variant="outline"
                          className={`${getStatusColor(listing.status)} text-xs capitalize`}
                        >
                          {getStatusIcon(listing.status)}
                          <span className="ml-1">{listing.status}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {listing.quantity} {listing.unit} • {listing.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {listing.pricePerUnit} ETB/{listing.unit}
                        </span>
                        <span className="text-muted-foreground">
                          <Eye className="h-3 w-3 inline mr-1" />
                          {listing.views}
                        </span>
                        <span className="text-muted-foreground">
                          <MessageSquare className="h-3 w-3 inline mr-1" />
                          {listing.inquiries}
                        </span>
                        {currentUser?.verified && (
                          <Link href={`/add?edit=${listing.id}`} className="ml-auto">
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t.noListingsTitle}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t.noListingsSubtitle}</p>
              {currentUser?.verified ? (
                <Link href="/add">
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addProduceCta}
                  </Button>
                </Link>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-amber-700 dark:text-amber-300 font-medium">
                    Awaiting admin verification to add products
                  </p>
                  <Button disabled className="opacity-50 cursor-not-allowed">
                    <Plus className="h-4 w-4 mr-2" />
                    {t.addProduceCta}
                  </Button>
                </div>
              )}
            </Card>
          )}
        </div>

        {/* Matching Buyers Section */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.buyersTitle}</h3>
          <Card className="p-6 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h4 className="font-semibold mb-2">{t.connectBuyers}</h4>
            <p className="text-sm text-muted-foreground mb-4">{t.buyersSubtitle}</p>
            <Button variant="outline">{t.buyersCta}</Button>
          </Card>
        </div>

        {/* Market Prices Today */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.pricesTitle}</h3>
            <Link href="/search">
              <Button variant="ghost" size="sm">
                {t.viewAll}
              </Button>
            </Link>
          </div>
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
                    <TrendingUp className="h-3 w-3" />
                    {price.change > 0 ? '+' : ''}
                    {price.change}%
                  </div>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
