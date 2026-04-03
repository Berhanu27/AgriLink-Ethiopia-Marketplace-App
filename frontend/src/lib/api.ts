const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';
const DEBUG_API = process.env.NEXT_PUBLIC_DEBUG_API === 'true';

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiRequestOptions extends RequestInit {
  silent?: boolean;
}

async function fetchApi<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const { silent, ...requestOptions } = options;
  const token = typeof window !== 'undefined' ? localStorage.getItem('agrilink_token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...requestOptions.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (DEBUG_API) {
    console.log(`API Request: ${options.method || 'GET'} ${API_URL}${endpoint}`, {
      hasToken: !!token,
      tokenPreview: token ? `${token.substring(0, 20)}...` : null,
    });
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...requestOptions,
      headers,
    });

    if (DEBUG_API) {
      console.log(`API Response: ${response.status} ${response.statusText}`, {
        endpoint,
        ok: response.ok,
      });
    }

    if (!response.ok) {
      let errorMessage = 'Request failed';
      try {
        const errorResponse = response.clone();
        const errorData = await errorResponse.json();
        console.error('Error response body:', errorData);
        errorMessage = errorData.message || errorData.error || JSON.stringify(errorData);
      } catch {
        const text = await response.clone().text();
        console.error('Error response text:', text);
        errorMessage = text || response.statusText;
      }
      throw new ApiError(response.status, errorMessage);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    const contentType = response.headers.get('content-type') || '';
    const responseText = await response.text();

    if (!responseText) {
      return undefined as T;
    }

    if (contentType.includes('application/json')) {
      return JSON.parse(responseText) as T;
    }

    return responseText as unknown as T;
  } catch (error) {
    if (error instanceof ApiError) {
      if (!silent) {
        console.error(`API Error for ${endpoint}:`, error);
      }
      throw error;
    }
    if (!silent) {
      console.error(`API Network Error for ${endpoint}:`, error);
    }
    throw new ApiError(0, 'Network error - backend may not be running');
  }
}

export const api = {
  // Auth endpoints
  auth: {
    register: (data: {
      name: string;
      phone: string;
      email?: string;
      password: string;
      role: string;
      region: string;
      nationalId?: string;
      vehicleType?: string;
      vehicleCapacity?: string;
      cooperativeName?: string;
      memberCount?: number;
      vehicleImageUrl?: string;
    }) => {
      const payload: {
        fullName: string;
        phone: string;
        email: string;
        password: string;
        nationalId?: string;
        vehicleImageUrl?: string;
      } = {
        fullName: data.name,
        phone: data.phone,
        email: data.email || '',
        password: data.password,
      };
      
      // Only include nationalId if it has a value
      if (data.nationalId) {
        payload.nationalId = data.nationalId;
      }

      if (data.role) {
        payload.role = data.role;
      }

      if (data.region) {
        payload.region = data.region;
      }

      if (data.vehicleType) {
        payload.vehicleType = data.vehicleType;
      }

      if (data.vehicleCapacity) {
        payload.vehicleCapacity = data.vehicleCapacity;
      }

      if (data.vehicleImageUrl) {
        payload.vehicleImageUrl = data.vehicleImageUrl;
      }

      if (data.cooperativeName) {
        payload.cooperativeName = data.cooperativeName;
      }

      if (data.memberCount !== undefined) {
        payload.memberCount = data.memberCount;
      }
      
      return fetchApi<{ userId: number; fullName: string; phone: string; roles: string[]; token: string; verificationStatus: string }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
    },

    login: (phone: string, password: string) =>
      fetchApi<{ userId: number; fullName: string; phone: string; roles: string[]; token: string }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ phone, password }),
      }),
  },

  // Listings endpoints
  listings: {
    getAll: () => fetchApi<{
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
    }[]>('/listings'),
    
    create: (data: {
      sellerId: number;
      cropId?: number;
      cropName?: string;
      askingPrice: number;
      imageUrl?: string;
      quantity?: string;
      unit?: string;
      location?: string;
      description?: string;
    }) => fetchApi('/listings', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

    update: (listingId: number, data: {
      cropId?: number;
      cropName?: string;
      askingPrice?: number;
      imageUrl?: string;
      quantity?: string;
      unit?: string;
      location?: string;
      description?: string;
    }) => fetchApi(`/listings/${listingId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
  },

  crops: {
    getAll: () => fetchApi<Array<{ id: number; name: string }>>('/crops'),
  },

  // Users endpoints
  users: {
    getProfile: (options?: ApiRequestOptions) => fetchApi<{
      id: number,
      fullName: string,
      phone: string,
      email: string,
      nationalId?: string,
      region?: string,
      vehicleType?: string,
      vehicleCapacity?: string,
      vehicleImageUrl?: string,
      available?: boolean,
      cooperativeName?: string,
      memberCount?: number,
      verificationStatus: string,
      roles: string[]
    }>('/users/profile', options),
    
    getAll: (options?: ApiRequestOptions) => fetchApi<Array<{
      id: number;
      fullName: string;
      phone: string;
      email: string;
      nationalId?: string;
      region?: string;
      vehicleType?: string;
      vehicleCapacity?: string;
      vehicleImageUrl?: string;
      cooperativeName?: string;
      memberCount?: number;
      verificationStatus: string;
      roles: string[];
    }>>("/users", options),

    updateVerification: (userId: number, verificationStatus: string) =>
      fetchApi<{ id: number; verificationStatus: string }>(`/users/${userId}/verification`, {
        method: 'PATCH',
        body: JSON.stringify({ verificationStatus }),
      }),

    deleteUser: (userId: number) =>
      fetchApi<void>(`/users/${userId}`, {
        method: 'DELETE',
      }),

    updateAvailability: (available: boolean) =>
      fetchApi<{
        id: number,
        fullName: string,
        phone: string,
        email: string,
        nationalId?: string,
        region?: string,
        vehicleType?: string,
        vehicleCapacity?: string,
        vehicleImageUrl?: string,
        available?: boolean,
        cooperativeName?: string,
        memberCount?: number,
        verificationStatus: string,
        roles: string[]
      }>('/users/profile/availability', {
        method: 'PATCH',
        body: JSON.stringify({ available }),
      }),

    getPublicTransporters: () => fetchApi<Array<{
      id: number;
      fullName: string;
      phone: string;
      region?: string;
      vehicleType?: string;
      vehicleCapacity?: string;
      vehicleImageUrl?: string;
    }>>('/users/transporters/public'),
  },

  broadcasts: {
    getAll: () => fetchApi<Array<{
      id: number;
      cropName: string;
      price: number;
      unit: string;
      note?: string;
      imageUrl?: string;
      createdAt: string;
    }>>('/broadcasts'),

    create: (data: { cropName: string; price: number; unit: string; note?: string; imageUrl?: string }) =>
      fetchApi<{ id: number } & { cropName: string; price: number; unit: string; note?: string; imageUrl?: string; createdAt: string }>(
        '/broadcasts',
        {
          method: 'POST',
          body: JSON.stringify(data),
        }
      ),

    update: (broadcastId: number, data: { cropName?: string; price?: number; unit?: string; note?: string; imageUrl?: string }) =>
      fetchApi<{ id: number } & { cropName: string; price: number; unit: string; note?: string; imageUrl?: string; createdAt: string }>(
        `/broadcasts/${broadcastId}`,
        {
          method: 'PATCH',
          body: JSON.stringify(data),
        }
      ),
  },
};

export { ApiError };
