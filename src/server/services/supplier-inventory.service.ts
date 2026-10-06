import { prisma } from '@/lib/prisma';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';
import { ActorRole } from '@/types/realtime';

export async function listSupplierInventory(params: {
  supplierId: string;
  search?: string;
  stockFilter?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
  page?: number;
  limit?: number;
}) {
  const { supplierId, search, stockFilter = 'all', page = 1, limit = 20 } = params;
  const skip = (page - 1) * limit;

  const where: any = {
    supplierId,
    status: { not: 'DELETED' },
  };

  if (search && search.trim()) {
    where.OR = [
      { name: { contains: search.trim(), mode: 'insensitive' } },
      { sku: { contains: search.trim(), mode: 'insensitive' } },
    ];
  }

  const allProducts = await prisma.product.findMany({
    where,
    include: {
      category: { select: { name: true } },
      inventoryLogs: { orderBy: { createdAt: 'desc' }, take: 1 },
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Filter in memory for precise low_stock vs out_of_stock comparisons with thresholds
  let filtered = allProducts;
  if (stockFilter === 'out_of_stock') {
    filtered = allProducts.filter((p) => p.stockQuantity === 0);
  } else if (stockFilter === 'low_stock') {
    filtered = allProducts.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold);
  } else if (stockFilter === 'in_stock') {
    filtered = allProducts.filter((p) => p.stockQuantity > p.lowStockThreshold);
  }

  const paginated = filtered.slice(skip, skip + limit);

  return {
    items: paginated,
    pagination: {
      page,
      limit,
      totalCount: filtered.length,
      totalPages: Math.ceil(filtered.length / limit),
    },
  };
}

export async function adjustSupplierStock(params: {
  supplierId: string;
  productId: string;
  quantityChange: number;
  reason: string;
  newThreshold?: number;
  actorUserId: string;
}) {
  const { supplierId, productId, quantityChange, reason, newThreshold, actorUserId } = params;

  // Verify product ownership
  const product = await prisma.product.findFirst({
    where: { id: productId, supplierId },
  });

  if (!product) {
    throw new Error('Product not found or access denied');
  }

  const currentStock = product.stockQuantity;
  const targetStock = currentStock + quantityChange;

  if (targetStock < 0) {
    throw new Error(`Insufficient stock. Current: ${currentStock}, adjustment: ${quantityChange}`);
  }

  const thresholdToUse = newThreshold !== undefined ? newThreshold : product.lowStockThreshold;

  // Execute database update & log in single atomic transaction
  const updatedProduct = await prisma.$transaction(async (tx) => {
    const updated = await tx.product.update({
      where: { id: productId },
      data: {
        stockQuantity: targetStock,
        lowStockThreshold: thresholdToUse,
      },
    });

    await tx.inventoryLog.create({
      data: {
        productId,
        previousQuantity: currentStock,
        changeQuantity: quantityChange,
        newQuantity: targetStock,
        reason,
      },
    });

    return updated;
  });

  // Emit realtime inventory event after successful DB transaction
  try {
    let eventType: 'INVENTORY_UPDATED' | 'INVENTORY_LOW_STOCK' | 'INVENTORY_OUT_OF_STOCK' | 'INVENTORY_RESTOCKED' =
      'INVENTORY_UPDATED';

    if (targetStock === 0) {
      eventType = 'INVENTORY_OUT_OF_STOCK';
    } else if (targetStock <= thresholdToUse && currentStock > thresholdToUse) {
      eventType = 'INVENTORY_LOW_STOCK';
    } else if (quantityChange > 0) {
      eventType = 'INVENTORY_RESTOCKED';
    }

    await publishRealtimeEvent({
      eventType,
      actorId: actorUserId,
      actorRole: 'SUPPLIER' as ActorRole,
      entityId: productId,
      payload: {
        productId,
        supplierId,
        productName: updatedProduct.name,
        previousQuantity: currentStock,
        newQuantity: targetStock,
        threshold: thresholdToUse,
        updatedAt: new Date().toISOString(),
      } as any,
    });
  } catch (err) {
    console.error('Failed to publish inventory realtime event:', err);
  }

  return updatedProduct;
}
