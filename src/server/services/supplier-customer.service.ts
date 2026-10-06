import { prisma } from '@/lib/prisma';

export async function listSupplierCustomers(supplierId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit;

  // Aggregate orders grouped by customerId for this supplier
  const customerOrdersGroup = await prisma.order.groupBy({
    by: ['customerId'],
    where: {
      supplierId,
      status: { not: 'CANCELLED' },
    },
    _count: {
      _all: true,
    },
    _sum: {
      total: true,
    },
    _max: {
      createdAt: true,
    },
    _min: {
      createdAt: true,
    },
  });

  const totalCustomersCount = customerOrdersGroup.length;

  // Sort by total revenue descending
  const sortedGroup = customerOrdersGroup.sort(
    (a, b) => Number(b._sum?.total || 0) - Number(a._sum?.total || 0)
  );
  const paginatedGroup = sortedGroup.slice(skip, skip + limit);

  const customerIds = paginatedGroup.map((g) => g.customerId);

  const users = await prisma.user.findMany({
    where: { id: { in: customerIds } },
    select: {
      id: true,
      name: true,
      phone: true,
      email: true,
      createdAt: true,
    },
  });

  const userMap = new Map(users.map((u) => [u.id, u]));

  const customerList = paginatedGroup.map((group) => {
    const userObj = userMap.get(group.customerId);
    const orderCount = group._count?._all || 0;
    const totalSpent = Number(group._sum?.total || 0);

    return {
      customerId: group.customerId,
      name: userObj?.name || 'Customer',
      phone: userObj?.phone || 'N/A',
      email: userObj?.email || 'N/A',
      totalOrders: orderCount,
      totalSpent: Math.round(totalSpent * 100) / 100,
      averageOrderValue: Math.round((totalSpent / (orderCount || 1)) * 100) / 100,
      firstOrderedAt: group._min?.createdAt || null,
      lastOrderedAt: group._max?.createdAt || null,
      isRepeatCustomer: orderCount > 1,
    };
  });

  // Calculate overall metrics
  const totalRevenue = customerOrdersGroup.reduce((acc, g) => acc + Number(g._sum?.total || 0), 0);
  const totalOrders = customerOrdersGroup.reduce((acc, g) => acc + (g._count?._all || 0), 0);
  const repeatCustomersCount = customerOrdersGroup.filter((g) => (g._count?._all || 0) > 1).length;

  return {
    customers: customerList,
    metrics: {
      totalCustomers: totalCustomersCount,
      repeatCustomers: repeatCustomersCount,
      newCustomers: totalCustomersCount - repeatCustomersCount,
      totalOrders,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      averageOrderValue: totalOrders > 0 ? Math.round((totalRevenue / totalOrders) * 100) / 100 : 0,
    },
    pagination: {
      page,
      limit,
      totalCount: totalCustomersCount,
      totalPages: Math.ceil(totalCustomersCount / limit),
    },
  };
}
