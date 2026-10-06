import { prisma } from '@/lib/prisma';

export interface CreateAuditLogInput {
  userId?: string | null;
  action:
    | 'SUPPLIER_APPROVED'
    | 'SUPPLIER_REJECTED'
    | 'SUPPLIER_SUSPENDED'
    | 'USER_SUSPENDED'
    | 'ORDER_CANCELLED'
    | 'REFUND_CREATED'
    | 'COMPLAINT_RESOLVED'
    | 'PRODUCT_DELETED'
    | 'INVENTORY_UPDATED';
  entityType: string;
  entityId?: string | null;
  oldData?: Record<string, any> | null;
  newData?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export async function createAuditLog(input: CreateAuditLogInput) {
  // Sanitize data: remove passwords, tokens, credentials
  const sanitize = (data?: Record<string, any> | null) => {
    if (!data) return null;
    const { password, passwordHash, token, secret, cvv, cardNumber, ...clean } = data;
    return clean;
  };

  try {
    const auditRecord = await prisma.auditLog.create({
      data: {
        userId: input.userId || null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId || null,
        oldData: sanitize(input.oldData) as any,
        newData: sanitize(input.newData) as any,
        ipAddress: input.ipAddress || null,
        userAgent: input.userAgent || null,
      },
    });

    return auditRecord;
  } catch (err) {
    console.error('AuditLog creation error:', err);
    return null;
  }
}
