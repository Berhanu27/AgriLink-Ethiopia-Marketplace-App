"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useSyncExternalStore, useCallback } from "react";
import { User, Listing, MarketPrice, Message, DeliveryRequest, Notification, TransporterPublic } from "@/types";
import { api, ApiError } from "@/lib/api";

interface AppContextType {
  // Auth
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (phone: string, password: string) => Promise<boolean>;
  register: (userData: Partial<User>, password: string) => Promise<boolean>;
  logout: () => void;
  
  // Language
  language: 'en' | 'am' | 'or';
  setLanguage: (lang: 'en' | 'am' | 'or') => void;
  
  // Data
  listings: Listing[];
  marketPrices: MarketPrice[];
  transporters: TransporterPublic[];
  messages: Message[];
  deliveryRequests: DeliveryRequest[];
  notifications: Notification[];
  
  // Actions
  addListing: (listing: Omit<Listing, 'id' | 'createdAt'>) => Promise<boolean>;
  updateListing: (listingId: string, listing: Partial<Listing>) => Promise<boolean>;
  updateListingStatus: (id: string, status: 'active' | 'sold' | 'expired') => void;
  sendMessage: (receiverId: string, content: string, listingId?: string) => void;
  markNotificationAsRead: (id: string) => void;
  createDeliveryRequest: (payload: {
    transporterId: string;
    pickupLocation: string;
    destination: string;
    cargoType: string;
    weightValue?: number;
    weightUnit?: string;
    preferredTime?: string;
    priceOffer?: number;
    notes?: string;
  }) => Promise<boolean>;
  updateDeliveryStatus: (id: string, status: DeliveryRequest['status']) => void;
  updateTransporterAvailability: (available: boolean) => Promise<boolean>;
  
  // Online status
  isOnline: boolean;
  
  // Hydration status
  isHydrated: boolean;
}

