import { ActorRole } from './common';

export interface ComplaintCreatedPayload {
  complaintId: string;
  orderId: string;
  customerId: string;
  category: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  createdAt: string;
}

export interface ComplaintAssignedPayload {
  complaintId: string;
  assignedTo: string;
  assignedAt: string;
}

export interface ComplaintStatusChangedPayload {
  complaintId: string;
  previousStatus: string;
  newStatus: string;
  changedBy: string;
  changedAt: string;
}

export interface ComplaintMessageCreatedPayload {
  complaintId: string;
  messageId: string;
  senderId: string;
  senderRole: ActorRole;
  content: string;
  createdAt: string;
}

export interface ComplaintResolvedPayload {
  complaintId: string;
  resolvedBy: string;
  resolution: string;
  resolvedAt: string;
}

export interface ComplaintReopenedPayload {
  complaintId: string;
  reopenedBy: string;
  reason: string;
  reopenedAt: string;
}
