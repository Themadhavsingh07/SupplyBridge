import { prisma } from '@/lib/prisma';

export async function getSupplierDashboardMetrics(supplierId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const [
    todayOrdersCount,
    pendingOrdersCount,
    todayRevenueResult,
    totalRevenueResult,
    activeProductsCount,
    lowStockCount,
    supplierProfile,
  ] = await Promise.all([
    // Today's orders
    prisma.order.count({
      where: {
        supplierId,
        createdAt: { gte: startOfToday },
      },
    }),
    // Pending orders (PLACED, CONFIRMED, PREPARING)
    prisma.order.count({
      where: {
        supplierId,
        status: { in: ['PLACED', 'CONFIRMED', 'PREPARING'] },
      },
    }),
    // Today's revenue
    prisma.order.aggregate({
      where: {
        supplierId,
        createdAt: { gte: startOfToday },
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
    // Total revenue
    prisma.order.aggregate({
      where: {
        supplierId,
        status: { not: 'CANCELLED' },
      },
      _sum: { total: true },
    }),
    // Active products
    prisma.product.count({
      where: {
        supplierId,
        status: 'ACTIVE',
      },
    }),
    // Low stock products count
    prisma.product.count({
      where: {
        supplierId,
        status: 'ACTIVE',
        stockQuantity: { lte: 5 }, // default fallback threshold
      },
    }),
    // Supplier profile rating
    prisma.supplierProfile.findUnique({
      where: { id: supplierId },
      select: { rating: true, totalRatings: true, onlineStatus: true, isOpen: true },
    }),
  ]);

  return {
    todayOrders: todayOrdersCount,
    pendingOrders: pendingOrdersCount,
    todayRevenue: Number(todayRevenueResult._sum?.total || 0),
    totalRevenue: Number(totalRevenueResult._sum?.total || 0),
    activeProducts: activeProductsCount,
    lowStockProducts: lowStockCount,
    rating: Number(supplierProfile?.rating || 0),
    totalRatings: supplierProfile?.totalRatings || 0,
    onlineStatus: supplierProfile?.onlineStatus || 'OFFLINE',
    isOpen: supplierProfile?.isOpen ?? true,
  };
}

export async function getSupplierAnalytics(supplierId: string, range: 'today' | '7d' | '30d' | '90d' = '30d') {
  const now = new Date();
  let startDate = new Date();

  if (range === 'today') {
    startDate.setHours(0, 0, 0, 0);
  } else if (range === '7d') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === '30d') {
    startDate.setDate(now.getDate() - 30);
  } else if (range === '90d') {
    startDate.setDate(now.getDate() - 90);
  }

  // 1. Orders breakdown by status
  const ordersByStatusGroup = await prisma.order.groupBy({
    by: ['status'],
    where: {
      supplierId,
      createdAt: { gte: startDate },
    },
    _count: { _all: true },
    _sum: { total: true },
  });

  const orderStatusDistribution = ordersByStatusGroup.map((item) => ({
    status: item.status,
    count: item._count?._all || 0,
    revenue: Number(item._sum?.total || 0),
  }));

  // 2. Daily revenue time series aggregation
  const recentOrders = await prisma.order.findMany({
    where: {
      supplierId,
      createdAt: { gte: startDate },
      status: { not: 'CANCELLED' },
    },
    select: {
      createdAt: true,
      total: true,
    },
  });

  // Group by Date string (YYYY-MM-DD)
  const timeSeriesMap = new Map<string, { date: string; revenue: number; orders: number }>();
  recentOrders.forEach((o) => {
    const dateStr = o.createdAt.toISOString().split('T')[0];
    const current = timeSeriesMap.get(dateStr) || { date: dateStr, revenue: 0, orders: 0 };
    current.revenue += Number(o.total || 0);
    current.orders += 1;
    timeSeriesMap.set(dateStr, current);
  });

  const revenueTimeSeries = Array.from(timeSeriesMap.values()).sort((a, b) => a.date.localeCompare(b.date));

  // 3. Top selling products
  const topOrderItems = await prisma.orderItem.groupBy({
    by: ['productId'],
    where: {
      order: {
        supplierId,
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' },
      },
    },
    _sum: {
      quantity: true,
      totalPrice: true,
    },
    orderBy: {
      _sum: {
        totalPrice: 'desc',
      },
    },
    take: 10,
  });

  const productIds = topOrderItems.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true, sku: true, images: { take: 1, orderBy: { sortOrder: 'asc' } } },
  });

  const productMap = new Map(products.map((p) => [p.id, p]));

  const topProducts = topOrderItems.map((item) => {
    const p = productMap.get(item.productId);
    return {
      id: item.productId,
      name: p?.name || 'Unknown Product',
      sku: p?.sku || 'N/A',
      imageUrl: p?.images[0]?.url || null,
      unitsSold: item._sum?.quantity || 0,
      totalRevenue: Number(item._sum?.totalPrice || 0),
    };
  });

  // 4. Summary totals for range
  const totalOrders = orderStatusDistribution.reduce((acc, curr) => acc + curr.count, 0);
  const totalRevenue = orderStatusDistribution
    .filter((d) => d.status !== 'CANCELLED')
    .reduce((acc, curr) => acc + curr.revenue, 0);
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    range,
    startDate: startDate.toISOString(),
    summary: {
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    },
    orderStatusDistribution,
    revenueTimeSeries,
    topProducts,
  };
}
