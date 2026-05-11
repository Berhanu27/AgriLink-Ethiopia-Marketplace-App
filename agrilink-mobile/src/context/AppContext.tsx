import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User, Listing, DeliveryRequest, TransporterPublic, Broadcast, MarketPrice, Order, OrderMessage, DeliveryMessage, Notification } from '../types';
import { api, ApiError } from '../lib/api';
import { safeDate } from '../lib/dateUtils';

interface AppContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  language: 'en' | 'am' | 'or';
  setLanguage: (lang: 'en' | 'am' | 'or') => void;
  listings: Listing[];
  transporters: TransporterPublic[];
  deliveryRequests: DeliveryRequest[];
  broadcasts: Broadcast[];
  marketPrices: MarketPrice[];
  orders: Order[];
  notifications: Notification[];
  loadListings: () => Promise<void>;
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<boolean>;
  updateListing: (listingId: string, listing: Partial<Listing>) => Promise<boolean>;
  createDeliveryRequest: (payload: {
    transporterId: string; pickupLocation: string; destination: string;
    cargoType: string; weightValue?: number; weightUnit?: string;
    preferredTime?: string; priceOffer?: number; notes?: string;
  }) => Promise<boolean>;
  updateDeliveryStatus: (id: string, status: DeliveryRequest['status'], rejectReason?: string) => Promise<void>;
  updateTransporterAvailability: (available: boolean) => Promise<boolean>;
  createOrder: (payload: {
    sellerId: string; listingId?: string; cropName: string;
    requestedQuantity: string; unit: string; offeredPrice?: number;
    buyerMessage?: string;
  }) => Promise<boolean>;
  updateOrder: (orderId: string, data: {
    status?: Order['status']; farmerResponse?: string;
    availableQuantity?: string; paymentScreenshotUrl?: string;
  }) => Promise<boolean>;
  loadOrders: () => Promise<void>;
  isOnline: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};

