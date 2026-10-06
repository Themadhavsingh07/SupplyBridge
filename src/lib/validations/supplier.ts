import { z } from 'zod';

export const SupplierRegistrationSchema = z.object({
  // Step 1: Business Info
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  ownerName: z.string().min(2, 'Owner name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  phone: z.string().min(10, 'Enter a valid phone number'),
  email: z.string().email('Enter a valid email address'),

  // Step 2: Address
  address: z.string().min(5, 'Enter complete street address'),
  landmark: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(6, 'Enter a valid postal code'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  serviceRadiusKm: z.number().min(0.5).max(50).default(5),

  // Step 3: Business Verification Details
  gstNumber: z.string().min(15, 'Valid 15-digit GSTIN required'),
  panNumber: z.string().min(10, 'Valid 10-character PAN required'),
  businessLicense: z.string().min(3, 'Business license number required'),

  // Step 4: Documents (URLs stored in Supabase Storage)
  gstDocUrl: z.string().url('GST Document URL required'),
  panDocUrl: z.string().url('PAN Document URL required'),
  licenseDocUrl: z.string().url('License Document URL required'),
  idProofUrl: z.string().url('ID Proof URL required'),
  bankProofUrl: z.string().url('Bank Proof URL required'),

  // Step 5: Store Details
  logoUrl: z.string().url().optional(),
  coverImageUrl: z.string().url().optional(),
  openingTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Use HH:mm format'),
  closingTime: z.string().regex(/^([01]\d|2[0-3]):?([0-5]\d)$/, 'Use HH:mm format'),
  categoryIds: z.array(z.string()).min(1, 'Select at least one store category'),
});

export const SupplierProfileSchema = z.object({
  storeName: z.string().min(2),
  description: z.string().min(10),
  phone: z.string().min(10),
  email: z.string().email(),
  address: z.string().min(5),
  landmark: z.string().optional(),
  city: z.string().min(2),
  state: z.string().min(2),
  postalCode: z.string().min(6),
  latitude: z.number(),
  longitude: z.number(),
  serviceRadiusKm: z.number().min(0.5).max(50),
  openingTime: z.string(),
  closingTime: z.string(),
  logoUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  isOpen: z.boolean().optional(),
});

export const SupplierProductVariantSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Variant name is required'),
  sku: z.string().min(2, 'SKU required'),
  price: z.number().positive('Price must be greater than 0'),
  mrp: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Stock cannot be negative'),
  isActive: z.boolean().default(true),
});

export const SupplierProductSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  description: z.string().min(5, 'Description is required'),
  categoryId: z.string().min(1, 'Category is required'),
  sku: z.string().min(2, 'SKU is required'),
  barcode: z.string().optional(),
  price: z.number().positive('Price must be positive'),
  mrp: z.number().positive('MRP must be positive'),
  discount: z.number().min(0).max(100).default(0),
  unit: z.string().min(1, 'Unit (e.g. 500g, 1L, 1 packet) is required'),
  quantity: z.number().min(1).default(1),
  initialStock: z.number().int().min(0, 'Initial stock cannot be negative'),
  lowStockThreshold: z.number().int().min(1).default(5),
  images: z.array(z.string().url()).min(1, 'Upload at least one product image'),
  variants: z.array(SupplierProductVariantSchema).optional(),
  isFeatured: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const SupplierInventoryUpdateSchema = z.object({
  productId: z.string().min(1),
  quantityChange: z.number().int(),
  reason: z.string().min(2, 'Reason for stock change required'),
  newThreshold: z.number().int().min(1).optional(),
});

export const SupplierOrderActionSchema = z.object({
  orderId: z.string().min(1),
  action: z.enum(['CONFIRM', 'START_PREPARING', 'MARK_READY', 'CANCEL']),
  cancellationReason: z.string().optional(),
});

export const SupplierCouponSchema = z.object({
  code: z.string().min(3, 'Coupon code must be at least 3 characters').toUpperCase(),
  description: z.string().min(5),
  type: z.enum(['PERCENTAGE', 'FIXED', 'FREE_DELIVERY']),
  value: z.number().positive('Discount value must be positive'),
  minOrderAmount: z.number().min(0).default(0),
  maxDiscount: z.number().positive().optional(),
  startDate: z.string(),
  endDate: z.string(),
  usageLimit: z.number().int().positive().optional(),
  isActive: z.boolean().default(true),
});

export const SupplierStatusSchema = z.object({
  onlineStatus: z.enum(['ONLINE', 'OFFLINE', 'BUSY']),
});

export const SupplierStoreOpenSchema = z.object({
  isOpen: z.boolean(),
});
