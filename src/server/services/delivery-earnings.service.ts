import { prisma } from '@/lib/prisma';

export async function createDeliveryEarningRecord(params: {
  deliveryPartnerId: string;
  deliveryId: string;
  orderId: string;
  baseFee?: number;
  distanceSurge?: number;
  tip?: number;
}) {
  const { deliveryPartnerId, deliveryId, orderId, baseFee = 40, distanceSurge = 15, tip = 0 } = params;

  const totalEarning = baseFee + distanceSurge + tip;

  return await prisma.$transaction(async (tx) => {
    // 1. Create authoritative audit record in DeliveryEarning
    const earningRecord = await tx.deliveryEarning.create({
      data: {
        deliveryPartnerId,
        deliveryId,
        orderId,
        baseFee,
        distanceSurge,
        tip,
        totalEarning,
        status: 'PAID',
      },
    });

    // 2. Increment DeliveryPartnerProfile aggregate statistics
    await tx.deliveryPartnerProfile.update({
      where: { id: deliveryPartnerId },
      data: {
        totalEarnings: { increment: totalEarning },
        totalDeliveries: { increment: 1 },
      },
    });

    return earningRecord;
  });
}

export async function getDeliveryEarningsSummary(deliveryPartnerId: string) {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const [todayAgg, weekAgg, monthAgg, totalAgg, recentEarnings] = await Promise.all([
    // Today
    prisma.deliveryEarning.aggregate({
      where: { deliveryPartnerId, createdAt: { gte: startOfToday } },
      _sum: { totalEarning: true },
      _count: { _all: true },
    }),
    // Week
    prisma.deliveryEarning.aggregate({
      where: { deliveryPartnerId, createdAt: { gte: startOfWeek } },
      _sum: { totalEarning: true },
    }),
    // Month
    prisma.deliveryEarning.aggregate({
      where: { deliveryPartnerId, createdAt: { gte: startOfMonth } },
      _sum: { totalEarning: true },
    }),
    // Total lifetime
    prisma.deliveryEarning.aggregate({
      where: { deliveryPartnerId },
      _sum: { totalEarning: true },
      _count: { _all: true },
    }),
    // History records
    prisma.deliveryEarning.findMany({
      where: { deliveryPartnerId },
      include: {
        delivery: {
          select: {
            order: { select: { orderNumber: true, deliveryName: true, city: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    }),
  ]);

  const todayEarnings = Number(todayAgg._sum.totalEarning || 0);
  const weekEarnings = Number(weekAgg._sum.totalEarning || 0);
  const monthEarnings = Number(monthAgg._sum.totalEarning || 0);
  const totalEarnings = Number(totalAgg._sum.totalEarning || 0);
  const totalCompleted = totalAgg._count._all || 0;
  const avgEarningsPerDelivery = totalCompleted > 0 ? Math.round((totalEarnings / totalCompleted) * 100) / 100 : 0;

  return {
    todayEarnings,
    todayDeliveries: todayAgg._count._all || 0,
    weekEarnings,
    monthEarnings,
    totalEarnings,
    totalCompleted,
    avgEarningsPerDelivery,
    recentEarnings,
  };
}
