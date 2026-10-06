import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const updateOrderSchema = z.object({
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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        supplier: true,
        customer: {
          select: { id: true, name: true, phone: true, email: true },
        },
        items: true,
        payment: true,
        delivery: {
          include: {
            deliveryPartner: {
              include: { user: true },
            },
            currentLocation: true,
          },
        },
        reviews: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const isCustomerOwner = session.role === 'CUSTOMER' && order.customerId === session.userId;
    const isSupplierOwner = session.role === 'SUPPLIER' && order.supplier.userId === session.userId;
    const isDeliveryOwner = session.role === 'DELIVERY_PARTNER' && order.delivery?.deliveryPartner?.userId === session.userId;
    const isStaff = session.role === 'ADMIN' || session.role === 'SUPPORT_AGENT';

    if (!isCustomerOwner && !isSupplierOwner && !isDeliveryOwner && !isStaff) {
      return NextResponse.json({ error: 'Forbidden. You do not have access to this order.' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order detail error:', error);
    return NextResponse.json({ error: 'Failed to fetch order details' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parse = updateOrderSchema.safeParse(body);

    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid status transition payload' }, { status: 400 });
    }

    const { status, cancellationReason, deliveryPartnerProfileId } = parse.data;

    const order = await prisma.order.findUnique({
      where: { id },
      include: { supplier: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const updateData: any = { status };

    if (status === 'CANCELLED') {
      updateData.cancellationReason = cancellationReason || 'Cancelled by user/supplier';
      updateData.cancelledAt = new Date();
    } else if (status === 'CONFIRMED') {
      updateData.confirmedAt = new Date();
    } else if (status === 'PREPARING') {
      updateData.preparingAt = new Date();
    } else if (status === 'READY_FOR_PICKUP') {
      updateData.readyAt = new Date();
    } else if (status === 'PICKED_UP') {
      updateData.pickedUpAt = new Date();
    } else if (status === 'OUT_FOR_DELIVERY') {
      updateData.outForDeliveryAt = new Date();
    } else if (status === 'DELIVERED') {
      updateData.deliveredAt = new Date();
    }

    const updatedOrder = await prisma.order.update({
      where: { id },
      data: updateData,
      include: {
        supplier: true,
        customer: true,
      },
    });

    if (deliveryPartnerProfileId) {
      await prisma.delivery.upsert({
        where: { orderId: id },
        create: {
          orderId: id,
          deliveryPartnerId: deliveryPartnerProfileId,
          status: status === 'DELIVERED' ? 'COMPLETED' : 'ASSIGNED',
        },
        update: {
          status: status === 'DELIVERED' ? 'COMPLETED' : 'STARTED',
          completedAt: status === 'DELIVERED' ? new Date() : undefined,
        },
      });
    }

    await createNotification({
      userId: order.customerId,
      title: `Order #${order.orderNumber} Status Updated 📦`,
      body: `Your order from ${order.supplier.businessName} is now: ${status.replace(/_/g, ' ')}.`,
      type: 'ORDER',
      linkUrl: `/orders/${order.id}`,
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error('Update order error:', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