const normalizeStatus = (status?: string): DeliveryRequest['status'] => {
  switch ((status || '').toLowerCase()) {
    case 'accepted': return 'accepted';
    case 'in-transit': case 'in_transit': return 'in-transit';
    case 'delivered': return 'delivered';
    case 'rejected': return 'rejected';
    default: return 'pending';
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [language, setLanguage] = useState<'en' | 'am' | 'or'>('en');
  const [listings, setListings] = useState<Listing[]>([]);
  const [transporters, setTransporters] = useState<TransporterPublic[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(true);

  // Restore session on app start
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const userJson = await SecureStore.getItemAsync('agrilink_user');
        const token = await SecureStore.getItemAsync('agrilink_token');
        if (userJson && token) {
          setCurrentUser(JSON.parse(userJson));
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    void restoreSession();
  }, []);

  const loadListings = useCallback(async () => {
    try {
      const [listingRows, crops, broadcastRows] = await Promise.all([
        api.listings.getAll(),
        api.crops.getAll(),
        api.broadcasts.getAll().catch(() => []),
      ]);
      const cropById = new Map(crops.map(c => [c.id, c.name]));

      const userListings: Listing[] = listingRows.map((l, i) => ({
        id: `listing-${l.id || i}`,
        farmerId: String(l.sellerId),
        farmerName: l.sellerName || `Farmer #${l.sellerId}`,
        farmerPhone: l.sellerPhone,
        farmerRegion: l.sellerRegion || 'Not specified',
        farmerVerified: false,
        cropName: l.cropName || cropById.get(l.cropId) || 'Produce',
        quantity: l.quantity || 'N/A',
        unit: l.unit || 'kg',
        pricePerUnit: Number(l.askingPrice),
        totalPrice: Number(l.askingPrice),
        location: l.location || l.sellerRegion || 'Not specified',
        status: 'active',
        description: l.description || '',
        createdAt: new Date(), // Backend doesn't return createdAt for listings
        views: 0,
        inquiries: 0,
        imageUrl: l.imageUrl,
      }));

      const broadcastListings: Listing[] = broadcastRows.map((b, i) => ({
        id: `broadcast-${b.id || i}`,
        farmerId: 'admin',
        farmerName: 'Admin Broadcast',
        farmerRegion: 'National',
        farmerVerified: true,
        cropName: b.cropName,
        quantity: '1',
        unit: b.unit || 'unit',
        pricePerUnit: b.price,
        totalPrice: b.price,
        location: 'National',
        status: 'active',
        description: b.note || '',
        createdAt: safeDate(b.createdAt),
        views: 0,
        inquiries: 0,
        imageUrl: b.imageUrl,
      }));

      setBroadcasts(broadcastRows.map((b, i) => ({
        id: `broadcast-${b.id}-${i}`,
        cropName: b.cropName,
        price: b.price,
        unit: b.unit,
        note: b.note,
        imageUrl: b.imageUrl,
        createdAt: safeDate(b.createdAt),
      })));

      // Convert broadcasts to market prices for dashboard display
      setMarketPrices(broadcastRows.map((b, i) => ({
        id: `market-${b.id}-${i}`,
        cropName: b.cropName,
        averagePrice: b.price,
        unit: b.unit,
        region: b.note || 'National',
        market: 'Admin Broadcast',
        updatedAt: safeDate(b.createdAt),
      })));

      setListings([...broadcastListings, ...userListings]);
    } catch (e) {
      console.error('Failed to load listings', e);
    }
  }, []);

  const loadTransporters = useCallback(async () => {
    try {
      const data = await api.users.getPublicTransporters();
      setTransporters(data.map(t => ({
        id: String(t.id), fullName: t.fullName, phone: t.phone,
        region: t.region, vehicleType: t.vehicleType,
        vehicleCapacity: t.vehicleCapacity, vehicleImageUrl: t.vehicleImageUrl,
      })));
    } catch (e) {
      console.error('Failed to load transporters', e);
    }
  }, []);

  const loadDeliveryRequests = useCallback(async () => {
    if (!currentUser) return;
    try {
      let rows: Awaited<ReturnType<typeof api.deliveryRequests.listForBuyer>> = [];
      if (currentUser.role === 'buyer') rows = await api.deliveryRequests.listForBuyer();
      else if (currentUser.role === 'transporter') rows = await api.deliveryRequests.listForTransporter();
      setDeliveryRequests(rows.map(r => ({
        id: String(r.id),
        pickupLocation: r.pickupLocation,
        destination: r.destination,
        cargoType: r.cargoType,
        weightValue: r.weightValue,
        weightUnit: r.weightUnit,
        preferredTime: r.preferredTime,
        priceOffer: r.priceOffer,
        notes: r.notes,
        status: normalizeStatus(r.status),
        rejectReason: r.rejectReason,
        requesterId: String(r.buyerId),
        requesterName: r.buyerName,
        requesterPhone: r.buyerPhone,
        transporterId: String(r.transporterId),
        transporterName: r.transporterName,
        createdAt: safeDate(r.createdAt),
      })));
    } catch (e) {
      console.error('Failed to load delivery requests', e);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => { void loadListings(); }, [loadListings]);
  useEffect(() => { void loadTransporters(); }, [loadTransporters]);
  useEffect(() => { void loadDeliveryRequests(); }, [loadDeliveryRequests]);

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    try {
      let rows: Awaited<ReturnType<typeof api.orders.getForBuyer>> = [];
      if (currentUser.role === 'buyer') rows = await api.orders.getForBuyer();
      else if (currentUser.role === 'farmer' || currentUser.role === 'cooperative') rows = await api.orders.getForSeller();
      
      setOrders(rows.map(r => ({
        id: String(r.id),
        buyerId: String(r.buyerId),
        buyerName: r.buyerName,
        buyerPhone: r.buyerPhone,
        sellerId: String(r.sellerId),
        sellerName: r.sellerName,
        sellerPhone: r.sellerPhone,
        listingId: r.listingId ? String(r.listingId) : undefined,
        cropName: r.cropName,
        requestedQuantity: r.requestedQuantity,
        unit: r.unit,
        offeredPrice: r.offeredPrice,
        buyerMessage: r.buyerMessage,
        status: r.status as Order['status'],
        farmerResponse: r.farmerResponse,
        availableQuantity: r.availableQuantity,
        paymentScreenshotUrl: r.paymentScreenshotUrl,
        createdAt: safeDate(r.createdAt),
        updatedAt: safeDate(r.updatedAt),
        unreadCount: r.unreadCount,
        isNew: r.isNew,
      })));
    } catch (e) {
      console.error('Failed to load orders', e);
    }
  }, [currentUser?.id, currentUser?.role]);

  useEffect(() => { void loadOrders(); }, [loadOrders]);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.login(phone, password);
      if (!res.token) return false;
      const user: User = {
        id: String(res.userId), name: res.fullName, phone: res.phone,
        role: (res.roles[0] as User['role']) || 'farmer',
        region: '', verified: res.verificationStatus === 'verified', available: true,
      };
      // fetch full profile
      await SecureStore.setItemAsync('agrilink_token', res.token);
      try {
        const profile = await api.users.getProfile();
        user.region = profile.region || '';
        user.available = profile.available ?? true;
        user.vehicleType = profile.vehicleType;
        user.vehicleCapacity = profile.vehicleCapacity;
        user.cooperativeName = profile.cooperativeName;
        user.memberCount = profile.memberCount;
        user.nationalId = profile.nationalId;
      } catch { /* use basic user */ }
      setCurrentUser(user);
      await SecureStore.setItemAsync('agrilink_user', JSON.stringify(user));
      return true;
    } catch (e) {
      console.error('Login failed', e);
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const res = await api.auth.register({
        name: userData.name || '', phone: userData.phone || '',
        email: userData.email, password,
        role: userData.role || 'farmer', region: userData.region || '',
        nationalId: userData.nationalId, vehicleType: userData.vehicleType,
        vehicleCapacity: userData.vehicleCapacity,
        vehicleImageUrl: userData.vehicleImageUrl,
        cooperativeName: userData.cooperativeName, memberCount: userData.memberCount,
      });
      if (!res.token) return false;
      const user: User = {
        id: String(res.userId), name: res.fullName, phone: res.phone,
        email: userData.email, role: (res.roles[0] as User['role']) || userData.role || 'farmer',
        region: userData.region || '', nationalId: userData.nationalId,
        verified: res.verificationStatus === 'verified',
        vehicleType: userData.vehicleType, vehicleCapacity: userData.vehicleCapacity,
        vehicleImageUrl: userData.vehicleImageUrl,
        available: true, cooperativeName: userData.cooperativeName, memberCount: userData.memberCount,
      };
      setCurrentUser(user);
      await SecureStore.setItemAsync('agrilink_user', JSON.stringify(user));
      await SecureStore.setItemAsync('agrilink_token', res.token);
      return true;
    } catch (e) {
      console.error('Register failed', e);
      return false;
    }
  };

  const logout = async () => {
    setCurrentUser(null);
    await SecureStore.deleteItemAsync('agrilink_user');
    await SecureStore.deleteItemAsync('agrilink_token');
  };

  const addListing = async (listing: Omit<Listing, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const crops = await api.crops.getAll();
      const matched = crops.find(c => c.name.toLowerCase() === listing.cropName.trim().toLowerCase());
      await api.listings.create({
        sellerId: Number(listing.farmerId),
        cropId: matched?.id, cropName: matched ? undefined : listing.cropName.trim(),
        askingPrice: listing.pricePerUnit, imageUrl: listing.imageUrl,
        quantity: listing.quantity, unit: listing.unit,
        location: listing.location, description: listing.description,
      });
      await loadListings();
      return true;
    } catch (e) {
      console.error('Failed to add listing', e);
      return false;
    }
  };

  const updateListing = async (listingId: string, listing: Partial<Listing>): Promise<boolean> => {
    try {
      const crops = await api.crops.getAll();
      const matched = listing.cropName
        ? crops.find(c => c.name.toLowerCase() === listing.cropName!.trim().toLowerCase())
        : undefined;
      
      await api.listings.update(Number(listingId.replace('listing-', '')), {
        cropId: matched?.id,
        cropName: matched ? undefined : listing.cropName?.trim(),
        askingPrice: listing.pricePerUnit,
        imageUrl: listing.imageUrl,
        quantity: listing.quantity,
        unit: listing.unit,
        location: listing.location,
        description: listing.description,
      });
      
      await loadListings();
      return true;
    } catch (e) {
      console.error('Failed to update listing', e);
      return false;
    }
  };

  const createDeliveryRequest = async (payload: {
    transporterId: string; pickupLocation: string; destination: string;
    cargoType: string; weightValue?: number; weightUnit?: string;
    preferredTime?: string; priceOffer?: number; notes?: string;
  }): Promise<boolean> => {
    try {
      await api.deliveryRequests.create({
        transporterId: Number(payload.transporterId),
        pickupLocation: payload.pickupLocation, destination: payload.destination,
        cargoType: payload.cargoType, weightValue: payload.weightValue,
        weightUnit: payload.weightUnit, preferredTime: payload.preferredTime,
        priceOffer: payload.priceOffer, notes: payload.notes,
      });
      await loadDeliveryRequests();
      return true;
    } catch (e) {
      console.error('Failed to create delivery request', e);
      return false;
    }
  };

  const updateDeliveryStatus = async (id: string, status: DeliveryRequest['status'], rejectReason?: string) => {
    try {
      await api.deliveryRequests.updateStatus(Number(id), { status, rejectReason });
      await loadDeliveryRequests();
    } catch (e) {
      console.error('Failed to update delivery status', e);
    }
  };

  const updateTransporterAvailability = async (available: boolean): Promise<boolean> => {
    try {
      await api.users.updateAvailability(available);
      if (currentUser) {
        const updated = { ...currentUser, available };
        setCurrentUser(updated);
        await SecureStore.setItemAsync('agrilink_user', JSON.stringify(updated));
      }
      return true;
    } catch (e) {
      console.error('Failed to update availability', e);
      return false;
    }
  };

  const createOrder = async (payload: {
    sellerId: string; listingId?: string; cropName: string;
    requestedQuantity: string; unit: string; offeredPrice?: number;
    buyerMessage?: string;
  }): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'buyer') return false;
    
    try {
      const created = await api.orders.create({
        sellerId: Number(payload.sellerId),
        listingId: payload.listingId ? Number(payload.listingId.replace('listing-', '')) : undefined,
        cropName: payload.cropName,
        requestedQuantity: payload.requestedQuantity,
        unit: payload.unit,
        offeredPrice: payload.offeredPrice,
        buyerMessage: payload.buyerMessage,
      });
      
      await loadOrders();
      return true;
    } catch (e) {
      console.error('Failed to create order', e);
      return false;
    }
  };

  const updateOrder = async (orderId: string, data: {
    status?: Order['status']; farmerResponse?: string;
    availableQuantity?: string; paymentScreenshotUrl?: string;
  }): Promise<boolean> => {
    try {
      await api.orders.update(Number(orderId), data);
      await loadOrders();
      return true;
    } catch (e) {
      console.error('Failed to update order', e);
      return false;
    }
  };

  return (
    <AppContext.Provider value={{
      currentUser, isAuthenticated: !!currentUser, isLoading,
      login, register, logout, language, setLanguage,
      listings, transporters, deliveryRequests, broadcasts, marketPrices,
      orders, notifications,
      loadListings, addListing, updateListing, createDeliveryRequest,
      updateDeliveryStatus, updateTransporterAvailability,
      createOrder, updateOrder, loadOrders, isOnline,
    }}>
      {children}
    </AppContext.Provider>
  );
}
