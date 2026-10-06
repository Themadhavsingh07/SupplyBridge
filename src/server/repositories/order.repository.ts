import { prisma } from '@/lib/prisma';
import { OrderStatus } from '@prisma/client';

export class OrderRepository {
  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: {
        supplier: true,
        customer: { select: { id: true, name: true, phone: true, email: true } },
        items: true,
        payment: true,
        delivery: {
          include: {
            deliveryPartner: { include: { user: true } },
            currentLocation: true,
          },
        },
      },
    });
  }

  async findByOrderNumber(orderNumber: string) {
    return prisma.order.findUnique({
      where: { orderNumber },
      include: {
        supplier: true,
        items: true,
        payment: true,
      },
    });
  }

  async updateStatus(id: string, newStatus: OrderStatus, extraData: Record<string, any> = {}) {
    return prisma.order.update({
      where: { id },
      data: {
        status: newStatus,
        ...extraData,
      },
    });
  }
}

export const orderRepository = new OrderRepository();
