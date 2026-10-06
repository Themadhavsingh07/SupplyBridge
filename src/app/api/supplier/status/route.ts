import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';
import { ActorRole } from '@/types/realtime';

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supplier = await prisma.supplierProfile.findUnique({
      where: { userId: session.userId },
    });

    if (!supplier) {
      return NextResponse.json({ error: 'Supplier profile not found' }, { status: 404 });
    }

    const body = await req.json();
    const { onlineStatus, isOpen } = body;

    const dataToUpdate: any = {};
    if (onlineStatus && ['ONLINE', 'OFFLINE', 'BUSY'].includes(onlineStatus)) {
      dataToUpdate.onlineStatus = onlineStatus;
    }
    if (isOpen !== undefined) {
      dataToUpdate.isOpen = Boolean(isOpen);
    }

    const updated = await prisma.supplierProfile.update({
      where: { id: supplier.id },
      data: dataToUpdate,
    });

    // Broadcast SUPPLIER_STATUS_CHANGED realtime event
    const channelName = `supplier:${supplier.id}:events`;
    await publishRealtimeEvent({
      eventType: 'SUPPLIER_STATUS_CHANGED',
      actorId: session.userId,
      actorRole: 'SUPPLIER' as ActorRole,
      entityId: supplier.id,
      channelName,
      payload: {
        supplierId: supplier.id,
        onlineStatus: updated.onlineStatus as any,
        isOpen: updated.isOpen,
        updatedAt: new Date().toISOString(),
      } as any,
    });

    return NextResponse.json({ success: true, supplier: updated });
  } catch (error) {
    console.error('Update supplier status error:', error);
    return NextResponse.json({ error: 'Failed to update store status' }, { status: 500 });
  }
}
