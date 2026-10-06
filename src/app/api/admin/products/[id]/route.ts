import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createAuditLog } from '@/server/services/audit.service';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        supplier: true,
        category: true,
        images: true,
        variants: true,
        inventoryLogs: { take: 5, orderBy: { createdAt: 'desc' } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch product details' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        status: body.status || oldProduct.status,
        name: body.name || oldProduct.name,
      },
    });

    await createAuditLog({
      userId: adminUserId,
      action: 'INVENTORY_UPDATED' as any,
      entityType: 'PRODUCT',
      entityId: id,
      oldData: oldProduct,
      newData: updatedProduct,
    });

    return NextResponse.json({ product: updatedProduct, message: 'Product updated by admin' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update product' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const oldProduct = await prisma.product.findUnique({ where: { id } });
    if (!oldProduct) return NextResponse.json({ error: 'Product not found' }, { status: 404 });

    const deletedProduct = await prisma.product.update({
      where: { id },
      data: { status: 'DELETED' },
    });

    await createAuditLog({
      userId: adminUserId,
      action: 'PRODUCT_DELETED',
      entityType: 'PRODUCT',
      entityId: id,
      oldData: oldProduct,
      newData: { status: 'DELETED' },
    });

    return NextResponse.json({ message: 'Product deactivated/soft-deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete product' }, { status: 500 });
  }
}
