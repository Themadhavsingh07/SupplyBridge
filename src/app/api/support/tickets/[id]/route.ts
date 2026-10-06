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
        order: { select: { id: true, orderNumber: true, total: true, status: true } },
        supplier: { select: { id: true, businessName: true } },
        messages: { orderBy: { createdAt: 'asc' } },
        attachments: true,
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
    }

    return NextResponse.json({ ticket });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch ticket' }, { status: 500 });
  }
}
