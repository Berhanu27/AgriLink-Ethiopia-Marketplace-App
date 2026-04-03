export type UserRole = 'farmer' | 'buyer' | 'transporter' | 'cooperative' | 'admin';

export interface User {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: UserRole;
  region: string;
  nationalId?: string;
  verified: boolean;
  avatar?: string;
  rating?: number;
  vehicleType?: string; // for transporter
  vehicleCapacity?: string; // for transporter
  vehicleImageUrl?: string; // for transporter
  available?: boolean; // for transporter
  cooperativeName?: string; // for cooperative
  memberCount?: number; // for cooperative
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerRegion: string;
  farmerZone?: string;
  farmerSpecificLocation?: string;
  farmerVerified: boolean;
  cropName: string;
  quantity: string;
  unit: string;
  pricePerUnit: number;
  totalPrice: number;
  location: string;
  status: 'active' | 'sold' | 'expired';
  description?: string;
  imageUrl?: string;
  createdAt: Date;
  views: number;
  inquiries: number;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  averagePrice: number;
  unit: string;
  region: string;
  market: string;
  change?: number; // percentage change
  updatedAt: Date;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
  listingId?: string;
}

export interface DeliveryRequest {
  id: string;
  pickupLocation: string;
  destination: string;
  cargo: string;
  weight: string;
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered';
  requesterId: string;
  requesterName: string;
  transporterId?: string;
  createdAt: Date;
  price?: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'inquiry' | 'message' | 'delivery' | 'verification' | 'system';
  title: string;
  message: string;
  read: boolean;
  timestamp: Date;
  actionUrl?: string;
}

export interface Language {
  code: 'en' | 'am' | 'or';
  name: string;
  nativeName: string;
}

export interface TransporterPublic {
  id: string;
  fullName: string;
  phone: string;
  region?: string;
  vehicleType?: string;
  vehicleCapacity?: string;
  vehicleImageUrl?: string;
}
