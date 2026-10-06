export type Role = 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPPORT_AGENT';

export interface UserSession {
  id: String;
  email: String;
  name: String;
  role: Role;
  avatar?: String;
  phone?: String;
  supplierId?: String;
}

export interface SupplierComparisonItem {
  supplierProductId: string;
  supplierId: string;
  supplierName: string;
  ownerName: string;
  rating: number;
  totalRatingsCount: number;
  estimatedDeliveryMinutes: number;
  deliveryFee: number;
  price: number;
  discountPercent: number;
  finalPrice: number;
  stock: number;
  isAvailable: boolean;
  distanceKm: number;
  verificationStatus: string;
  unit: string;
}

export interface ProductWithComparisons {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryName: string;
  categorySlug: string;
  primaryImage: string;
  basePrice: number;
  suppliers: SupplierComparisonItem[];
}

export interface CartItemWithDetails {
  id: string;
  quantity: number;
  supplierProductId: string;
  productName: string;
  productImage: string;
  unit: string;
  unitPrice: number;
  discountPercent: number;
  finalUnitPrice: number;
  totalPrice: number;
  supplierId: string;
  supplierName: string;
  supplierRating: number;
  stock: number;
}
