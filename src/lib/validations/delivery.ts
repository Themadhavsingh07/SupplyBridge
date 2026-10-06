import { z } from 'zod';

export const DeliveryRegistrationSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(10, 'Valid phone number required'),
  email: z.string().email('Valid email address required'),
  vehicleType: z.enum(['BIKE', 'SCOOTER', 'BICYCLE', 'EV', 'CAR']),
  vehicleNumber: z.string().min(4, 'Vehicle number required'),
  licenseNumber: z.string().min(5, 'Driving license number required'),

  // Bank & Payout details
  bankAccountNumber: z.string().min(8, 'Bank account number required'),
  bankIfscCode: z.string().min(6, 'IFSC code required'),
  upiId: z.string().optional(),

  // KYC Verification Docs (URLs)
  govtIdUrl: z.string().url('Government ID document required'),
  licenseDocUrl: z.string().url('Driving License document required'),
  rcDocUrl: z.string().url('Vehicle RC document required'),
});

export const DeliveryProfileSchema = z.object({
  vehicleType: z.string().min(2),
  vehicleNumber: z.string().min(4),
  licenseNumber: z.string().min(5),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
  upiId: z.string().optional(),
});

export const DeliveryStatusSchema = z.object({
  isOnline: z.boolean().optional(),
  isAvailable: z.boolean().optional(),
});

export const DeliveryLocationSchema = z.object({
  latitude: z
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  longitude: z
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  accuracy: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  speed: z.number().min(0).optional(),
  timestamp: z.string().optional(),
});

export const DeliveryOtpSchema = z.object({
  orderId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});

export const DeliveryRejectSchema = z.object({
  reason: z.string().min(2, 'Rejection reason required'),
});

export const DeliveryCompletionSchema = z.object({
  orderId: z.string().min(1),
  otp: z.string().length(6, 'OTP must be 6 digits'),
  proofImageUrl: z.string().url().optional(),
  notes: z.string().optional(),
});
