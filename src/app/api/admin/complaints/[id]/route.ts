import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const ticket = await prisma.complaint.findUnique({
      where: { id },
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: {
          include: {
            items: true,
            supplier: { select: { id: true, businessName: true } },
            delivery: { include: { deliveryPartner: { include: { user: { select: { name: true, phone: true } } } } } },
          },
        },
        supplier: { select: { id: true, businessName: true } },
        messages: { orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Complaint ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch ticket details' }, { status: 500 });
  }
}
