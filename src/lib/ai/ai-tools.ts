import { prisma } from '@/lib/prisma';
import { AIToolResult } from './ai-types';

export async function executeAITool(
  toolName: string,
  args: Record<string, any>,
  userId?: string
): Promise<AIToolResult> {
  try {
    switch (toolName) {
      case 'getOrderStatus': {
        if (!args.orderId && !userId) {
          return { toolName, success: false, data: null, error: 'Order ID is required' };
        }

        const where: any = {};
        if (args.orderId) {
          where.OR = [{ id: args.orderId }, { orderNumber: args.orderId }];
        }
        if (userId) {
          where.customerId = userId;
        }

        const order = await prisma.order.findFirst({
          where,
          include: {
            supplier: { select: { businessName: true } },
            delivery: { select: { status: true } },
            payment: { select: { status: true, method: true } },
          },
          orderBy: { createdAt: 'desc' },
        });

        if (!order) {
          return { toolName, success: false, data: null, error: 'No matching order found for your account.' };
        }

        return {
          toolName,
          success: true,
          data: {
            orderId: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: Number(order.total),
            supplierName: order.supplier?.businessName,
            deliveryStatus: order.delivery?.status || 'ASSIGNED',
            paymentStatus: order.payment?.status || 'PENDING',
            placedAt: order.placedAt,
          },
        };
      }

      case 'getDeliveryStatus': {
        const orderId = args.orderId;
        const delivery = await prisma.delivery.findFirst({
          where: {
            order: {
              OR: [{ id: orderId }, { orderNumber: orderId }],
              ...(userId ? { customerId: userId } : {}),
            },
          },
          include: {
            deliveryPartner: { include: { user: { select: { name: true, phone: true } } } },
            currentLocation: true,
          },
        });

        if (!delivery) {
          return { toolName, success: false, data: null, error: 'Delivery tracking information unavailable.' };
        }

        return {
          toolName,
          success: true,
          data: {
            deliveryId: delivery.id,
            status: delivery.status,
            riderName: delivery.deliveryPartner?.user?.name || 'Rider Assigning...',
            riderPhone: delivery.deliveryPartner?.user?.phone || 'N/A',
            vehicleNumber: delivery.deliveryPartner?.vehicleNumber || 'EV Scooter',
            lastLocation: delivery.currentLocation
              ? { lat: Number(delivery.currentLocation.latitude), lng: Number(delivery.currentLocation.longitude) }
              : null,
          },
        };
      }

      case 'getComplaintStatus': {
        const complaintId = args.complaintId;
        const complaint = await prisma.complaint.findFirst({
          where: {
            OR: [{ id: complaintId }, { complaintNumber: complaintId }],
            ...(userId ? { customerId: userId } : {}),
          },
        });

        if (!complaint) {
          return { toolName, success: false, data: null, error: 'No complaint record found matching your query.' };
        }

        return {
          toolName,
          success: true,
          data: {
            complaintNumber: complaint.complaintNumber,
            subject: complaint.subject,
            status: complaint.status,
            priority: complaint.priority,
            createdAt: complaint.createdAt,
          },
        };
      }

      case 'getSupplierDetails': {
        const supplier = await prisma.supplierProfile.findUnique({
          where: { id: args.supplierId },
          select: {
            id: true,
            businessName: true,
            addressLine: true,
            city: true,
            rating: true,
            onlineStatus: true,
          },
        });

        if (!supplier) {
          return { toolName, success: false, data: null, error: 'Supplier details not found.' };
        }

        return {
          toolName,
          success: true,
          data: supplier,
        };
      }

      default:
        return { toolName, success: false, data: null, error: `Unknown tool name: ${toolName}` };
    }
  } catch (err: any) {
    return { toolName, success: false, data: null, error: err.message };
  }
}
