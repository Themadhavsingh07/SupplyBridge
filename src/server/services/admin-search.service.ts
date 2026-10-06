import { prisma } from '@/lib/prisma';

export async function globalAdminSearch(query: string) {
  if (!query || query.trim().length < 2) {
    return { users: [], orders: [], suppliers: [], products: [], complaints: [] };
  }

  const q = query.trim();

  const [users, orders, suppliers, products, complaints] = await Promise.all([
    prisma.user.findMany({
      where: {
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { email: { contains: q, mode: 'insensitive' } },
          { phone: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, phone: true, role: true, status: true },
      take: 5,
    }),
    prisma.order.findMany({
      where: {
        OR: [
          { orderNumber: { contains: q, mode: 'insensitive' } },
          { customer: { name: { contains: q, mode: 'insensitive' } } },
        ],
      },
      select: { id: true, orderNumber: true, total: true, status: true, createdAt: true },
      take: 5,
    }),
    prisma.supplierProfile.findMany({
      where: {
        OR: [
          { businessName: { contains: q, mode: 'insensitive' } },
          { gstNumber: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, businessName: true, verificationStatus: true },
      take: 5,
    }),
    prisma.product.findMany({
      where: {
        name: { contains: q, mode: 'insensitive' },
      },
      select: { id: true, name: true, price: true, status: true },
      take: 5,
    }),
    prisma.complaint.findMany({
      where: {
        OR: [
          { complaintNumber: { contains: q, mode: 'insensitive' } },
          { subject: { contains: q, mode: 'insensitive' } },
        ],
      },
      select: { id: true, complaintNumber: true, subject: true, status: true, priority: true },
      take: 5,
    }),
  ]);

  return { users, orders, suppliers, products, complaints };
}
