import { prisma } from '@/lib/prisma';

export async function getAdminDashboardStats() {
  const [
    totalCustomers,
    activeCustomers,
    totalSuppliers,
    verifiedSuppliers,
    pendingSuppliers,
    deliveryPartners,
    activeDeliveries,
    todayOrders,
    revenueAggr,
    pendingComplaints,
    refundsAggr,
  ] = await Promise.all([
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.user.count({ where: { role: 'CUSTOMER', status: 'ACTIVE' } }),
    prisma.supplierProfile.count(),
    prisma.supplierProfile.count({ where: { verificationStatus: 'VERIFIED' } }),
    prisma.supplierProfile.count({ where: { verificationStatus: 'PENDING' } }),
    prisma.deliveryPartnerProfile.count(),
    prisma.delivery.count({
      where: {
        status: { in: ['ASSIGNED', 'ACCEPTED', 'STARTED', 'ARRIVED_AT_SUPPLIER', 'PICKUP_CONFIRMED', 'ARRIVED_AT_CUSTOMER'] },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: { status: 'DELIVERED' },
    }),
    prisma.complaint.count({ where: { status: { in: ['OPEN', 'ASSIGNED', 'IN_PROGRESS'] } } }),
    prisma.refund.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    }),
  ]);

  const grossRevenue = Number(revenueAggr._sum?.total || 0);
  const totalRefunds = Number(refundsAggr._sum?.amount || 0);
  const platformCommission = Math.round(grossRevenue * 0.10);

  return {
    totalCustomers,
    activeCustomers,
    totalSuppliers,
    verifiedSuppliers,
    pendingSuppliers,
    deliveryPartners,
    activeDeliveries,
    todayOrders,
    grossRevenue,
    totalRefunds,
    platformCommission,
    pendingComplaints,
  };
}

export async function getAdminAnalyticsData(range: string = 'monthly') {
  const now = new Date();
  let startDate = new Date();

  if (range === 'daily') {
    startDate.setDate(now.getDate() - 1);
  } else if (range === 'weekly') {
    startDate.setDate(now.getDate() - 7);
  } else if (range === 'monthly') {
    startDate.setDate(now.getDate() - 30);
  } else if (range === 'yearly') {
    startDate.setFullYear(now.getFullYear() - 1);
  }

  const [ordersByStatus, suppliersByStatus, deliveryStats, complaintStats] = await Promise.all([
    prisma.order.groupBy({
      by: ['status'],
      _count: { id: true },
      _sum: { total: true },
    }),
    prisma.supplierProfile.groupBy({
      by: ['verificationStatus'],
      _count: { id: true },
    }),
    prisma.delivery.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
    prisma.complaint.groupBy({
      by: ['status'],
      _count: { id: true },
    }),
  ]);

  return {
    range,
    ordersByStatus: ordersByStatus.map((o) => ({
      status: o.status,
      count: o._count.id,
      amount: Number(o._sum?.total || 0),
    })),
    suppliersByStatus: suppliersByStatus.map((s) => ({
      status: s.verificationStatus,
      count: s._count.id,
    })),
    deliveryStats: deliveryStats.map((d) => ({
      status: d.status,
      count: d._count.id,
    })),
    complaintStats: complaintStats.map((c) => ({
      status: c.status,
      count: c._count.id,
    })),
  };
}

export async function getAdminFinancials() {
  const [orders, refunds, payouts] = await Promise.all([
    prisma.order.aggregate({
      _sum: { total: true },
      _count: { id: true },
      where: { status: 'DELIVERED' },
    }),
    prisma.refund.aggregate({
      _sum: { amount: true },
      where: { status: 'SUCCESS' },
    }),
    prisma.deliveryEarning.aggregate({
      _sum: { totalEarning: true },
    }),
  ]);

  const gmv = Number(orders._sum?.total || 0);
  const totalRefunds = Number(refunds._sum?.amount || 0);
  const totalDeliveryPayouts = Number(payouts._sum?.totalEarning || 0);
  const platformCommission = Math.round(gmv * 0.12);
  const netRevenue = Math.max(0, platformCommission - totalRefunds);

  return {
    gmv,
    totalOrders: orders._count?.id || 0,
    totalRefunds,
    totalDeliveryPayouts,
    platformCommission,
    netRevenue,
  };
}
