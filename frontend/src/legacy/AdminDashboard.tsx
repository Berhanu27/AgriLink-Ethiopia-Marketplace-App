"use client";

import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { useApp } from "@/context/AppContext";
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
  cropId: number;
  askingPrice: number;
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
    return 'cropName' in listing;
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          <Card className="relative overflow-hidden p-6 lg:col-span-1 rounded-2xl border-border bg-card shadow-sm">
            <div className="relative space-y-1 mb-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Spotlight</p>
              <h3 className="text-2xl font-semibold">Post Major Crop Price</h3>
              <p className="text-sm text-muted-foreground">Share a marquee price with an image banner so all users can see it on their dashboard.</p>
              <div className="flex flex-wrap gap-2 pt-2">
                {['High visibility', 'Admin verified', 'Home spotlight'].map((pill) => (
                  <Badge key={pill} variant="secondary">
                    {pill}
                  </Badge>
                ))}
              </div>
            </div>
            <form className="relative space-y-4" onSubmit={handlePublishBroadcast}>
              <div className="space-y-1">
                <Label htmlFor="cropName">Crop name</Label>
                <Input
                  id="cropName"
                  placeholder="Teff, Maize, Wheat..."
                  value={broadcastForm.cropName}
                  onChange={(e) => handleBroadcastChange('cropName', e.target.value)}
                  className="bg-card"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="85"
                    value={broadcastForm.price}
                    onChange={(e) => handleBroadcastChange('price', e.target.value)}
                    className="bg-card"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="unit">Unit</Label>
                  <div className="flex gap-2">
                    <Input
                      id="unit"
                      className="flex-1"
                      placeholder="kg"
                      value={broadcastForm.unit}
                      onChange={(e) => handleBroadcastChange('unit', e.target.value)}
                    />
                    <div className="flex gap-1">
                      {['kg', 'quintal', 'ton'].map((u) => (
                        <Badge
                          key={u}
                          variant={broadcastForm.unit === u ? 'default' : 'outline'}
                          className="cursor-pointer"
                          onClick={() => handleBroadcastChange('unit', u)}
                        >
                          {u}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="note">Details / note</Label>
                <Textarea
                  id="note"
                  placeholder="Region, quality, harvest date, moisture, etc."
                  value={broadcastForm.note}
                  onChange={(e) => handleBroadcastChange('note', e.target.value)}
                  className="min-h-24 bg-card"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="image">Banner image (optional)</Label>
                <Input
                  id="image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="bg-card"
                />
                {broadcastForm.imagePreview && (
                  <div className="mt-2 overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                    <img
                      src={broadcastForm.imagePreview}
                      alt="Broadcast preview"
                      className="h-32 w-full object-cover"
                    />
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                {editingBroadcastId && (
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCancelEdit}>
                    Cancel edit
                  </Button>
                )}
                <Button type="submit" className="flex-1">
                  {editingBroadcastId ? 'Update broadcast' : 'Publish to dashboard'}
                </Button>
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
              <Card className="p-6 text-center border-dashed">
                <p className="text-sm text-muted-foreground">No broadcasts yet. Post a major crop price to highlight it for everyone.</p>
              </Card>
            ) : (
              <div className="space-y-3">
                {broadcasts.map((item) => (
                  <Card key={item.id} className="p-4 bg-muted/40">
                    <div className="flex flex-col md:flex-row gap-4">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.cropName}
                          className="h-32 w-full md:w-44 object-cover rounded-md border shadow-sm"
                        />
                      )}
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-base">{item.cropName}</h4>
                          <Badge variant="outline" className="capitalize">{item.unit}</Badge>
                        </div>
                        <p className="text-2xl font-bold text-emerald-700">{item.price} ETB/{item.unit || 'unit'}</p>
                        {item.note && <p className="text-sm text-muted-foreground leading-relaxed">{item.note}</p>}
                        <p className="text-xs text-muted-foreground">{new Date(item.createdAt).toLocaleString()}</p>
                        <div>
                          <Button size="sm" variant="outline" onClick={() => handleEditBroadcast(item)}>
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Management Tabs */}
        <Tabs defaultValue="verifications" className="w-full">
          <TabsList className="w-full grid grid-cols-4 h-auto">
            <TabsTrigger value="verifications" className="text-xs sm:text-sm">Verifications</TabsTrigger>
            <TabsTrigger value="users" className="text-xs sm:text-sm">Users</TabsTrigger>
            <TabsTrigger value="listings" className="text-xs sm:text-sm">Listings</TabsTrigger>
            <TabsTrigger value="disputes" className="text-xs sm:text-sm">Disputes</TabsTrigger>
          </TabsList>

          {/* Verification Queue */}
          <TabsContent value="verifications" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Pending Verifications</h3>
              <Badge variant="secondary">{verificationQueue.length} pending</Badge>
            </div>

            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading users...</p>
              </Card>
            ) : verificationQueue.length > 0 ? (
              verificationQueue.map((user) => (
                <Card key={user.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getRoleIcon(user.role)}
                          <h4 className="font-semibold">{user.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          {user.role} • {user.region}
                        </p>
                        <p className="text-sm text-muted-foreground capitalize mb-1">
                          Status: {user.verificationStatus}
                        </p>
                        <p className="text-sm text-muted-foreground break-all">{user.phone}</p>
                        {user.email && (
                          <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                        )}
                        {user.nationalId && (
                          <p className="text-sm text-muted-foreground break-all">National ID: {user.nationalId}</p>
                        )}
                        {user.cooperativeName && (
                          <p className="text-sm text-muted-foreground break-all">Cooperative: {user.cooperativeName}</p>
                        )}
                        {user.memberCount !== undefined && user.memberCount !== null && (
                          <p className="text-sm text-muted-foreground break-all">Members: {user.memberCount}</p>
                        )}
                        {user.vehicleType && (
                          <p className="text-sm text-muted-foreground break-all">Vehicle: {user.vehicleType}</p>
                        )}
                        {user.vehicleCapacity && (
                          <p className="text-sm text-muted-foreground break-all">Capacity: {user.vehicleCapacity}</p>
                        )}
                        {user.roles?.length ? (
                          <div className="flex flex-wrap gap-2 mt-2">
                            {user.roles.map((r) => (
                              <Badge key={r} variant="outline" className="text-xs capitalize">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                      <Badge variant="outline" className="text-xs whitespace-nowrap">
                        <Clock className="h-3 w-3 mr-1" />
                        {Math.floor(
                          (now - user.submittedAt.getTime()) / (1000 * 60 * 60 * 24)
                        )}{' '}
                        days
                      </Badge>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button className="flex-1 min-h-[44px]" onClick={() => handleApprove(user.id)}>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        className="flex-1 min-h-[44px]"
                        onClick={() => handleReject(user.id)}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center">
                <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h4 className="font-semibold mb-2">All Users Verified</h4>
                <p className="text-sm text-muted-foreground">
                  No pending verification requests
                </p>
              </Card>
            )}
          </TabsContent>

          {/* Users Management */}
          <TabsContent value="users" className="space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">All Users</h3>
              <Badge variant="secondary">{users.length} total</Badge>
            </div>

            {loading ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">Loading users...</p>
              </Card>
            ) : users.length > 0 ? (
              <div className="space-y-3">
                {users.map((user) => (
                  <Card key={user.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            {getRoleIcon(user.roles[0] || 'user')}
                            <h4 className="font-semibold">{user.fullName}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground capitalize mb-1">
                            {user.roles.join(', ')} • {user.region || 'N/A'}
                          </p>
                          <p className="text-sm text-muted-foreground break-all">{user.phone}</p>
                          {user.email && (
                            <p className="text-sm text-muted-foreground break-all">{user.email}</p>
                          )}
                          {user.nationalId && (
                            <p className="text-sm text-muted-foreground break-all">National ID: {user.nationalId}</p>
                          )}
                          {user.cooperativeName && (
                            <p className="text-sm text-muted-foreground break-all">Cooperative: {user.cooperativeName}</p>
                          )}
                          {user.memberCount !== undefined && user.memberCount !== null && (
                            <p className="text-sm text-muted-foreground break-all">Members: {user.memberCount}</p>
                          )}
                          {user.vehicleType && (
                            <p className="text-sm text-muted-foreground break-all">Vehicle: {user.vehicleType}</p>
                          )}
                          {user.vehicleCapacity && (
                            <p className="text-sm text-muted-foreground break-all">Capacity: {user.vehicleCapacity}</p>
                          )}
                          <div className="flex flex-wrap gap-2 mt-2">
                            <Badge variant="outline" className="text-xs capitalize">
                              {user.verificationStatus}
                            </Badge>
                            {user.roles.map((r) => (
                              <Badge key={r} variant="outline" className="text-xs capitalize">
                                {r}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => handleApprove(user.id.toString())}
                          disabled={user.verificationStatus === 'verified'}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Verify
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="flex-1"
                          onClick={() => {
                            if (confirm(`Delete user ${user.fullName}? This action cannot be undone.`)) {
                              handleDeleteUser(user.id.toString());
                            }
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h4 className="font-semibold mb-2">No Users</h4>
                <p className="text-sm text-muted-foreground">
                  No users registered yet
                </p>
              </Card>
            )}
          </TabsContent>
          <TabsContent value="listings" className="space-y-3 mt-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[44px]"
              />
            </div>

            {(backendListings.length ? backendListings.slice(0, 5) : listings.slice(0, 5)).map((listing) => (
              <Card key={`listing-${listing.id}`} className="p-4">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      {isFrontendListing(listing) ? (
                        <>
                          <h4 className="font-semibold mb-1 break-words">{listing.cropName}</h4>
                          <p className="text-sm text-muted-foreground mb-1 break-words">
                            By {listing.farmerName} • {listing.farmerRegion}
                          </p>
                          <p className="text-sm break-words">
                            {listing.quantity} {listing.unit} @ {listing.pricePerUnit} ETB/{listing.unit}
                          </p>
                        </>
                      ) : (
                        <>
                          <h4 className="font-semibold mb-1 break-words">Listing #{listing.id}</h4>
                          <p className="text-sm text-muted-foreground mb-1 break-words">
                            Seller ID: {listing.sellerId} • Crop ID: {listing.cropId}
                          </p>
                          <p className="text-sm break-words">Asking price: {listing.askingPrice} ETB</p>
                        </>
                      )}
                    </div>
                    {isFrontendListing(listing) ? (
                      <Badge
                        variant={listing.status === 'active' ? 'default' : 'secondary'}
                        className="capitalize whitespace-nowrap"
                      >
                        {listing.status}
                      </Badge>
                    ) : null}
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      Contact Farmer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </TabsContent>

          {/* Disputes */}
          <TabsContent value="disputes" className="space-y-3 mt-4">
            <Card className="p-8 text-center">
              <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
              <h4 className="font-semibold mb-2">No Active Disputes</h4>
              <p className="text-sm text-muted-foreground">
                All disputes have been resolved
              </p>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Analytics Preview */}
        <div>
          <h3 className="text-xl font-bold mb-4">Platform Analytics</h3>
          <Card className="p-6">
            <div className="flex flex-col items-center justify-center py-8">
              <BarChart3 className="h-16 w-16 text-muted-foreground mb-3" />
              <h4 className="font-semibold mb-2">Analytics Dashboard</h4>
              <p className="text-sm text-muted-foreground text-center mb-4">
                View detailed insights on listings per region, match success rates, and more
              </p>
              <Button>View Full Analytics</Button>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
