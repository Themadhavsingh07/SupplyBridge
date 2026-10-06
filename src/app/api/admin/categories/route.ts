import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { CategoryCreateSchema } from '@/lib/validations/admin';
import { createAuditLog } from '@/server/services/audit.service';

export async function GET(req: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
      include: {
        parent: { select: { id: true, name: true } },
        children: { select: { id: true, name: true, slug: true } },
        _count: { select: { products: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json({ categories });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to list categories' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CategoryCreateSchema.parse(body);
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const category = await prisma.category.create({
      data: {
        name: parsed.name,
        slug: parsed.slug,
        description: parsed.description || null,
        imageUrl: parsed.imageUrl || null,
        parentId: parsed.parentId || null,
        sortOrder: parsed.sortOrder,
        isActive: parsed.isActive,
      },
    });

    await createAuditLog({
      userId: adminUserId,
      action: 'INVENTORY_UPDATED' as any,
      entityType: 'CATEGORY',
      entityId: category.id,
      newData: category,
    });

    return NextResponse.json({ category, message: 'Category created successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create category' }, { status: 400 });
  }
}
