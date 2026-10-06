import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';

export async function listAdminOrders(params: {
  status?: OrderStatus;
  supplierId?: string;
  customerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.supplierId) where.supplierId = params.supplierId;
  if (params.customerId) where.customerId = params.customerId;
  if (params.search) {
    where.OR = [
      { orderNumber: { contains: params.search, mode: 'insensitive' } },
      { customer: { name: { contains: params.search, mode: 'insensitive' } } },
      { supplier: { businessName: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        supplier: { select: { id: true, businessName: true } },
        delivery: {
          include: {
            deliveryPartner: {
              include: { user: { select: { name: true, phone: true } } },
            },
          },
        },
        items: true,
        payment: true,
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { orders, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function overrideOrderStatusByAdmin(
  adminUserId: string,
  orderId: string,
  newStatus: OrderStatus,
  reason: string
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, supplier: true },
  });

  if (!order) throw new Error('Order not found');

  const previousStatus = order.status;

  const updatedOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: newStatus },
  });

  // Record status history
  await prisma.orderStatusHistory.create({
    data: {
      orderId,
      previousStatus,
      newStatus,
      changedById: adminUserId,
      reason: `ADMIN OVERRIDE: ${reason}`,
    },
  });

  // Record audit log
  await createAuditLog({
    userId: adminUserId,
    action: 'ORDER_MANUAL_OVERRIDE' as any,
    entityType: 'ORDER',
    entityId: orderId,
    oldData: { status: previousStatus },
    newData: { status: newStatus, reason, changedById: adminUserId },
  });

  // Publish Realtime Event
  await publishRealtimeEvent({
    eventType: 'ORDER_STATUS_CHANGED',
    actorId: adminUserId,
    actorRole: 'ADMIN',
    entityId: orderId,
    payload: { orderId, previousStatus, newStatus, reason } as any,
  });

  return updatedOrder;
}
