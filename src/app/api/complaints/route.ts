import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { z } from 'zod';

const complaintSchema = z.object({
  orderId: z.string().optional(),
  supplierId: z.string().optional(),
  category: z.enum([
    'WRONG_PRODUCT',
    'DAMAGED_PRODUCT',
    'MISSING_PRODUCT',
    'LATE_DELIVERY',
    'PAYMENT',
    'SUPPLIER',
    'DELIVERY_PARTNER',
    'REFUND',
    'OTHER',
  ]),
  subject: z.string().min(3).default('Complaint Issue'),
  description: z.string().min(10),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
});

export async function GET() {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const whereClause: any = {};
    if (session.role === 'CUSTOMER') {
      whereClause.customerId = session.userId;
    } else if (session.role === 'SUPPLIER' && session.supplierId) {
      whereClause.supplierId = session.supplierId;
    } else if (session.role === 'SUPPORT_AGENT') {
      whereClause.OR = [{ assignedToId: session.userId }, { assignedToId: null }];
    }

    const complaints = await prisma.complaint.findMany({
      where: whereClause,
      include: {
        customer: { select: { name: true, email: true, phone: true } },
        supplier: { select: { businessName: true } },
        order: { select: { orderNumber: true, total: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ complaints });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch complaints' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Please log in to raise a complaint.' }, { status: 401 });
    }

    const body = await req.json();
    const parse = complaintSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json({ error: 'Invalid complaint payload', details: parse.error.format() }, { status: 400 });
    }

    const complaintNumber = 'TKT-' + Math.floor(10000 + Math.random() * 90000);

    const complaint = await prisma.complaint.create({
      data: {
        complaintNumber,
        customerId: session.userId,
        supplierId: parse.data.supplierId || null,
        orderId: parse.data.orderId || null,
        category: parse.data.category,
        subject: parse.data.subject,
        description: parse.data.description,
        priority: parse.data.priority,
        messages: {
          create: [
            {
              senderId: session.userId,
              message: parse.data.description,
            },
          ],
        },
      },
    });

    return NextResponse.json({ success: true, complaint });
  } catch (error) {
    console.error('Create complaint error:', error);
    return NextResponse.json({ error: 'Failed to create complaint ticket' }, { status: 500 });
  }
}
