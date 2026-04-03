"use client";

import Link from "next/link";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Package,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  BarChart3,
  DollarSign,
} from 'lucide-react';

const translations = {
  en: {
    verified: "Verified Cooperative",
    pending: "Pending Verification",
    members: "Members",
    activeListings: "Active Listings",
    sold: "Sold",
    revenue: "ETB Revenue",
    createBulk: "Create Bulk Listing",
    manageMembers: "Manage Members",
    topContributors: "Top Contributing Members",
    bulkListings: "Bulk Listings",
    addMore: "Add More",
    noBulkTitle: "No Bulk Listings Yet",
    noBulkSubtitle: "Start selling together by creating your first bulk listing",
    createListing: "Create Listing",
    recentActivity: "Recent Activity",
  },
  am: {
    verified: "የተረጋገጠ ህብረት",
    pending: "ማረጋገጫ በመጠባበቅ ላይ",
    members: "አባላት",
    activeListings: "ንቁ ዝርዝሮች",
    sold: "ተሸጠ",
    revenue: "የብር ገቢ",
    createBulk: "ጅምላ ዝርዝር ይፍጠሩ",
    manageMembers: "አባላትን ያቀናብሩ",
    topContributors: "በጣም የሚያበዙ አባላት",
    bulkListings: "ጅምላ ዝርዝሮች",
    addMore: "ተጨማሪ ይጨምሩ",
    noBulkTitle: "ጅምላ ዝርዝር የለም",
    noBulkSubtitle: "የመጀመሪያውን ጅምላ ዝርዝር በመፍጠር ይጀምሩ",
    createListing: "ዝርዝር ይፍጠሩ",
    recentActivity: "የቅርብ ድርጊት",
  },
  or: {
    verified: "Walga'ii mirkanaa'e",
    pending: "Mirkaneessi eeggamaa",
    members: "Hirmaattota",
    activeListings: "Tarreeffamoota hojiirra jiran",
    sold: "Gurgurame",
    revenue: "Galii ETB",
    createBulk: "Tarreeffama gurguddaa uumi",
    manageMembers: "Hirmaattota too'achi",
    topContributors: "Hirmaattota gumaacha olaanaa",
    bulkListings: "Tarreeffamoota gurguddaa",
    addMore: "Dabalata dabaluu",
    noBulkTitle: "Tarreeffama gurguddaa hin jiru",
    noBulkSubtitle: "Tarreeffama jalqabaa waloon uumi",
    createListing: "Tarreeffama uumi",
    recentActivity: "Hojiirra ooleen dhiheenya",
  },
} as const;

export default function CooperativeDashboard() {
  const { currentUser, listings, language } = useApp();
  const t = translations[language] ?? translations.en;

  // Mock data for cooperative
  const memberCount = currentUser?.memberCount || 45;
  const coopListings = listings.filter((l) => l.farmerId === currentUser?.id);
  const activeListings = coopListings.filter((l) => l.status === 'active').length;
  const totalRevenue = 125000; // Mock revenue
  const totalSold = 8; // Mock sold items

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Welcome Section */}
        <div>
          <h2 className="text-2xl font-bold mb-1">{currentUser?.cooperativeName}</h2>
          <div className="flex items-center gap-2">
            <Badge variant={currentUser?.verified ? 'default' : 'secondary'}>
              {currentUser?.verified ? (
                <>
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  {t.verified}
                </>
              ) : (
                t.pending
              )}
            </Badge>
            <span className="text-sm text-muted-foreground">• {currentUser?.region}</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Users className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{memberCount}</p>
              <p className="text-xs text-muted-foreground">{t.members}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <Package className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{activeListings}</p>
              <p className="text-xs text-muted-foreground">{t.activeListings}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mb-2" />
              <p className="text-2xl font-bold">{totalSold}</p>
              <p className="text-xs text-muted-foreground">{t.sold}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col items-center text-center">
              <DollarSign className="h-8 w-8 text-primary mb-2" />
              <p className="text-2xl font-bold">{totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">{t.revenue}</p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Link href="/add">
            <Button className="w-full min-h-[56px]">
              <Plus className="h-5 w-5 mr-2" />
              {t.createBulk}
            </Button>
          </Link>
          <Button variant="outline" className="w-full min-h-[56px]">
            <UserPlus className="h-5 w-5 mr-2" />
            {t.manageMembers}
          </Button>
        </div>

        {/* Member Contributions */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.topContributors}</h3>
          <Card className="p-4">
            <div className="space-y-3">
              {[
                { name: 'Abebe Tesfa', contribution: '1,200 kg', value: '45,000 ETB' },
                { name: 'Almaz Girma', contribution: '850 kg', value: '32,000 ETB' },
                { name: 'Dawit Mulugeta', contribution: '650 kg', value: '24,500 ETB' },
              ].map((member, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium">{member.name}</p>
                      <p className="text-sm text-muted-foreground">{member.contribution}</p>
                    </div>
                  </div>
                  <span className="font-semibold text-primary">{member.value}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Aggregated Listings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.bulkListings}</h3>
            <Link href="/add">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {t.addMore}
              </Button>
            </Link>
          </div>

          {coopListings.length > 0 ? (
            <div className="space-y-3">
              {coopListings.map((listing) => (
                <Card key={listing.id} className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-16 h-16 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
                      <Package className="h-8 w-8 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="font-semibold">{listing.cropName}</h4>
                        <Badge
                          variant={listing.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs capitalize"
                        >
                          {listing.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {listing.quantity} {listing.unit} • {listing.location}
                      </p>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-semibold text-primary">
                          {listing.pricePerUnit} ETB/{listing.unit}
                        </span>
                        <span className="text-muted-foreground">{listing.views} views</span>
                        <span className="text-muted-foreground">{listing.inquiries} inquiries</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h4 className="font-semibold mb-2">{t.noBulkTitle}</h4>
              <p className="text-sm text-muted-foreground mb-4">{t.noBulkSubtitle}</p>
              <Link href="/add">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  {t.createListing}
                </Button>
              </Link>
            </Card>
          )}
        </div>

        {/* Activity Feed */}
        <div>
          <h3 className="text-xl font-bold mb-4">{t.recentActivity}</h3>
          <Card className="p-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Abebe Tesfa</span> added 200kg of Coffee
                  </p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-primary mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">New inquiry</span> received for Teff listing
                  </p>
                  <p className="text-xs text-muted-foreground">5 hours ago</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-2 h-2 rounded-full bg-green-600 mt-2"></div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-medium">Sale completed:</span> 500kg Maize sold
                  </p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Statistics */}
        <div>
          <h3 className="text-xl font-bold mb-4">Performance Overview</h3>
          <Card className="p-6">
            <div className="flex items-center justify-center">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-3" />
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Detailed analytics coming soon
            </p>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
