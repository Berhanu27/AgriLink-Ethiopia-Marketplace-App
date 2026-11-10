"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import OrderChatDialog from "@/components/OrderChatDialog";
import { toast } from "sonner";
import {
  Users,
  Plus,
  Package,
  TrendingUp,
  CheckCircle2,
  UserPlus,
  BarChart3,
  DollarSign,
  Edit,
  Trash2,
  ShoppingCart,
  MessageSquare,
} from 'lucide-react';
import { api, ApiError } from "@/lib/api";

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
  
  const [backendListings, setBackendListings] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingListing, setEditingListing] = useState<any | null>(null);
  const [editForm, setEditForm] = useState({
    cropName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
    location: '',
    description: '',
  });
  const [chatOrder, setChatOrder] = useState<any | null>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [savingMember, setSavingMember] = useState(false);
  const [memberForm, setMemberForm] = useState({
    fullName: '',
    phone: '',
    cropName: '',
    quantity: '',
    unit: 'kg',
    pricePerUnit: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser?.id) return;
      
      try {
        const [listingsData, ordersData, membersData] = await Promise.all([
          api.listings.getForSeller(currentUser.id),
          api.orders.getForSeller(),
          api.cooperative.getMembers(),
        ]);
        setBackendListings(listingsData);
        setOrders(ordersData);
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser?.id]);

  const handleEditClick = (listing: any) => {
    setEditingListing(listing);
    setEditForm({
      cropName: listing.cropName || '',
      quantity: listing.quantity || '',
      unit: listing.unit || 'kg',
      pricePerUnit: listing.askingPrice?.toString() || '',
      location: listing.location || '',
      description: listing.description || '',
    });
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingListing) return;

    try {
      await api.listings.update(editingListing.id, {
        cropName: editForm.cropName,
        quantity: editForm.quantity,
        unit: editForm.unit,
        askingPrice: parseFloat(editForm.pricePerUnit),
        location: editForm.location,
        description: editForm.description,
      });

      const updatedListings = await api.listings.getForSeller(currentUser!.id);
      setBackendListings(updatedListings);
      setEditingListing(null);
    } catch (error) {
      console.error('Failed to update listing:', error);
      alert('Failed to update listing');
    }
  };

  const handleDelete = async (listingId: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) return;

    try {
      await api.listings.delete(listingId);
      const updatedListings = await api.listings.getForSeller(currentUser!.id);
      setBackendListings(updatedListings);
    } catch (error) {
      console.error('Failed to delete listing:', error);
      alert('Failed to delete listing');
    }
  };

  const handleOrderAction = async (orderId: number, status: string) => {
    try {
      await api.orders.update(orderId, { status });
      const updatedOrders = await api.orders.getForSeller();
      setOrders(updatedOrders);
    } catch (error) {
      console.error('Failed to update order:', error);
      alert('Failed to update order');
    }
  };

  const refreshMembersAndListings = async () => {
    if (!currentUser?.id) return;
    const [membersData, listingsData] = await Promise.all([
      api.cooperative.getMembers(),
      api.listings.getForSeller(currentUser.id),
    ]);
    setMembers(membersData);
    setBackendListings(listingsData);
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();

    const quantity = parseFloat(memberForm.quantity);
    const pricePerUnit = parseFloat(memberForm.pricePerUnit);
    if (!currentUser?.id) return;
    if (!Number.isFinite(quantity) || quantity <= 0) {
      toast.error('Enter a quantity greater than 0');
      return;
    }
    if (!Number.isFinite(pricePerUnit) || pricePerUnit < 0) {
      toast.error('Enter a valid price per unit');
      return;
    }

    setSavingMember(true);
    try {
      await api.cooperative.addMember({
        fullName: memberForm.fullName.trim(),
        phone: memberForm.phone.trim(),
        cropName: memberForm.cropName.trim(),
        quantity,
        unit: memberForm.unit,
        pricePerUnit,
      });
      await refreshMembersAndListings();
      setMemberForm({ fullName: '', phone: '', cropName: '', quantity: '', unit: 'kg', pricePerUnit: '' });
      toast.success('Member added and pooled into the bulk listing');
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to add member');
    } finally {
      setSavingMember(false);
    }
  };

  const handleRemoveMember = async (memberId: number) => {
    if (!confirm('Remove this member contribution? The bulk listing will be updated.')) return;

    try {
      await api.cooperative.removeMember(memberId);
      await refreshMembersAndListings();
      toast.success('Member removed and bulk listing updated');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error(error instanceof ApiError ? error.message : 'Failed to remove member');
    }
  };

  const formatNumber = (value: number) =>
    Number(value || 0).toLocaleString('en-US', { maximumFractionDigits: 2 });

  const memberCount = members.length > 0 ? members.length : (currentUser?.memberCount || 0);
  const topContributors = [...members]
    .sort((a, b) =>
      Number(b.quantity) * Number(b.pricePerUnit) - Number(a.quantity) * Number(a.pricePerUnit)
    )
    .slice(0, 5)
    .map((member) => ({
      name: member.fullName,
      contribution: `${formatNumber(Number(member.quantity))} ${member.unit} ${member.cropName}`,
      value: `${formatNumber(Number(member.quantity) * Number(member.pricePerUnit))} ETB`,
    }));

  const coopListings = backendListings.length > 0 ? backendListings : listings.filter((l) => l.farmerId === currentUser?.id);
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
          <Button
            variant="outline"
            className="w-full min-h-[56px]"
            onClick={() => setMemberDialogOpen(true)}
          >
            <UserPlus className="h-5 w-5 mr-2" />
            {t.manageMembers}
          </Button>
        </div>

        {/* Member Contributions */}
        <div id="top-contributors">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold">{t.topContributors}</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMemberDialogOpen(true)}
            >
              <UserPlus className="h-4 w-4 mr-1" />
              {t.manageMembers}
            </Button>
          </div>
          <Card className="overflow-hidden">
            {topContributors.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground w-12">#</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Member Name</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Contribution</th>
                      <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {topContributors.map((member, index) => (
                      <tr key={`${member.name}-${index}`} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium text-muted-foreground">
                          <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold">{member.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{member.contribution}</td>
                        <td className="px-4 py-3 text-right font-semibold text-primary">{member.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No member contributions yet. Add members to start pooling produce.
              </p>
            )}
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
            <Card className="overflow-hidden" id="my-listings">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Location</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {coopListings.map((listing) => (
                      <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">{listing.cropName}</td>
                        <td className="px-4 py-3">{listing.quantity} {listing.unit}</td>
                        <td className="px-4 py-3 text-primary font-semibold">
                          {listing.askingPrice || listing.pricePerUnit} ETB/{listing.unit}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{listing.location}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={listing.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs capitalize"
                          >
                            {listing.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleEditClick(listing)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8"
                              onClick={() => handleDelete(listing.id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
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

        {/* Purchase Orders Section */}
        <div id="purchase-orders">
          <h3 className="text-xl font-bold mb-4">Purchase Orders</h3>
          {loading ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">Loading orders...</p>
            </Card>
          ) : orders.length > 0 ? (
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Buyer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Offered Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 font-medium">
                          <div>
                            <p>{order.cropName}</p>
                            {order.paymentScreenshotUrl && (
                              <div className="flex items-center gap-1 text-xs text-green-600 mt-1">
                                <CheckCircle2 className="h-3 w-3" />
                                Payment Uploaded
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div>
                            <p className="font-medium">{order.buyerName}</p>
                            <p className="text-xs text-muted-foreground">{order.buyerPhone}</p>
                            {order.buyerMessage && (
                              <p className="text-xs text-muted-foreground mt-1 italic">"{order.buyerMessage}"</p>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">{order.requestedQuantity} {order.unit}</td>
                        <td className="px-4 py-3 text-primary font-semibold">
                          {order.offeredPrice} ETB/{order.unit}
                        </td>
                        <td className="px-4 py-3">
                          <Badge
                            variant={
                              order.status === 'pending' ? 'secondary' :
                              order.status === 'accepted' ? 'default' :
                              order.status === 'completed' ? 'default' : 'destructive'
                            }
                            className="capitalize text-xs"
                          >
                            {order.status}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2 flex-wrap">
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="h-8"
                                  onClick={() => handleOrderAction(order.id, 'accepted')}
                                >
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8"
                                  onClick={() => handleOrderAction(order.id, 'rejected')}
                                >
                                  Reject
                                </Button>
                              </>
                            )}
                            {order.paymentScreenshotUrl && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                onClick={() => window.open(order.paymentScreenshotUrl, '_blank')}
                              >
                                View Payment
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 relative"
                              onClick={() => setChatOrder(order)}
                            >
                              <MessageSquare className="h-3 w-3 mr-1" />
                              Chat
                              {order.unreadCount > 0 && (
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
              <h4 className="font-semibold mb-2">No Purchase Orders</h4>
              <p className="text-sm text-muted-foreground">
                Orders from buyers will appear here
              </p>
            </Card>
          )}
        </div>
      </div>

      {/* Edit Listing Dialog */}
      <Dialog open={!!editingListing} onOpenChange={() => setEditingListing(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Listing</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cropName">Crop Name</Label>
              <Input
                id="cropName"
                value={editForm.cropName}
                onChange={(e) => setEditForm({ ...editForm, cropName: e.target.value })}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="quantity">Quantity</Label>
                <Input
                  id="quantity"
                  value={editForm.quantity}
                  onChange={(e) => setEditForm({ ...editForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="unit">Unit</Label>
                <select
                  id="unit"
                  value={editForm.unit}
                  onChange={(e) => setEditForm({ ...editForm, unit: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="pricePerUnit">Price per Unit (ETB)</Label>
              <Input
                id="pricePerUnit"
                type="number"
                value={editForm.pricePerUnit}
                onChange={(e) => setEditForm({ ...editForm, pricePerUnit: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button type="submit" className="flex-1">Save Changes</Button>
              <Button type="button" variant="outline" onClick={() => setEditingListing(null)}>
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Chat Dialog */}
      {chatOrder && (
        <OrderChatDialog
          open={!!chatOrder}
          onOpenChange={(open) => !open && setChatOrder(null)}
          orderId={chatOrder.id}
          currentUserId={currentUser?.id || 0}
          orderDetails={{
            cropName: chatOrder.cropName || '',
            buyerName: chatOrder.buyerName || 'Buyer',
            sellerName: currentUser?.cooperativeName || currentUser?.fullName || 'You',
          }}
        />
      )}

      {/* Manage Members Dialog */}
      <Dialog open={memberDialogOpen} onOpenChange={setMemberDialogOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{t.manageMembers}</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Each contribution is pooled by crop and unit into one bulk listing owned by your cooperative.
            </p>

            {members.length > 0 ? (
              <div className="border rounded-md overflow-hidden max-h-60 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b sticky top-0 bg-background">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Member</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Quantity</th>
                      <th className="text-left px-3 py-2 font-medium text-muted-foreground">Price/Unit</th>
                      <th className="text-right px-3 py-2 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {members.map((member) => (
                      <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-3 py-2">
                          <p className="font-medium leading-none">{member.fullName}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{member.phone}</p>
                        </td>
                        <td className="px-3 py-2 font-medium">{member.cropName}</td>
                        <td className="px-3 py-2">{formatNumber(Number(member.quantity))} {member.unit}</td>
                        <td className="px-3 py-2 font-semibold text-primary">{formatNumber(Number(member.pricePerUnit))} ETB</td>
                        <td className="px-3 py-2 text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => handleRemoveMember(member.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5 mr-1" />
                            Remove
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4 border rounded-md">
                No members yet. Add the first member below.
              </p>
            )}
          </div>

          <form onSubmit={handleAddMember} className="space-y-3 border-t pt-4">
            <h4 className="font-semibold">Add Member Contribution</h4>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="memberName">Full Name</Label>
                <Input
                  id="memberName"
                  value={memberForm.fullName}
                  onChange={(e) => setMemberForm({ ...memberForm, fullName: e.target.value })}
                  placeholder="e.g. Abebe Tesfa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="memberPhone">Phone</Label>
                <Input
                  id="memberPhone"
                  type="tel"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  placeholder="+251911234567"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="memberCrop">Crop</Label>
              <Input
                id="memberCrop"
                value={memberForm.cropName}
                onChange={(e) => setMemberForm({ ...memberForm, cropName: e.target.value })}
                placeholder="e.g. Maize"
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label htmlFor="memberQuantity">Quantity</Label>
                <Input
                  id="memberQuantity"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={memberForm.quantity}
                  onChange={(e) => setMemberForm({ ...memberForm, quantity: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="memberUnit">Unit</Label>
                <select
                  id="memberUnit"
                  value={memberForm.unit}
                  onChange={(e) => setMemberForm({ ...memberForm, unit: e.target.value })}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                >
                  <option value="kg">kg</option>
                  <option value="quintal">quintal</option>
                  <option value="ton">ton</option>
                </select>
              </div>
              <div>
                <Label htmlFor="memberPrice">Price/Unit</Label>
                <Input
                  id="memberPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={memberForm.pricePerUnit}
                  onChange={(e) => setMemberForm({ ...memberForm, pricePerUnit: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" className="flex-1" disabled={savingMember}>
                <UserPlus className="h-4 w-4 mr-2" />
                {savingMember ? 'Adding...' : 'Add Member & Pool'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setMemberDialogOpen(false)}
              >
                Close
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
