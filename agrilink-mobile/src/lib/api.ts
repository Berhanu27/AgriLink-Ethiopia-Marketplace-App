import * as SecureStore from 'expo-secure-store';

// For USB cable (physical device): 192.168.137.1 is your PC's USB/hotspot adapter IP
// Change this if your network setup changes (run `ipconfig` to verify)
// You can also set this in your environment or app.json
import Constants from 'expo-constants';

const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://192.168.137.1:8080/api';

// Debug: Log the API URL being used
console.log('🔗 AgriLink API URL:', API_URL);
console.log('📱 Using Expo Config:', Constants.expoConfig?.extra);

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function getToken(): Promise<string | null> {
  try {
    const token = await SecureStore.getItemAsync('agrilink_token');
    if (!token || token === 'null' || token === 'undefined' || token.trim() === '') return null;
    return token;
  } catch {
    return null;
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const fullUrl = `${API_URL}${endpoint}`;
  console.log(`📡 API Request: ${options.method || 'GET'} ${fullUrl}`);

  try {
    const response = await fetch(fullUrl, { ...options, headers });
    console.log(`✅ API Response: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      let errorMessage = `Request failed (${response.status})`;
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
      } catch {
        const text = await response.text();
        if (text) errorMessage = text;
      }
      console.error(`❌ API Error: ${errorMessage}`);
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) return undefined as T;
    const text = await response.text();
    if (!text) return undefined as T;
    return JSON.parse(text) as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    console.error(`❌ Network Error: ${error}`);
    console.error(`🔗 Failed URL: ${fullUrl}`);
    console.error(`💡 Check: 1) Backend running? 2) Correct IP in app.json? 3) Same network?`);
    throw new ApiError(0, 'Network error - check your connection');
  }
}

export const api = {
  auth: {
    login: (phone: string, password: string) =>
      fetchApi<{ userId: number; fullName: string; phone: string; roles: string[]; token: string; verificationStatus: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      }),

    register: (data: {
      name: string; phone: string; email?: string; password: string;
      role: string; region: string; nationalId?: string;
      vehicleType?: string; vehicleCapacity?: string;
      cooperativeName?: string; memberCount?: number; vehicleImageUrl?: string;
    }) => {
      const payload: Record<string, unknown> = {
        fullName: data.name, phone: data.phone,
        email: data.email || '', password: data.password,
      };
      if (data.nationalId) payload.nationalId = data.nationalId;
      if (data.role) payload.role = data.role;
      if (data.region) payload.region = data.region;
      if (data.vehicleType) payload.vehicleType = data.vehicleType;
      if (data.vehicleCapacity) payload.vehicleCapacity = data.vehicleCapacity;
      if (data.vehicleImageUrl) payload.vehicleImageUrl = data.vehicleImageUrl;
      if (data.cooperativeName) payload.cooperativeName = data.cooperativeName;
      if (data.memberCount !== undefined) payload.memberCount = data.memberCount;
      return fetchApi<{ userId: number; fullName: string; phone: string; roles: string[]; token: string; verificationStatus: string }>('/auth/register', {
        method: 'POST', body: JSON.stringify(payload),
      });
    },
  },

  users: {
    getProfile: () => fetchApi<{
      id: number; fullName: string; phone: string; email: string;
      nationalId?: string; region?: string; vehicleType?: string;
      vehicleCapacity?: string; vehicleImageUrl?: string; available?: boolean;
      cooperativeName?: string; memberCount?: number;
      verificationStatus: string; roles: string[];
    }>('/users/profile'),

    getAll: () => fetchApi<Array<{
      id: number; fullName: string; phone: string; email: string;
      nationalId?: string; region?: string; vehicleType?: string;
      vehicleCapacity?: string; vehicleImageUrl?: string;
      cooperativeName?: string; memberCount?: number;
      verificationStatus: string; roles: string[];
    }>>('/users'),

    updateVerification: (userId: number, verificationStatus: string) =>
      fetchApi<{ id: number; verificationStatus: string }>(`/users/${userId}/verification`, {
        method: 'PATCH', body: JSON.stringify({ verificationStatus }),
      }),

    deleteUser: (userId: number) =>
      fetchApi<void>(`/users/${userId}`, { method: 'DELETE' }),

    updateAvailability: (available: boolean) =>
      fetchApi<{ id: number; available?: boolean }>('/users/profile/availability', {
        method: 'PATCH', body: JSON.stringify({ available }),
      }),

    getPublicTransporters: () => fetchApi<Array<{
      id: number; fullName: string; phone: string; region?: string;
      vehicleType?: string; vehicleCapacity?: string; vehicleImageUrl?: string;
    }>>('/users/transporters/public'),
  },

  listings: {
    getAll: () => fetchApi<Array<{
      id: number; sellerId: number; sellerName?: string; sellerPhone?: string;
      sellerRegion?: string; cropId: number; cropName?: string;
      askingPrice: number; imageUrl?: string; quantity?: string;
      unit?: string; location?: string; description?: string;
    }>>('/listings'),

    create: (data: {
      sellerId: number; cropId?: number; cropName?: string;
      askingPrice: number; imageUrl?: string; quantity?: string;
      unit?: string; location?: string; description?: string;
    }) => fetchApi('/listings', { method: 'POST', body: JSON.stringify(data) }),

    update: (listingId: number, data: {
      cropId?: number; cropName?: string; askingPrice?: number;
      imageUrl?: string; quantity?: string; unit?: string;
      location?: string; description?: string;
    }) => fetchApi(`/listings/${listingId}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (listingId: number) =>
      fetchApi<void>(`/listings/${listingId}`, { method: 'DELETE' }),
  },

  crops: {
    getAll: () => fetchApi<Array<{ id: number; name: string }>>('/crops'),
  },

  broadcasts: {
    getAll: () => fetchApi<Array<{
      id: number; cropName: string; price: number; unit: string;
      note?: string; imageUrl?: string; createdAt: string;
    }>>('/broadcasts'),

    create: (data: { cropName: string; price: number; unit: string; note?: string; imageUrl?: string }) =>
      fetchApi('/broadcasts', { method: 'POST', body: JSON.stringify(data) }),

    update: (id: number, data: { cropName?: string; price?: number; unit?: string; note?: string; imageUrl?: string }) =>
      fetchApi(`/broadcasts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

    delete: (id: number) =>
      fetchApi<void>(`/broadcasts/${id}`, { method: 'DELETE' }),
  },

  deliveryRequests: {
    create: (data: {
      transporterId: number; pickupLocation: string; destination: string;
      cargoType: string; weightValue?: number; weightUnit?: string;
      preferredTime?: string; priceOffer?: number; notes?: string;
    }) => fetchApi('/delivery-requests', { method: 'POST', body: JSON.stringify(data) }),

    listForBuyer: () => fetchApi<Array<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      transporterId: number; transporterName?: string;
      pickupLocation: string; destination: string; cargoType: string;
      weightValue?: number; weightUnit?: string; preferredTime?: string;
      priceOffer?: number; notes?: string; status: string;
      rejectReason?: string; createdAt: string; unreadCount?: number;
    }>>('/delivery-requests/buyer'),

    listForTransporter: () => fetchApi<Array<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      transporterId: number; transporterName?: string;
      pickupLocation: string; destination: string; cargoType: string;
      weightValue?: number; weightUnit?: string; preferredTime?: string;
      priceOffer?: number; notes?: string; status: string;
      rejectReason?: string; createdAt: string; unreadCount?: number;
    }>>('/delivery-requests/transporter'),

    updateStatus: (requestId: number, data: { status: string; rejectReason?: string }) =>
      fetchApi(`/delivery-requests/${requestId}/status`, {
        method: 'PATCH', body: JSON.stringify(data),
      }),

    sendMessage: (deliveryRequestId: number, data: { message: string }) =>
      fetchApi<{
        id: number; senderId: number; senderName: string;
        message: string; isRead: boolean; createdAt: string;
        updatedAt?: string; isEdited?: boolean;
      }>(`/delivery-requests/${deliveryRequestId}/messages`, {
        method: 'POST', body: JSON.stringify(data),
      }),

    getMessages: (deliveryRequestId: number) =>
      fetchApi<Array<{
        id: number; senderId: number; senderName: string;
        message: string; isRead: boolean; createdAt: string;
        updatedAt?: string; isEdited?: boolean;
      }>>(`/delivery-requests/${deliveryRequestId}/messages`),

    markMessagesAsRead: (deliveryRequestId: number) =>
      fetchApi<void>(`/delivery-requests/${deliveryRequestId}/messages/mark-read`, {
        method: 'POST',
      }),

    updateMessage: (messageId: number, data: { message: string }) =>
      fetchApi<{
        id: number; senderId: number; senderName: string;
        message: string; isRead: boolean; createdAt: string;
        updatedAt?: string; isEdited?: boolean;
      }>(`/delivery-requests/messages/${messageId}`, {
        method: 'PUT', body: JSON.stringify(data),
      }),

    deleteMessage: (messageId: number) =>
      fetchApi<void>(`/delivery-requests/messages/${messageId}`, {
        method: 'DELETE',
      }),
  },

  orders: {
    create: (data: {
      sellerId: number; listingId?: number; cropName: string;
      requestedQuantity: string; unit: string; offeredPrice?: number;
      buyerMessage?: string;
    }) => fetchApi<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      sellerId: number; sellerName?: string; sellerPhone?: string;
      listingId?: number; cropName: string; requestedQuantity: string;
      unit: string; offeredPrice?: number; buyerMessage?: string;
      status: string; farmerResponse?: string; availableQuantity?: string;
      paymentScreenshotUrl?: string; createdAt: string; updatedAt: string;
      unreadCount?: number; isNew?: boolean;
    }>('/orders', {
      method: 'POST', body: JSON.stringify(data),
    }),

    update: (orderId: number, data: {
      status?: string; farmerResponse?: string;
      availableQuantity?: string; paymentScreenshotUrl?: string;
    }) => fetchApi<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      sellerId: number; sellerName?: string; sellerPhone?: string;
      listingId?: number; cropName: string; requestedQuantity: string;
      unit: string; offeredPrice?: number; buyerMessage?: string;
      status: string; farmerResponse?: string; availableQuantity?: string;
      paymentScreenshotUrl?: string; createdAt: string; updatedAt: string;
      unreadCount?: number; isNew?: boolean;
    }>(`/orders/${orderId}`, {
      method: 'PATCH', body: JSON.stringify(data),
    }),

    getForBuyer: () => fetchApi<Array<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      sellerId: number; sellerName?: string; sellerPhone?: string;
      listingId?: number; cropName: string; requestedQuantity: string;
      unit: string; offeredPrice?: number; buyerMessage?: string;
      status: string; farmerResponse?: string; availableQuantity?: string;
      paymentScreenshotUrl?: string; createdAt: string; updatedAt: string;
      unreadCount?: number; isNew?: boolean;
    }>>('/orders/buyer'),

    getForSeller: () => fetchApi<Array<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      sellerId: number; sellerName?: string; sellerPhone?: string;
      listingId?: number; cropName: string; requestedQuantity: string;
      unit: string; offeredPrice?: number; buyerMessage?: string;
      status: string; farmerResponse?: string; availableQuantity?: string;
      paymentScreenshotUrl?: string; createdAt: string; updatedAt: string;
      unreadCount?: number; isNew?: boolean;
    }>>('/orders/seller'),

    getById: (orderId: number) => fetchApi<{
      id: number; buyerId: number; buyerName?: string; buyerPhone?: string;
      sellerId: number; sellerName?: string; sellerPhone?: string;
      listingId?: number; cropName: string; requestedQuantity: string;
      unit: string; offeredPrice?: number; buyerMessage?: string;
      status: string; farmerResponse?: string; availableQuantity?: string;
      paymentScreenshotUrl?: string; createdAt: string; updatedAt: string;
      unreadCount?: number; isNew?: boolean;
    }>(`/orders/${orderId}`),

    sendMessage: (orderId: number, data: { message: string }) =>
      fetchApi<{
        id: number; orderId: number; senderId: number; senderName: string;
        message: string; createdAt: string; updatedAt?: string; isEdited?: boolean;
      }>(`/orders/${orderId}/messages`, {
        method: 'POST', body: JSON.stringify(data),
      }),

    getMessages: (orderId: number) =>
      fetchApi<Array<{
        id: number; orderId: number; senderId: number; senderName: string;
        message: string; createdAt: string; updatedAt?: string; isEdited?: boolean;
      }>>(`/orders/${orderId}/messages`),

    markMessagesAsRead: (orderId: number) =>
      fetchApi<void>(`/orders/${orderId}/messages/mark-read`, {
        method: 'POST',
      }),

    updateMessage: (messageId: number, data: { message: string }) =>
      fetchApi<{
        id: number; orderId: number; senderId: number; senderName: string;
        message: string; createdAt: string; updatedAt?: string; isEdited?: boolean;
      }>(`/orders/messages/${messageId}`, {
        method: 'PUT', body: JSON.stringify(data),
      }),

    deleteMessage: (messageId: number) =>
      fetchApi<void>(`/orders/messages/${messageId}`, {
        method: 'DELETE',
      }),
  },

  analytics: {
    getPlatformAnalytics: () => fetchApi<{
      totalUsers: number; totalOrders: number; totalDeliveries: number;
      usersByRole: { role: string; count: number }[];
      verificationStatus: { status: string; count: number }[];
      ordersByStatus: { status: string; count: number }[];
      deliveriesByStatus: { status: string; count: number }[];
      usersByRegion: { region: string; count: number }[];
    }>('/analytics/platform'),
  },
};

export { ApiError };
