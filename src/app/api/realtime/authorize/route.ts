import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { authorizeChannelAccess } from '@/lib/realtime/authorization';
import { z } from 'zod';

const authRequestSchema = z.object({
  channelName: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session?.userId) {
      return NextResponse.json(
        { authorized: false, reason: 'Unauthenticated user' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parse = authRequestSchema.safeParse(body);
    if (!parse.success) {
      return NextResponse.json(
        { authorized: false, reason: 'Invalid channelName' },
        { status: 400 }
      );
    }

    const { channelName } = parse.data;

    const authResult = await authorizeChannelAccess(channelName, {
      userId: session.userId,
      role: session.role as any,
    });

    if (!authResult.authorized) {
      return NextResponse.json(
        { authorized: false, channel: channelName, reason: authResult.reason },
        { status: 403 }
      );
    }

    return NextResponse.json({
      authorized: true,
      channel: channelName,
      userId: session.userId,
    });
  } catch (error) {
    console.error('Realtime authorization endpoint error:', error);
    return NextResponse.json(
      { authorized: false, reason: 'Internal authorization error' },
      { status: 500 }
    );
  }
}
