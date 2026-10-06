import { NextRequest, NextResponse } from 'next/server';
import { SystemAnnouncementSchema } from '@/lib/validations/admin';
import { prisma } from '@/lib/prisma';
import { publishRealtimeEvent } from '@/lib/realtime/event-publisher';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = SystemAnnouncementSchema.parse(body);
    const adminUserId = req.headers.get('x-user-id') || 'usr_admin_default';

    const where: any = {};
    if (parsed.targetRole !== 'ALL') {
      where.role = parsed.targetRole;
    }

    const targetUsers = await prisma.user.findMany({
      where,
      select: { id: true },
    });

    if (targetUsers.length > 0) {
      await prisma.notification.createMany({
        data: targetUsers.map((u) => ({
          recipientId: u.id,
          type: parsed.type as any,
          title: parsed.title,
          message: parsed.message,
        })),
      });
    }

    await publishRealtimeEvent({
      eventType: 'SYSTEM_ANNOUNCEMENT' as any,
      actorId: adminUserId,
      actorRole: 'ADMIN',
      entityId: 'broadcast',
      payload: { title: parsed.title, message: parsed.message, targetRole: parsed.targetRole } as any,
    });

    return NextResponse.json({
      message: `System announcement broadcast to ${targetUsers.length} user(s)`,
      sentCount: targetUsers.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to send system announcement' }, { status: 400 });
  }
}
