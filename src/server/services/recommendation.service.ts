import { prisma } from '@/lib/prisma';

export async function getFrequentlyBoughtTogether(productId: string, limit: number = 4) {
  const currentProduct = await prisma.product.findUnique({ where: { id: productId } });
  if (!currentProduct) return [];

  // Find products in the same category or supplier
  const related = await prisma.product.findMany({
    where: {
      id: { not: productId },
      categoryId: currentProduct.categoryId,
      status: 'ACTIVE',
      stockQuantity: { gt: 0 },
    },
    include: {
      supplier: { select: { id: true, businessName: true } },
      images: { take: 1 },
    },
    take: limit,
  });

  return related;
}

export async function getPopularNearYou(city?: string, limit: number = 6) {
  const where: any = { status: 'ACTIVE', stockQuantity: { gt: 0 } };
  if (city) {
    where.supplier = { city: { contains: city, mode: 'insensitive' } };
  }

  return await prisma.product.findMany({
    where,
    include: {
      supplier: { select: { id: true, businessName: true, rating: true } },
      images: { take: 1 },
    },
    orderBy: [{ rating: 'desc' }, { stockQuantity: 'desc' }],
    take: limit,
  });
}

export async function getBuyAgainProducts(userId: string, limit: number = 6) {
  if (!userId) return [];

  const pastOrders = await prisma.order.findMany({
    where: { customerId: userId, status: 'DELIVERED' },
    select: {
      items: { select: { productId: true } },
    },
    take: 5,
  });

  const productIds = Array.from(
    new Set(pastOrders.flatMap((o) => o.items.map((i) => i.productId)))
  );

  if (productIds.length === 0) return [];

  return await prisma.product.findMany({
    where: { id: { in: productIds }, status: 'ACTIVE' },
    include: {
      supplier: { select: { id: true, businessName: true } },
      images: { take: 1 },
    },
    take: limit,
  });
}

export async function getSupplierRecommendations(categoryQuery?: string, limit: number = 5) {
  const where: any = { verificationStatus: 'VERIFIED' };

  if (categoryQuery) {
    where.products = {
      some: {
        category: { name: { contains: categoryQuery, mode: 'insensitive' } },
      },
    };
  }

  const suppliers = await prisma.supplierProfile.findMany({
    where,
    include: {
      _count: { select: { products: true, orders: true } },
    },
    orderBy: [{ rating: 'desc' }, { totalOrders: 'desc' }],
    take: limit,
  });

  return suppliers.map((s) => ({
    supplierId: s.id,
    businessName: s.businessName,
    city: s.city,
    rating: Number(s.rating || 4.8),
    totalOrders: s.totalOrders,
    productCount: s._count.products,
    reason: `Highly rated verified supplier with ${s.totalOrders}+ orders fulfilled.`,
  }));
}
