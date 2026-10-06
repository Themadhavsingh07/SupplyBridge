import { z } from 'zod';

export const checkoutSchema = z.object({
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NET_BANKING', 'WALLET']).default('CARD'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  deliveryAddress: z.object({
    name: z.string().min(1),
    phone: z.string().min(1),
    addressLine: z.string().min(1),
    landmark: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
  }),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PLACED',
    'CONFIRMED',
    'PREPARING',
    'READY_FOR_PICKUP',
    'PICKED_UP',
    'OUT_FOR_DELIVERY',
    'DELIVERED',
    'CANCELLED',
  ]),
  cancellationReason: z.string().optional(),
  deliveryPartnerProfileId: z.string().optional(),
});
