import { z } from 'zod';

export const UserStatusUpdateSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  status: z.enum(['ACTIVE', 'SUSPENDED', 'INACTIVE', 'DELETED']),
  reason: z.string().min(3, 'Reason for status update is required'),
});

export const SupplierVerificationActionSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  status: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED', 'UNDER_REVIEW']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export const DeliveryPartnerVerificationActionSchema = z.object({
  deliveryPartnerId: z.string().min(1, 'Delivery Partner ID is required'),
  status: z.enum(['VERIFIED', 'REJECTED', 'SUSPENDED', 'UNDER_REVIEW']),
  rejectionReason: z.string().optional(),
  notes: z.string().optional(),
});

export const CategoryCreateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  slug: z.string().min(2, 'Slug must be at least 2 characters'),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.string().nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

export const OrderOverrideSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  newStatus: z.enum([
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  reason: z.string().min(5, 'Detailed reason for order status override is required'),
});

export const RefundRequestSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  paymentId: z.string().optional(),
  amount: z.number().positive('Refund amount must be positive'),
  reason: z.string().min(3, 'Reason for refund is required'),
  refundType: z.enum(['FULL', 'PARTIAL']).default('FULL'),
});

export const ComplaintAssignmentSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  assignedToId: z.string().nullable(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_FOR_CUSTOMER', 'WAITING_FOR_SUPPLIER', 'RESOLVED', 'CLOSED', 'REOPENED']).optional(),
});

export const ComplaintInternalNoteSchema = z.object({
  complaintId: z.string().min(1, 'Complaint ID is required'),
  content: z.string().min(2, 'Note content cannot be empty'),
});

export const CouponCreateSchema = z.object({
  code: z.string().min(3, 'Code must be at least 3 characters').toUpperCase(),
  discountType: z.enum(['PERCENTAGE', 'FIXED', 'FREE_DELIVERY']),
  discountValue: z.number().nonnegative(),
  minOrderAmount: z.number().default(0),
  maxDiscountAmount: z.number().nullable().optional(),
  startDate: z.string().or(z.date()),
  endDate: z.string().or(z.date()),
  usageLimit: z.number().int().positive().nullable().optional(),
  perUserLimit: z.number().int().positive().default(1),
  supplierId: z.string().nullable().optional(),
  isActive: z.boolean().default(true),
});

export const SystemAnnouncementSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  message: z.string().min(5, 'Message is required'),
  targetRole: z.enum(['ALL', 'CUSTOMER', 'SUPPLIER', 'DELIVERY_PARTNER']).default('ALL'),
  type: z.enum(['SYSTEM', 'PROMOTION', 'ORDER', 'DELIVERY', 'PAYMENT', 'COMPLAINT']).default('SYSTEM'),
});

export const SystemSettingsSchema = z.object({
  platformCommissionPercent: z.number().min(0).max(50),
  defaultDeliveryFee: z.number().min(0),
  minimumOrderAmount: z.number().min(0),
  maxDeliveryRadiusKm: z.number().positive(),
  lowStockThreshold: z.number().int().positive(),
  featureFlags: z.object({
    AI_ASSISTANT: z.boolean(),
    SMART_SEARCH: z.boolean(),
    SUBSCRIPTIONS: z.boolean(),
    LOYALTY: z.boolean(),
    REFERRALS: z.boolean(),
    LIVE_TRACKING: z.boolean(),
    SUPPLIER_CHAT: z.boolean(),
    DELIVERY_CHAT: z.boolean(),
  }),
  maintenanceMode: z.boolean().default(false),
});
