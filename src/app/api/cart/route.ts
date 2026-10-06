import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { getOrCreateCart, calculateCartSummary } from '@/lib/cart';
import { z } from 'zod';

const addToCartSchema = z.object({
  supplierProductId: z.string().min(1),
  quantity: z.number().int().min(1).default(1),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ items: [], itemCount: 0, subtotal: 0, totalDiscount: 0, deliveryFee: 0, totalAmount: 0 });
    }

    const summary = await calculateCartSummary(session.userId);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('Cart fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to add items to cart.' }, { status: 401 });
    }

    const body = await req.json();
    const productId = body.productId || body.supplierProductId;
    const quantity = body.quantity || 1;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || product.status !== 'ACTIVE') {
      return NextResponse.json({ error: 'Product is currently unavailable.' }, { status: 404 });
    }

    if (product.stockQuantity < quantity) {
      return NextResponse.json({ error: `Only ${product.stockQuantity} units available in stock.` }, { status: 400 });
    }

    const cart = await getOrCreateCart(session.userId);

    const existingItem = await prisma.cartItem.findUnique({
      where: {
        cartId_productId: {
          cartId: cart.id,
          productId,
        },
      },
    });

    if (existingItem) {
      const newQty = Math.min(product.stockQuantity, existingItem.quantity + quantity);
      await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: newQty },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          productId,
          quantity,
          price: product.price,
        },
      });
    }

    const updatedSummary = await calculateCartSummary(session.userId);
    return NextResponse.json({ success: true, ...updatedSummary });
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const cartItemId = searchParams.get('cartItemId');

    const cart = await getOrCreateCart(session.userId);

    if (cartItemId) {
      await prisma.cartItem.deleteMany({
        where: {
          id: cartItemId,
          cartId: cart.id,
        },
      });
    } else {
      // Clear entire cart
      await prisma.cartItem.deleteMany({
        where: { cartId: cart.id },
      });
    }

    const updatedSummary = await calculateCartSummary(session.userId);
    return NextResponse.json({ success: true, ...updatedSummary });
  } catch (error) {
    console.error('Delete cart item error:', error);
    return NextResponse.json({ error: 'Failed to clear item from cart' }, { status: 500 });
  }
}
