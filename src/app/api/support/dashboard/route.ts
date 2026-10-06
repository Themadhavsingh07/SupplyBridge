import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const agentUserId = req.headers.get('x-user-id') || 'usr_support_default';

    const [myTicketsCount, openTicketsCount, urgentTicketsCount, recentTickets] = await Promise.all([
      prisma.complaint.count({ where: { assignedToId: agentUserId, status: { in: ['ASSIGNED', 'IN_PROGRESS'] } } }),
      prisma.complaint.count({ where: { status: 'OPEN' } }),
      prisma.complaint.count({ where: { priority: 'URGENT', status: { notIn: ['RESOLVED', 'CLOSED'] } } }),
      prisma.complaint.findMany({
        take: 10,
        orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
        include: {
          customer: { select: { id: true, name: true, phone: true } },
          order: { select: { id: true, orderNumber: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        myTicketsCount,
        openTicketsCount,
        urgentTicketsCount,
      },
      recentTickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch support dashboard' }, { status: 500 });
  }
}
