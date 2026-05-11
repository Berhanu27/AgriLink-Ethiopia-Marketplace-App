"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useApp } from "@/context/AppContext";
import PlatformAnalytics from "@/components/PlatformAnalytics";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  Package,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  BarChart3,
  Sprout,
  ShoppingCart,
  Truck,
  Building2,
} from "lucide-react";
import { api, ApiError } from "@/lib/api";

interface BackendUser {
  id: number;
  fullName: string;
  phone: string;
  email: string;
  nationalId?: string;
  region?: string;
  vehicleType?: string;
  vehicleCapacity?: string;
  cooperativeName?: string;
  memberCount?: number;
  verificationStatus: string;
  roles: string[];
}

interface BackendListing {
  id: number;
  sellerId: number;
  sellerName?: string;
  sellerPhone?: string;
  sellerRegion?: string;
  cropId: number;
  cropName?: string;
  askingPrice: number;
  imageUrl?: string;
  quantity?: string;
  unit?: string;
  location?: string;
  description?: string;
}

interface Broadcast {
  id: number;
  cropName: string;
  price: number;
  unit: string;
  note?: string;
  imageUrl?: string | null;
  createdAt: string;
}

export default function AdminDashboard() {
  const { listings } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [now] = useState(() => Date.now());
  const [users, setUsers] = useState<BackendUser[]>([]);
  const [backendListings, setBackendListings] = useState<BackendListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [editingBroadcastId, setEditingBroadcastId] = useState<number | null>(null);
  const [broadcastForm, setBroadcastForm] = useState({
    cropName: '',
    price: '',
    unit: 'kg',
    note: '',
    imagePreview: null as string | null,
    imageFile: null as File | null,
  });

  useEffect(() => {
    const fetchUsersAndListings = async () => {
      try {
        const [usersData, listingsData] = await Promise.all([
          api.users.getAll(),
          api.listings.getAll(),
        ]);
        setUsers(usersData);
        setBackendListings(listingsData);
        setFetchError(null);
      } catch (error) {
        console.error('Failed to fetch admin data:', error);
        const message = error instanceof ApiError && (error.status === 401 || error.status === 403)
          ? 'Unauthorized. Please log in with an admin account.'
          : 'Unable to reach backend. Ensure the API is running and NEXT_PUBLIC_API_URL points to it.';
        setFetchError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsersAndListings();
  }, []);

  useEffect(() => {
    const fetchBroadcasts = async () => {
      try {
        const data = await api.broadcasts.getAll();
        setBroadcasts(data);
      } catch (error) {
        console.error('Failed to fetch broadcasts', error);
      }
    };

    fetchBroadcasts();
  }, []);

  const handleApprove = async (userId: string) => {
    try {
      await api.users.updateVerification(parseInt(userId), 'verified');
      // Refresh users list
      const updatedUsers = await api.users.getAll();
      setUsers(updatedUsers);
      setApprovedIds((prev) => new Set([...prev, userId]));
    } catch (error) {
      console.error('Failed to approve user:', error);
      setFetchError('Failed to approve user. Please try again.');
    }
  };

  const handleReject = async (userId: string) => {
    try {
      // Delete the user when rejecting
      await api.users.deleteUser(parseInt(userId));
      // Refresh users list
      const updatedUsers = await api.users.getAll();
      setUsers(updatedUsers);
      setDismissedIds((prev) => new Set([...prev, userId]));
      setFetchError(null);
    } catch (error) {
      console.error('Failed to reject user:', error);
      setFetchError('Failed to reject user. Please try again.');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await api.users.deleteUser(parseInt(userId));
      // Refresh users list
      const updatedUsers = await api.users.getAll();
      setUsers(updatedUsers);
      setFetchError(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      setFetchError('Failed to delete user. Please try again.');
    }
  };

  const handleDeleteListing = async (listingId: number) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      await api.listings.delete(listingId);
      // Refresh listings
      const updatedListings = await api.listings.getAll();
      setBackendListings(updatedListings);
      setFetchError(null);
    } catch (error) {
      console.error('Failed to delete listing:', error);
      setFetchError('Failed to delete listing. Please try again.');
    }
  };

  const handleDeleteBroadcast = async (broadcastId: number) => {
    if (!confirm('Are you sure you want to delete this broadcast?')) {
      return;
    }

    try {
      await api.broadcasts.delete(broadcastId);
      // Refresh broadcasts
      const updatedBroadcasts = await api.broadcasts.getAll();
      setBroadcasts(updatedBroadcasts);
      setFetchError(null);
    } catch (error) {
      console.error('Failed to delete broadcast:', error);
      setFetchError('Failed to delete broadcast. Please try again.');
    }
  };

  const handleBroadcastChange = (field: keyof typeof broadcastForm, value: string) => {
    setBroadcastForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setBroadcastForm((prev) => ({ ...prev, imagePreview: null, imageFile: null }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setBroadcastForm((prev) => ({ ...prev, imagePreview: reader.result as string, imageFile: file }));
    };
    reader.readAsDataURL(file);
  };

  const handlePublishBroadcast = async (e: FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.cropName || !broadcastForm.price) {
      setFetchError('Please add a crop name and price before publishing.');
      return;
    }

    try {
      let imageUrl: string | undefined;
      
      // Upload image to Cloudinary if provided
      if (broadcastForm.imageFile) {
        const { uploadToCloudinary } = await import('@/lib/cloudinary');
        imageUrl = await uploadToCloudinary(broadcastForm.imageFile);
      }

      if (editingBroadcastId) {
        const updated = await api.broadcasts.update(editingBroadcastId, {
          cropName: broadcastForm.cropName,
          price: parseFloat(broadcastForm.price),
          unit: broadcastForm.unit || 'unit',
          note: broadcastForm.note,
          imageUrl: imageUrl,
        });
        setBroadcasts((prev) => prev.map((item) => (item.id === editingBroadcastId ? updated : item)));
      } else {
        const created = await api.broadcasts.create({
          cropName: broadcastForm.cropName,
          price: parseFloat(broadcastForm.price),
          unit: broadcastForm.unit || 'unit',
          note: broadcastForm.note,
          imageUrl: imageUrl,
        });
        setBroadcasts((prev) => [created, ...prev]);
      }

      setFetchError(null);
      setBroadcastForm({ cropName: '', price: '', unit: 'kg', note: '', imagePreview: null, imageFile: null });
      setEditingBroadcastId(null);
    } catch (error) {
      console.error('Failed to publish broadcast', error);
      setFetchError('Could not publish broadcast. Please try again.');
    }
  };

  const handleEditBroadcast = (broadcast: Broadcast) => {
    setEditingBroadcastId(broadcast.id);
    setBroadcastForm({
      cropName: broadcast.cropName,
      price: String(broadcast.price),
      unit: broadcast.unit || 'kg',
      note: broadcast.note || '',
      imagePreview: broadcast.imageUrl || null,
      imageFile: null,
    });
  };

  const handleCancelEdit = () => {
    setEditingBroadcastId(null);
    setBroadcastForm({ cropName: '', price: '', unit: 'kg', note: '', imagePreview: null, imageFile: null });
  };

  // Calculate statistics from real data
  const normalizeRoles = (roles: string[]) => roles.map(r => r.toLowerCase());

  const isFrontendListing = (listing: BackendListing | (typeof listings)[number]): listing is (typeof listings)[number] => {
    // Frontend listings have farmerId and farmerName, backend listings have sellerId and sellerName
    return 'farmerId' in listing && 'farmerName' in listing;
  };

  const stats = {
    totalUsers: users.length,
    farmers: users.filter(u => normalizeRoles(u.roles).includes('farmer')).length,
    buyers: users.filter(u => normalizeRoles(u.roles).includes('buyer')).length,
    transporters: users.filter(u => normalizeRoles(u.roles).includes('transporter')).length,
    cooperatives: users.filter(u => normalizeRoles(u.roles).includes('cooperative')).length,
    activeListings: backendListings.length || listings.filter((l) => l.status === 'active').length,
    pendingVerifications: users.filter(u => u.verificationStatus === 'unverified').length,
    openDisputes: 3, // Placeholder until backend provides disputes
  };

  // Verification queue from real users
  const verificationQueue = users
    .filter(u => u.verificationStatus === 'unverified')
    .filter(u => !dismissedIds.has(u.id.toString()) && !approvedIds.has(u.id.toString()))
    .slice(0, 10)
    .map(u => ({
      id: u.id.toString(),
      name: u.fullName,
      role: u.roles[0] || 'user',
      region: u.region || 'N/A',
      phone: u.phone,
      email: u.email,
      nationalId: u.nationalId,
      vehicleType: u.vehicleType,
      vehicleCapacity: u.vehicleCapacity,
      cooperativeName: u.cooperativeName,
      memberCount: u.memberCount,
      verificationStatus: u.verificationStatus,
      roles: u.roles,
      submittedAt: new Date(), // Backend doesn't return registration date yet
    }));

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'farmer':
        return <Sprout className="h-4 w-4" />;
      case 'buyer':
        return <ShoppingCart className="h-4 w-4" />;
      case 'transporter':
        return <Truck className="h-4 w-4" />;
      case 'cooperative':
        return <Building2 className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6 max-w-screen-xl space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold mb-1">Admin Dashboard</h2>
          <p className="text-muted-foreground">Platform management and oversight</p>
        </div>

        {/* Warning for fetch/auth issues */}
        {fetchError && !loading && (
          <Card className="p-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Unable to load admin data
                </h4>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {fetchError}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Top Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Users className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-5 w-5 text-primary" />
                <span className="text-xs text-muted-foreground">Active Listings</span>
              </div>
              <p className="text-2xl font-bold">{stats.activeListings}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-5 w-5 text-yellow-600" />
                <span className="text-xs text-muted-foreground">Pending</span>
              </div>
              <p className="text-2xl font-bold">{stats.pendingVerifications}</p>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                <span className="text-xs text-muted-foreground">Disputes</span>
              </div>
              <p className="text-2xl font-bold">{stats.openDisputes}</p>
            </div>
          </Card>
        </div>

        {/* User Distribution */}
        <div>
          <h3 className="text-xl font-bold mb-4">Users by Role</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Sprout className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.farmers}</p>
                  <p className="text-xs text-muted-foreground">Farmers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <ShoppingCart className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.buyers}</p>
                  <p className="text-xs text-muted-foreground">Buyers</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Truck className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.transporters}</p>
                  <p className="text-xs text-muted-foreground">Transporters</p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.cooperatives}</p>
                  <p className="text-xs text-muted-foreground">Cooperatives</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Broadcast major crop prices */}
        <div className="space-y-4" id="broadcast-feed">
          <Card className="p-5">
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spotlight</p>
              <h3 className="text-lg font-semibold">Post Major Crop Price</h3>
            </div>
            <form onSubmit={handlePublishBroadcast}>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-3">
                <div className="space-y-1 lg:col-span-2">
                  <Label htmlFor="cropName">Crop name</Label>
                  <Input
                    id="cropName"
                    placeholder="Teff, Maize, Wheat..."
                    value={broadcastForm.cropName}
                    onChange={(e) => handleBroadcastChange('cropName', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="price">Price (ETB)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="85"
                    value={broadcastForm.price}
                    onChange={(e) => handleBroadcastChange('price', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unit">Unit</Label>
                  <div className="flex gap-1">
                    {['kg', 'quintal', 'ton'].map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() => handleBroadcastChange('unit', u)}
                        className={`px-2 py-1 rounded text-xs border transition-colors ${
                          broadcastForm.unit === u
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'border-border text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 md:col-span-2">
                  <Label htmlFor="note">Note</Label>
                  <Input
                    id="note"
                    placeholder="Region, quality, etc."
                    value={broadcastForm.note}
                    onChange={(e) => handleBroadcastChange('note', e.target.value)}
                  />
                </div>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Label htmlFor="image" className="text-sm cursor-pointer text-muted-foreground hover:text-foreground">
                    + Banner image (optional)
                  </Label>
                  <Input id="image" type="file" accept="image/*" onChange={handleImageChange} className="w-auto text-xs" />
                </div>
                {broadcastForm.imagePreview && (
                  <img src={broadcastForm.imagePreview} alt="preview" className="h-10 w-16 object-cover rounded border" />
                )}
                <div className="flex gap-2 ml-auto">
                  {editingBroadcastId && (
                    <Button type="button" variant="outline" onClick={handleCancelEdit}>Cancel</Button>
                  )}
                  <Button type="submit">
                    {editingBroadcastId ? 'Update' : 'Publish'}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          <Card className="p-5 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Broadcast feed</p>
                <h3 className="text-lg font-semibold">Latest major crop prices</h3>
              </div>
              <Badge variant="secondary">{broadcasts.length} posted</Badge>
            </div>
            {broadcasts.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground border border-dashed rounded-lg">
                No broadcasts yet. Post a major crop price to highlight it for everyone.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Image</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Unit</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Note</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Posted</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {broadcasts.map((item) => (
                      <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.cropName} className="h-10 w-14 object-cover rounded-md border" />
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 font-semibold">{item.cropName}</td>
                        <td className="px-4 py-3 font-bold text-emerald-700">{item.price} ETB</td>
                        <td className="px-4 py-3">
                          <Badge variant="outline" className="text-xs">{item.unit}</Badge>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground max-w-[160px] truncate">{item.note || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs whitespace-nowrap">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8" onClick={() => handleEditBroadcast(item)}>
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              className="h-8"
                              onClick={() => handleDeleteBroadcast(item.id)}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="verifications" className="w-full" id="user-verification">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="verifications" className="text-xs sm:text-sm">Verifications</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">Listings</TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs sm:text-sm">Disputes</TabsTrigger>
          </TabsList>

          {/* Verification Queue */}
          <TabsContent value="verifications" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Pending Verifications</h3>
              <Badge variant="secondary">{verificationQueue.length} pending</Badge>
            </div>
            {loading ? (
              <Card className="p-8 text-center"><p className="text-muted-foreground">Loading...</p></Card>
            ) : verificationQueue.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">National ID</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {verificationQueue.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{user.name}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize text-xs">{user.role}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.region}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.nationalId || '—'}</td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" className="h-8" onClick={() => handleApprove(user.id)}>
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="h-8" onClick={() => handleReject(user.id)}>
                                <XCircle className="h-3 w-3 mr-1" /> Reject
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
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">All Users Verified</h4>
                <p className="text-sm text-muted-foreground">No pending verification requests</p>
              </Card>
            )}
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">All Users</h3>
              <Badge variant="secondary">{users.length} total</Badge>
            </div>
            {loading ? (
              <Card className="p-8 text-center"><p className="text-muted-foreground">Loading...</p></Card>
            ) : users.length > 0 ? (
              <Card className="overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                      <tr>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Role</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Phone</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 font-medium">{user.fullName}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className="capitalize text-xs">{user.roles[0] || '—'}</Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">{user.region || '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground">{user.phone}</td>
                          <td className="px-4 py-3">
                            <Badge
                              variant={user.verificationStatus === 'verified' ? 'default' : 'secondary'}
                              className="capitalize text-xs"
                            >
                              {user.verificationStatus}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8"
                                disabled={user.verificationStatus === 'verified'}
                                onClick={() => handleApprove(user.id.toString())}
                              >
                                <CheckCircle2 className="h-3 w-3 mr-1" /> Verify
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                className="h-8"
                                onClick={() => {
                                  if (confirm(`Delete ${user.fullName}?`)) handleDeleteUser(user.id.toString());
                                }}
                              >
                                <XCircle className="h-3 w-3 mr-1" /> Delete
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
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Users</h4>
              </Card>
            )}
          </TabsContent>

          {/* Listings */}
          <TabsContent value="listings" className="mt-4" id="all-listings">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">All Listings</h3>
              <Badge variant="secondary">{backendListings.length || listings.length} total</Badge>
            </div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Crop</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Farmer</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Region</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Price</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {(backendListings.length ? backendListings : listings)
                      .filter((l) => {
                        if (!searchQuery) return true;
                        const cropName = 'cropName' in l && l.cropName ? l.cropName : 
                                        'cropId' in l ? `Crop #${l.cropId}` : '';
                        return cropName.toLowerCase().includes(searchQuery.toLowerCase());
                      })
                      .slice(0, 20)
                      .map((listing) => {
                        // Determine if this is a backend or frontend listing
                        const isBackend = 'sellerId' in listing;
                        const cropName = isBackend 
                          ? (listing.cropName || `Crop #${listing.cropId}`)
                          : listing.cropName;
                        const farmerName = isBackend
                          ? (listing.sellerName || `Seller #${listing.sellerId}`)
                          : listing.farmerName;
                        const region = isBackend
                          ? (listing.sellerRegion || listing.location || '—')
                          : listing.farmerRegion;
                        const price = isBackend
                          ? `${listing.askingPrice} ETB${listing.unit ? `/${listing.unit}` : ''}`
                          : `${listing.pricePerUnit} ETB/${listing.unit}`;
                        const status = isBackend ? 'active' : listing.status;
                        
                        return (
                        <tr key={listing.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3 text-muted-foreground">{listing.id}</td>
                          <td className="px-4 py-3 font-medium">{cropName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{farmerName}</td>
                          <td className="px-4 py-3 text-muted-foreground">{region}</td>
                          <td className="px-4 py-3">{price}</td>
                          <td className="px-4 py-3">
                            <Badge variant={status === 'active' ? 'default' : 'secondary'} className="capitalize text-xs">
                              {status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="h-8">View</Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                className="h-8"
                                onClick={() => handleDeleteListing(typeof listing.id === 'number' ? listing.id : parseInt(String(listing.id)))}
                              >
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes" className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Disputes</h3>
              <Badge variant="secondary">0 open</Badge>
            </div>
            <Card className="overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Raised By</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Against</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reason</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                      <th className="text-left px-4 py-3 font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 text-green-600 mx-auto mb-2" />
                        No active disputes
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Analytics */}
        <div id="platform-analytics">
          <PlatformAnalytics />
        </div>
      </div>
    </DashboardLayout>
  );
}
