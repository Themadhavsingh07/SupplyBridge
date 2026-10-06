import { prisma } from '@/lib/prisma';
import { ComplaintPriority, ComplaintStatus } from '@prisma/client';
import { createAuditLog } from './audit.service';

export async function listSupportTickets(params: {
  status?: ComplaintStatus;
  priority?: ComplaintPriority;
  assignedToId?: string;
  search?: string;
  page?: number;
  limit?: number;
}) {
  const page = params.page || 1;
  const limit = params.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};
  if (params.status) where.status = params.status;
  if (params.priority) where.priority = params.priority;
  if (params.assignedToId) where.assignedToId = params.assignedToId;
  if (params.search) {
    where.OR = [
      { complaintNumber: { contains: params.search, mode: 'insensitive' } },
      { subject: { contains: params.search, mode: 'insensitive' } },
      { customer: { name: { contains: params.search, mode: 'insensitive' } } },
    ];
  }

  const [tickets, total] = await Promise.all([
    prisma.complaint.findMany({
      where,
      include: {
        customer: { select: { id: true, name: true, email: true, phone: true } },
        order: { select: { id: true, orderNumber: true, total: true } },
        supplier: { select: { id: true, businessName: true } },
        messages: { orderBy: { createdAt: 'asc' } },
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
      skip,
      take: limit,
    }),
    prisma.complaint.count({ where }),
  ]);

  return { tickets, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function updateSupportTicketAssignment(
  agentUserId: string,
  complaintId: string,
  assignedToId: string | null,
  priority?: ComplaintPriority,
  status?: ComplaintStatus
) {
  const ticket = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!ticket) throw new Error('Complaint ticket not found');

  const oldData = { assignedToId: ticket.assignedToId, priority: ticket.priority, status: ticket.status };

  const dataToUpdate: any = {};
  if (assignedToId !== undefined) dataToUpdate.assignedToId = assignedToId;
  if (priority) dataToUpdate.priority = priority;
  if (status) {
    dataToUpdate.status = status;
    if (status === 'RESOLVED') dataToUpdate.resolvedAt = new Date();
  }

  const updatedTicket = await prisma.complaint.update({
    where: { id: complaintId },
    data: dataToUpdate,
  });

  await createAuditLog({
    userId: agentUserId,
    action: status === 'RESOLVED' ? 'COMPLAINT_RESOLVED' as any : 'COMPLAINT_ASSIGNED' as any,
    entityType: 'COMPLAINT',
    entityId: complaintId,
    oldData,
    newData: dataToUpdate,
  });

  return updatedTicket;
}

export async function addSupportInternalNote(
  agentUserId: string,
  complaintId: string,
  noteContent: string
) {
  const ticket = await prisma.complaint.findUnique({ where: { id: complaintId } });
  if (!ticket) throw new Error('Ticket not found');

  const message = await prisma.complaintMessage.create({
    data: {
      complaintId,
      senderId: agentUserId,
      message: `[INTERNAL NOTE]: ${noteContent}`,
      isInternal: true,
    },
  });

  return message;
}