const AppContext = createContext<AppContextType | null>(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

const mockMarketPrices: MarketPrice[] = [];

type DeliveryRequestRow = {
  id: number;
  buyerId: number;
  buyerName?: string;
  buyerPhone?: string;
  transporterId: number;
  transporterName?: string;
  pickupLocation: string;
  destination: string;
  cargoType: string;
  weightValue?: number;
  weightUnit?: string;
  preferredTime?: string;
  priceOffer?: number;
  notes?: string;
  status: string;
  rejectReason?: string;
  createdAt: string;
};

const normalizeDeliveryStatus = (status?: string): DeliveryRequest['status'] => {
  switch ((status || '').toLowerCase()) {
    case 'pending':
      return 'pending';
    case 'accepted':
      return 'accepted';
    case 'in-transit':
    case 'in_transit':
      return 'in-transit';
    case 'delivered':
      return 'delivered';
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
};

const mapDeliveryRequest = (row: DeliveryRequestRow): DeliveryRequest => ({
  id: String(row.id),
  pickupLocation: row.pickupLocation,
  destination: row.destination,
  cargoType: row.cargoType,
  weightValue: row.weightValue,
  weightUnit: row.weightUnit,
  preferredTime: row.preferredTime,
  priceOffer: row.priceOffer,
  notes: row.notes,
  status: normalizeDeliveryStatus(row.status),
  rejectReason: row.rejectReason,
  requesterId: String(row.buyerId),
  requesterName: row.buyerName,
  requesterPhone: row.buyerPhone,
  transporterId: String(row.transporterId),
  transporterName: row.transporterName,
  createdAt: new Date(row.createdAt),
});

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') {
      return null;
    }

    const savedUser = localStorage.getItem('agrilink_user');
    if (!savedUser) {
      return null;
    }

    try {
      return JSON.parse(savedUser) as User;
    } catch {
      localStorage.removeItem('agrilink_user');
      localStorage.removeItem('agrilink_token');
      return null;
    }
  });
  const [language, setLanguage] = useState<'en' | 'am' | 'or'>(() => {
    if (typeof window === 'undefined') {
      return 'en';
    }

    const savedLanguage = localStorage.getItem('agrilink_language');
    return savedLanguage === 'am' || savedLanguage === 'or' ? savedLanguage : 'en';
  });
  const [listings, setListings] = useState<Listing[]>([]);
  const [marketPrices] = useState<MarketPrice[]>(mockMarketPrices);
  const [transporters, setTransporters] = useState<TransporterPublic[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOnline, setIsOnline] = useState(true);
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const clearSession = () => {
    setCurrentUser(null);
    localStorage.removeItem('agrilink_user');
    localStorage.removeItem('agrilink_token');
  };

  const loadMarketplaceListings = async () => {
    try {
      const [listingRows, crops, broadcasts] = await Promise.all([
        api.listings.getAll(),
        api.crops.getAll(),
        api.broadcasts.getAll().catch(() => []),
      ]);

      const cropById = new Map(crops.map((crop) => [crop.id, crop.name]));

      const userListings: Listing[] = listingRows.map((listing, index) => {
        const sellerId = String(listing.sellerId ?? '');
        const sellerRegion = listing.sellerRegion || currentUser?.region || 'Not specified';

        return {
          id: `listing-${listing.id || index}`,
          farmerId: sellerId,
          farmerName: listing.sellerName || `Farmer #${listing.sellerId}`,
          farmerPhone: listing.sellerPhone,
          farmerRegion: sellerRegion,
          farmerZone: sellerRegion,
          farmerSpecificLocation: sellerRegion,
          farmerVerified: currentUser ? currentUser.verified : false,
          cropName: listing.cropName || cropById.get(listing.cropId) || 'Produce',
          quantity: listing.quantity || 'N/A',
          unit: listing.unit || 'kg',
          pricePerUnit: Number(listing.askingPrice),
          totalPrice: Number(listing.askingPrice),
          location: listing.location || sellerRegion,
          status: 'active',
          description: listing.description || '',
          createdAt: new Date(),
          views: 0,
          inquiries: 0,
          imageUrl: listing.imageUrl,
        };
      });

      const broadcastListings: Listing[] = broadcasts.map((broadcast, index) => ({
        id: `broadcast-${broadcast.id || index}`,
        farmerId: 'admin',
        farmerName: 'Admin Broadcast',
        farmerPhone: undefined,
        farmerRegion: 'National',
        farmerZone: 'National',
        farmerSpecificLocation: 'National',
        farmerVerified: true,
        cropName: broadcast.cropName,
        quantity: '1',
        unit: broadcast.unit || 'unit',
        pricePerUnit: broadcast.price,
        totalPrice: broadcast.price,
        location: 'National',
        status: 'active' as const,
        description: broadcast.note || '',
        createdAt: new Date(broadcast.createdAt),
        views: 0,
        inquiries: 0,
        imageUrl: broadcast.imageUrl || undefined,
      }));

      // Keep admin broadcasts at the top, then farmer listings under them.
      setListings([...broadcastListings, ...userListings]);
    } catch (error) {
      console.error('Failed to fetch marketplace listings:', error);
      setListings([]);
    }
  };

  // Refresh user verification status every 10 seconds if authenticated
  useEffect(() => {
    if (!isHydrated || !currentUser) return;

    const refreshUserProfile = async () => {
      try {
        const token = localStorage.getItem('agrilink_token');
        if (!token) {
          clearSession();
          return;
        }
        
        const profile = await api.users.getProfile({ silent: true });
        
        // Update only when verification status changes to avoid effect churn
        setCurrentUser(prev => {
          if (!prev) return null;
          const verified = profile.verificationStatus === 'verified';
          const available = profile.available;
          if (prev.verified === verified && (available === undefined || prev.available === available)) {
            return prev;
          }

          const updatedUser = {
            ...prev,
            verified,
            available: available ?? prev.available,
          };

          localStorage.setItem('agrilink_user', JSON.stringify(updatedUser));
          return updatedUser;
        });
      } catch (error) {
        if (error instanceof ApiError && (error.status === 401 || error.status === 403)) {
          clearSession();
        }
      }
    };

    void refreshUserProfile();

    const interval = setInterval(refreshUserProfile, 10000);
    return () => clearInterval(interval);
  }, [isHydrated, currentUser?.id]);

  // Fetch listings from API
  useEffect(() => {
    if (!isHydrated) return;
    void loadMarketplaceListings();
  }, [isHydrated, currentUser?.id, currentUser?.verified, currentUser?.name, currentUser?.region]);

  useEffect(() => {
    if (!isHydrated) return;
    const loadTransporters = async () => {
      try {
        const data = await api.users.getPublicTransporters();
        setTransporters(data.map((t) => ({
          id: String(t.id),
          fullName: t.fullName,
          phone: t.phone,
          region: t.region,
          vehicleType: t.vehicleType,
          vehicleCapacity: t.vehicleCapacity,
          vehicleImageUrl: t.vehicleImageUrl,
        })));
      } catch (error) {
        console.error('Failed to fetch transporters:', error);
        setTransporters([]);
      }
    };

    void loadTransporters();
  }, [isHydrated]);

  const loadDeliveryRequests = useCallback(async () => {
    if (!isHydrated || !currentUser) {
      setDeliveryRequests([]);
      return;
    }

    try {
      if (currentUser.role === 'transporter') {
        const rows = await api.deliveryRequests.listForTransporter();
        setDeliveryRequests(rows.map(mapDeliveryRequest));
        return;
      }

      if (currentUser.role === 'buyer') {
        const rows = await api.deliveryRequests.listForBuyer();
        setDeliveryRequests(rows.map(mapDeliveryRequest));
        return;
      }

      setDeliveryRequests([]);
    } catch (error) {
      console.error('Failed to fetch delivery requests:', error);
      setDeliveryRequests([]);
    }
  }, [isHydrated, currentUser?.id, currentUser?.role]);

  useEffect(() => {
    void loadDeliveryRequests();
  }, [loadDeliveryRequests]);

  useEffect(() => {
    // Check online status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem('agrilink_language', language);
    document.documentElement.lang = language;
  }, [language, isHydrated]);

  const login = async (phone: string, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.login(phone, password);
      const { token, userId, fullName, phone: userPhone, roles, verificationStatus } = response;
      const role = (roles[0] as User['role'] | undefined) ?? 'farmer';
      
      const user: User = {
        id: userId.toString(),
        name: fullName,
        phone: userPhone,
        role,
        region: '',
        verified: verificationStatus === 'verified',
        available: true,
      };
      
      setCurrentUser(user);
      localStorage.setItem('agrilink_user', JSON.stringify(user));
      localStorage.setItem('agrilink_token', token);

      try {
        const profile = await api.users.getProfile({ silent: true });
        const nextUser = {
          ...user,
          available: profile.available ?? user.available,
        };
        setCurrentUser(nextUser);
        localStorage.setItem('agrilink_user', JSON.stringify(nextUser));
      } catch (error) {
        console.error('Failed to refresh user profile after login:', error);
      }

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (userData: Partial<User>, password: string): Promise<boolean> => {
    try {
      const response = await api.auth.register({
        name: userData.name || '',
        phone: userData.phone || '',
        email: userData.email,
        password,
        role: userData.role || 'farmer',
        region: userData.region || '',
        nationalId: userData.nationalId,
        vehicleType: userData.vehicleType,
        vehicleCapacity: userData.vehicleCapacity,
        cooperativeName: userData.cooperativeName,
        memberCount: userData.memberCount,
      });
      
      const { token, userId, fullName, phone: userPhone, roles, verificationStatus } = response;
      const role = ((roles[0] as User['role'] | undefined) ?? userData.role) || 'farmer';
      const user: User = {
        id: userId.toString(),
        name: fullName,
        phone: userPhone,
        email: userData.email,
        role,
        region: userData.region || '',
        nationalId: userData.nationalId,
        verified: verificationStatus === 'verified',
        vehicleType: userData.vehicleType,
        vehicleCapacity: userData.vehicleCapacity,
        vehicleImageUrl: userData.vehicleImageUrl,
        available: true,
        cooperativeName: userData.cooperativeName,
        memberCount: userData.memberCount,
      };
      
      setCurrentUser(user);
      localStorage.setItem('agrilink_user', JSON.stringify(user));
      localStorage.setItem('agrilink_token', token);
      return true;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = () => {
    clearSession();
  };

  const addListing = async (listing: Omit<Listing, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const crops = await api.crops.getAll();
      const normalizedCropName = listing.cropName.trim().toLowerCase();
      const matchedCrop = crops.find((crop) => crop.name.trim().toLowerCase() === normalizedCropName);

      const sellerId = Number.parseInt(listing.farmerId, 10);
      if (Number.isNaN(sellerId)) {
        throw new Error('Invalid seller id. Please login again and retry.');
      }

      await api.listings.create({
        sellerId,
        cropId: matchedCrop?.id,
        cropName: matchedCrop ? undefined : listing.cropName.trim(),
        askingPrice: listing.pricePerUnit,
        imageUrl: listing.imageUrl,
        quantity: listing.quantity,
        unit: listing.unit,
        location: listing.location,
        description: listing.description,
      });
      
      // Refresh listings after creation
      await loadMarketplaceListings();
      return true;
    } catch (error) {
      console.error('Failed to create listing:', error);
      return false;
    }
  };

  const updateListing = async (listingId: string, listing: Partial<Listing>): Promise<boolean> => {
    try {
      const crops = await api.crops.getAll();
      const normalizedCropName = listing.cropName?.trim().toLowerCase();
      const matchedCrop = normalizedCropName
        ? crops.find((crop) => crop.name.trim().toLowerCase() === normalizedCropName)
        : undefined;

      await api.listings.update(Number(listingId.replace('listing-', '')), {
        cropId: matchedCrop?.id,
        cropName: matchedCrop ? undefined : listing.cropName?.trim(),
        askingPrice: listing.pricePerUnit,
        imageUrl: listing.imageUrl,
        quantity: listing.quantity,
        unit: listing.unit,
        location: listing.location,
        description: listing.description,
      });

      await loadMarketplaceListings();
      return true;
    } catch (error) {
      console.error('Failed to update listing:', error);
      return false;
    }
  };

  const updateListingStatus = (id: string, status: 'active' | 'sold' | 'expired') => {
    setListings(listings.map((l) => (l.id === id ? { ...l, status } : l)));
  };

  const sendMessage = (receiverId: string, content: string, listingId?: string) => {
    if (!currentUser) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      receiverId,
      content,
      timestamp: new Date(),
      read: false,
      listingId,
    };
    
    setMessages([...messages, newMessage]);
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const createDeliveryRequest = async (payload: {
    transporterId: string;
    pickupLocation: string;
    destination: string;
    cargoType: string;
    weightValue?: number;
    weightUnit?: string;
    preferredTime?: string;
    priceOffer?: number;
    notes?: string;
  }): Promise<boolean> => {
    if (!currentUser || currentUser.role !== 'buyer') {
      return false;
    }

    const transporterId = Number(payload.transporterId);
    if (Number.isNaN(transporterId)) {
      return false;
    }

    try {
      const created = await api.deliveryRequests.create({
        transporterId,
        pickupLocation: payload.pickupLocation,
        destination: payload.destination,
        cargoType: payload.cargoType,
        weightValue: payload.weightValue,
        weightUnit: payload.weightUnit,
        preferredTime: payload.preferredTime,
        priceOffer: payload.priceOffer,
        notes: payload.notes,
      });

      setDeliveryRequests((prev) => [mapDeliveryRequest(created), ...prev]);
      return true;
    } catch (error) {
      console.error('Failed to create delivery request:', error);
      return false;
    }
  };

  const updateDeliveryStatus = (id: string, status: DeliveryRequest['status']) => {
    setDeliveryRequests((prev) => prev.map((d) => (d.id === id ? { ...d, status } : d)));

    const requestId = Number(id);
    if (Number.isNaN(requestId)) {
      return;
    }

    void (async () => {
      try {
        const updated = await api.deliveryRequests.updateStatus(requestId, { status });
        const mapped = mapDeliveryRequest(updated);
        setDeliveryRequests((prev) => prev.map((d) => (d.id === id ? mapped : d)));
      } catch (error) {
        console.error('Failed to update delivery status:', error);
      }
    })();
  };

  const updateTransporterAvailability = async (available: boolean): Promise<boolean> => {
    if (!currentUser) return false;

    try {
      const updated = await api.users.updateAvailability(available);
      const nextUser = {
        ...currentUser,
        available: updated.available ?? available,
      };
      setCurrentUser(nextUser);
      localStorage.setItem('agrilink_user', JSON.stringify(nextUser));
      return true;
    } catch (error) {
      console.error('Failed to update availability:', error);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        isAuthenticated: !!currentUser,
        login,
        register,
        logout,
        language,
        setLanguage,
        listings,
        marketPrices,
        transporters,
        messages,
        deliveryRequests,
        notifications,
        addListing,
        updateListing,
        updateListingStatus,
        sendMessage,
        markNotificationAsRead,
        createDeliveryRequest,
        updateDeliveryStatus,
        updateTransporterAvailability,
        isOnline,
        isHydrated,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}
