import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { calculateCartSummary, getOrCreateCart } from '@/lib/cart';
import { createNotification } from '@/lib/notifications';
import { z } from 'zod';

const checkoutSchema = z.object({
  paymentMethod: z.enum(['COD', 'UPI', 'CARD', 'NET_BANKING', 'WALLET']).default('CARD'),
  couponCode: z.string().optional(),
  notes: z.string().optional(),
  deliveryAddress: z.object({
    name: z.string().default('Customer'),
    phone: z.string().default('+91 9876543210'),
    addressLine: z.string().min(1),
    landmark: z.string().optional(),
    city: z.string().min(1),
    state: z.string().min(1),
    postalCode: z.string().min(1),
  }),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {};
    if (session.role === 'CUSTOMER') {
      whereClause.customerId = session.userId;
    } else if (session.role === 'SUPPLIER' && session.supplierId) {
      whereClause.supplierId = session.supplierId;
    } else if (session.role === 'DELIVERY_PARTNER') {
      whereClause.delivery = {
        deliveryPartner: {
          userId: session.userId,
        },
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        supplier: true,
        customer: {
          select: { name: true, phone: true, email: true },
        },
        items: true,
        payment: true,
        delivery: {
          include: {
            deliveryPartner: {
              include: { user: true },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to place an order.' }, { status: 401 });
    }

    const body = await req.json();
    const parse = checkoutSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid checkout payload', details: parse.error.format() }, { status: 400 });
    }

    const { paymentMethod, couponCode, notes, deliveryAddress } = parse.data;
    const cartSummary = await calculateCartSummary(session.userId);

    if (cartSummary.items.length === 0) {
      return NextResponse.json({ error: 'Your cart is empty.' }, { status: 400 });
    }

    let discountAmount = cartSummary.totalDiscount;
    if (couponCode) {
      const coupon = await prisma.coupon.findUnique({
        where: { code: couponCode.toUpperCase() },
      });
      if (coupon && coupon.isActive && new Date() <= coupon.endDate && new Date() >= coupon.startDate) {
        const minOrder = Number(coupon.minOrderAmount || 0);
        if (cartSummary.subtotal >= minOrder) {
          if (coupon.type === 'PERCENTAGE') {
            let disc = (cartSummary.subtotal * Number(coupon.value)) / 100;
            if (coupon.maxDiscount) disc = Math.min(disc, Number(coupon.maxDiscount));
            discountAmount += disc;
          } else {
            discountAmount += Number(coupon.value);
          }

          await prisma.coupon.update({
            where: { id: coupon.id },
            data: { usageCount: { increment: 1 } },
          });
        }
      }
    }

    const primarySupplierId = cartSummary.items[0].supplierId;
    const orderItemsForSupplier = cartSummary.items.filter((i) => i.supplierId === primarySupplierId);

    const subtotal = orderItemsForSupplier.reduce((acc, i) => acc + i.unitPrice * i.quantity, 0);
    const deliveryFee = cartSummary.deliveryFee;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const finalTotal = Math.max(0, subtotal - discountAmount + deliveryFee + tax);

    const orderNumber = 'ORD-' + new Date().getFullYear() + '-' + Math.floor(10000 + Math.random() * 90000);

    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerId: session.userId,
        supplierId: primarySupplierId,
        status: 'PLACED',
        subtotal,
        deliveryFee,
        discount: discountAmount,
        tax,
        total: finalTotal,
        deliveryName: deliveryAddress.name,
        deliveryPhone: deliveryAddress.phone,
        addressLine: deliveryAddress.addressLine,
        landmark: deliveryAddress.landmark || null,
        city: deliveryAddress.city,
        state: deliveryAddress.state,
        postalCode: deliveryAddress.postalCode,
        notes: notes || null,
        items: {
          create: orderItemsForSupplier.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            sku: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: {
        supplier: true,
        items: true,
      },
    });

    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: 'RAZORPAY',
        providerOrderId: 'rzp_order_' + Math.floor(100000 + Math.random() * 900000),
        providerPaymentId: 'rzp_pay_' + Math.floor(100000 + Math.random() * 900000),
        amount: finalTotal,
        status: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
        method: paymentMethod,
        paidAt: paymentMethod === 'COD' ? null : new Date(),
      },
    });

    for (const item of orderItemsForSupplier) {
      await prisma.product.update({
        where: { id: item.productId },
        data: {
          stockQuantity: { decrement: item.quantity },
        },
      });
    }

    const pointsEarned = Math.floor(finalTotal / 10);
    if (pointsEarned > 0) {
      const loyaltyAcc = await prisma.loyaltyAccount.upsert({
        where: { userId: session.userId },
        create: {
          userId: session.userId,
          points: pointsEarned,
          lifetimePoints: pointsEarned,
        },
        update: {
          points: { increment: pointsEarned },
          lifetimePoints: { increment: pointsEarned },
        },
      });

      await prisma.loyaltyTransaction.create({
        data: {
          accountId: loyaltyAcc.id,
          points: pointsEarned,
          type: 'EARNED',
          description: `Earned for order #${orderNumber}`,
          referenceId: order.id,
        },
      });
    }

    const userCart = await getOrCreateCart(session.userId);
    await prisma.cartItem.deleteMany({
      where: {
        cartId: userCart.id,
        productId: { in: orderItemsForSupplier.map((i) => i.productId) },
      },
    });

    await createNotification({
      userId: session.userId,
      title: `Order Placed Successfully! 🎉`,
      body: `Your order #${orderNumber} for ₹${finalTotal} from ${order.supplier.businessName} was placed.`,
      type: 'ORDER',
      linkUrl: `/orders/${order.id}`,
    });

    await createNotification({
      userId: order.supplier.userId,
      title: `New Order Received 📦`,
      body: `New order #${orderNumber} received for ₹${finalTotal}. Click to confirm.`,
      type: 'ORDER',
      linkUrl: `/supplier/orders/${order.id}`,
    });

    return NextResponse.json({
      success: true,
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalAmount: finalTotal,
      pointsEarned,
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to process order' }, { status: 500 });
  }
}
