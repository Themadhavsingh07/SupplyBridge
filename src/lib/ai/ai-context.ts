import { prisma } from '@/lib/prisma';
import { AIShoppingParams } from './ai-types';

export async function buildGroundedProductContext(params: AIShoppingParams) {
  const where: any = {
    status: 'ACTIVE',
  };

  if (params.maxPrice) {
    where.price = { lte: params.maxPrice };
  }

  if (params.minPrice) {
    where.price = { ...where.price, gte: params.minPrice };
  }

  if (params.keywords && params.keywords.length > 0) {
    where.OR = params.keywords.map((kw) => ({
      name: { contains: kw, mode: 'insensitive' },
    }));
  }

  const products = await prisma.product.findMany({
    where,
    take: 12,
    include: {
      supplier: {
        select: {
          id: true,
          businessName: true,
          rating: true,
          city: true,
          onlineStatus: true,
        },
      },
    },
    orderBy: [{ stockQuantity: 'desc' }, { rating: 'desc' }],
  });

  return products.map((p) => ({
    productId: p.id,
    name: p.name,
    supplierId: p.supplierId,
    supplierName: p.supplier?.businessName || 'Local Supplier',
    price: Number(p.price),
    mrp: p.mrp ? Number(p.mrp) : null,
    stockQuantity: p.stockQuantity,
    unit: p.unit || 'pack',
    rating: Number(p.rating || 4.5),
    supplierRating: Number(p.supplier?.rating || 4.8),
    inStock: p.stockQuantity > 0,
  }));
}

export async function buildGroundedOrderContext(userId: string, orderId?: string) {
  if (orderId) {
    const order = await prisma.order.findFirst({
      where: { id: orderId, customerId: userId },
      include: {
        supplier: { select: { businessName: true, phone: true } },
        delivery: {
          include: {
            deliveryPartner: {
              include: { user: { select: { name: true, phone: true } } },
            },
            currentLocation: true,
          },
        },
        items: true,
        payment: true,
      },
    });

    if (!order) return null;

    return {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalAmount: Number(order.total),
      placedAt: order.placedAt,
      supplierName: order.supplier?.businessName,
      deliveryStatus: order.delivery?.status || 'ASSIGNED',
      riderName: order.delivery?.deliveryPartner?.user?.name || 'Rider Assigning...',
      riderPhone: order.delivery?.deliveryPartner?.user?.phone || 'N/A',
      paymentStatus: order.payment?.status || 'PENDING',
      paymentMethod: order.payment?.method || 'UPI',
    };
  }

  // Get recent 3 orders for user
  const orders = await prisma.order.findMany({
    where: { customerId: userId },
    take: 3,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      placedAt: true,
    },
  });

  return orders.map((o) => ({
    orderId: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    total: Number(o.total),
    placedAt: o.placedAt,
  }));
}
