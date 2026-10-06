import { prisma } from '@/lib/prisma';
import { createAuditLog } from './audit.service';

export async function listAdminReviews(params: { search?: string; page?: number; limit?: number }) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.search) {
    where.OR = [
      { comment: { contains: params.search, mode: 'insensitive' } },
      { customer: { name: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true } },
        product: { select: { id: true, name: true } },
        supplier: { select: { id: true, businessName: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  return { reviews, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function moderateReview(adminUserId: string, reviewId: string, action: 'HIDE' | 'RESTORE') {
  const review = await prisma.review.findUnique({ where: { id: reviewId } });
  if (!review) throw new Error('Review not found');

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isReported: action === 'HIDE',
    },
  });

  await createAuditLog({
    userId: adminUserId,
    action: action === 'HIDE' ? ('REVIEW_HIDDEN' as any) : ('REVIEW_RESTORED' as any),
    entityType: 'REVIEW',
    entityId: reviewId,
    oldData: { isReported: review.isReported, comment: review.comment },
    newData: { action, isReported: updated.isReported },
  });

  return { success: true, message: `Review ${action === 'HIDE' ? 'hidden' : 'restored'}` };
}
