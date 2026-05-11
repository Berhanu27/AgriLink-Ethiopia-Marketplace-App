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
  vehicleType?: string;
  vehicleCapacity?: string;
  vehicleImageUrl?: string;
  available?: boolean;
  cooperativeName?: string;
  memberCount?: number;
}

export interface Listing {
  id: string;
  farmerId: string;
  farmerName: string;
  farmerPhone?: string;
  farmerRegion: string;
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

export interface DeliveryRequest {
  id: string;
  pickupLocation: string;
  destination: string;
  cargoType: string;
  weightValue?: number;
  weightUnit?: string;
  preferredTime?: string;
  priceOffer?: number;
  notes?: string;
  status: 'pending' | 'accepted' | 'in-transit' | 'delivered' | 'rejected';
  rejectReason?: string;
  requesterId: string;
  requesterName?: string;
  requesterPhone?: string;
  transporterId: string;
  transporterName?: string;
  createdAt: Date;
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

export interface Broadcast {
  id: string;
  cropName: string;
  price: number;
  unit: string;
  note?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface MarketPrice {
  id: string;
  cropName: string;
  averagePrice: number;
  unit: string;
  region: string;
  market: string;
  change?: number;
  updatedAt: Date;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerName?: string;
  buyerPhone?: string;
  sellerId: string;
  sellerName?: string;
  sellerPhone?: string;
  listingId?: string;
  cropName: string;
  requestedQuantity: string;
  unit: string;
  offeredPrice?: number;
  buyerMessage?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'completed';
  farmerResponse?: string;
  availableQuantity?: string;
  paymentScreenshotUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  unreadCount?: number;
  isNew?: boolean;
}

export interface OrderMessage {
  id: string;
  orderId: string;
  senderId: string;
  senderName: string;
  message: string;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
}

export interface DeliveryMessage {
  id: string;
  deliveryRequestId: string;
  senderId: string;
  senderName: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  updatedAt?: Date;
  isEdited?: boolean;
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

export interface PlatformAnalytics {
  totalUsers: number;
  totalOrders: number;
  totalDeliveries: number;
  usersByRole: { role: string; count: number }[];
  verificationStatus: { status: string; count: number }[];
  ordersByStatus: { status: string; count: number }[];
  deliveriesByStatus: { status: string; count: number }[];
  usersByRegion: { region: string; count: number }[];
}
