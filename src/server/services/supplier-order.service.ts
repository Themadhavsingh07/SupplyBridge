import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';
import { transitionOrderStatus } from './order-status.service';
import { ActorRole } from '@/types/realtime';

export async function listSupplierOrders(params: {
  supplierId: string;
  status?: OrderStatus;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const { supplierId, status, search, page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    supplierId,
  };

  if (status) {
    where.status = status;
  }

  if (search && search.trim()) {
    where.OR = [
      { orderNumber: { contains: search.trim(), mode: 'insensitive' } },
      { customer: { name: { contains: search.trim(), mode: 'insensitive' } } },
      { customer: { phone: { contains: search.trim(), mode: 'insensitive' } } },
    ];
  }

  const [orders, totalCount] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        items: {
          include: {
            product: { select: { id: true, name: true, unit: true } },
          },
        },
        delivery: {
          select: {
            id: true,
            status: true,
            deliveryPartner: { select: { user: { select: { name: true, phone: true } } } },
          },
        },
        payment: {
          select: {
            status: true,
            method: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return {
    orders,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  };
}

export async function getSupplierOrderById(supplierId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      supplierId, // STRICT ownership check
    },
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
        },
      },
      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              sku: true,
              unit: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
        },
      },
      statusHistory: {
        orderBy: { createdAt: 'asc' },
      },
      payment: true,
      delivery: {
        include: {
          deliveryPartner: {
            select: {
              user: { select: { name: true, phone: true } },
              vehicleType: true,
              vehicleNumber: true,
            },
          },
        },
      },
    },
  });

  if (!order) {
    throw new Error('Order not found or access denied');
  }

  return order;
}

export async function processSupplierOrderAction(params: {
  supplierId: string;
  orderId: string;
  action: 'CONFIRM' | 'START_PREPARING' | 'MARK_READY' | 'CANCEL';
  reason?: string;
  actorUserId: string;
}) {
  const { supplierId, orderId, action, reason, actorUserId } = params;

  // 1. Validate supplier order ownership
  const order = await prisma.order.findFirst({
    where: { id: orderId, supplierId },
  });

  if (!order) {
    throw new Error('Order not found or access denied');
  }

  // 2. Map action to OrderStatus target
  let targetStatus: OrderStatus;
  switch (action) {
    case 'CONFIRM':
      targetStatus = OrderStatus.CONFIRMED;
      break;
    case 'START_PREPARING':
      targetStatus = OrderStatus.PREPARING;
      break;
    case 'MARK_READY':
      targetStatus = OrderStatus.READY_FOR_PICKUP;
      break;
    case 'CANCEL':
      targetStatus = OrderStatus.CANCELLED;
      break;
    default:
      throw new Error(`Invalid action: ${action}`);
  }

  // 3. Delegate to canonical order-status.service.ts
  const result = await transitionOrderStatus({
    orderId,
    newStatus: targetStatus,
    actorId: actorUserId,
    actorRole: 'SUPPLIER' as ActorRole,
    reason,
  });

  return result;
}
