import { prisma } from './prisma';

export async function createNotification({
  userId,
  title,
  body,
  type = 'SYSTEM',
  linkUrl,
}: {
  userId: string;
  title: string;
  body: string;
  type?: 'ORDER' | 'CHAT' | 'DELIVERY' | 'PAYMENT' | 'PROMOTION' | 'COMPLAINT' | 'SYSTEM';
  linkUrl?: string;
}) {
  try {
    const notification = await prisma.notification.create({
      data: {
        recipientId: userId,
        title,
        message: body,
        type: (type as any) || 'SYSTEM',
      },
    });
    return notification;
  } catch (error) {
    console.error('Failed to create notification:', error);
    return null;
  }
}
