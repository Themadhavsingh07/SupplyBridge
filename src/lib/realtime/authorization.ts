import { prisma } from '@/lib/prisma';
import { parseChannel } from './channels';

export interface AuthContext {
  userId: string;
  role: 'CUSTOMER' | 'SUPPLIER' | 'DELIVERY_PARTNER' | 'ADMIN' | 'SUPPORT_AGENT';
}

/**
 * Server-side authorization matrix checking role, ownership, and allowed channels.
 */
export async function authorizeChannelAccess(
  channelName: string,
  user: AuthContext
): Promise<{ authorized: boolean; reason?: string }> {
  // ADMIN and SUPPORT_AGENT have operational access to support channels
  if (user.role === 'ADMIN') {
    return { authorized: true };
  }

  const parsed = parseChannel(channelName);
  if (!parsed) {
    return { authorized: false, reason: 'Invalid channel format' };
  }

  const { type, id, subTopic } = parsed;

  try {
    switch (type) {
      case 'conversation': {
        const conversation = await prisma.conversation.findUnique({
          where: { id },
          include: {
            supplier: true,
            participants: true,
          },
        });

        if (!conversation) {
          return { authorized: false, reason: 'Conversation not found' };
        }

        const isParticipant = conversation.participants.some((p) => p.userId === user.userId);
        const isSupplierOwner = conversation.supplier?.userId === user.userId;

        if (isParticipant || isSupplierOwner || user.role === 'SUPPORT_AGENT') {
          return { authorized: true };
        }
        return { authorized: false, reason: 'Not a participant of this conversation' };
      }

      case 'order': {
        const order = await prisma.order.findUnique({
          where: { id },
          include: {
            supplier: true,
            delivery: {
              include: { deliveryPartner: true },
            },
          },
        });

        if (!order) {
          return { authorized: false, reason: 'Order not found' };
        }

        const isCustomer = order.customerId === user.userId;
        const isDeliveryPartnerUser = order.delivery?.deliveryPartner?.userId === user.userId;
        const isSupplierOwner = order.supplier?.userId === user.userId;

        if (subTopic === 'tracking') {
          if (isCustomer || isDeliveryPartnerUser || isSupplierOwner) {
            return { authorized: true };
          }
          return { authorized: false, reason: 'Not authorized for live tracking on this order' };
        }

        if (subTopic === 'status') {
          if (isCustomer || isDeliveryPartnerUser || isSupplierOwner || user.role === 'SUPPORT_AGENT') {
            return { authorized: true };
          }
          return { authorized: false, reason: 'Not authorized for order status updates' };
        }

        return { authorized: false, reason: 'Unknown order channel topic' };
      }

      case 'user': {
        if (id === user.userId) {
          return { authorized: true };
        }
        return { authorized: false, reason: 'Cannot subscribe to another user notifications' };
      }

      case 'supplier': {
        const supplier = await prisma.supplierProfile.findUnique({
          where: { id },
        });

        if (supplier && supplier.userId === user.userId) {
          return { authorized: true };
        }
        return { authorized: false, reason: 'Not owner of this supplier store' };
      }

      case 'complaint': {
        const complaint = await prisma.complaint.findUnique({
          where: { id },
          include: { supplier: true },
        });

        if (!complaint) {
          return { authorized: false, reason: 'Complaint ticket not found' };
        }

        const isCustomer = complaint.customerId === user.userId;
        const isAssignedAgent = complaint.assignedToId === user.userId;
        const isSupplierOwner = complaint.supplier?.userId === user.userId;

        if (isCustomer || isAssignedAgent || isSupplierOwner || user.role === 'SUPPORT_AGENT') {
          return { authorized: true };
        }
        return { authorized: false, reason: 'Not authorized for this complaint ticket' };
      }

      case 'system': {
        return { authorized: true };
      }

      default:
        return { authorized: false, reason: 'Unrecognized channel type' };
    }
  } catch (error) {
    console.error('Channel authorization error:', error);
    return { authorized: false, reason: 'Internal authorization error' };
  }
}
