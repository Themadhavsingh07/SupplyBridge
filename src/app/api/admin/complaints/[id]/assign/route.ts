import { NextRequest, NextResponse } from 'next/server';
import { updateSupportTicketAssignment } from '@/server/services/admin-support.service';
import { ComplaintAssignmentSchema } from '@/lib/validations/admin';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = ComplaintAssignmentSchema.parse({ ...body, complaintId: id });
    const agentUserId = req.headers.get('x-user-id') || 'usr_support_default';

    const updated = await updateSupportTicketAssignment(
      agentUserId,
      id,
      parsed.assignedToId || null,
      parsed.priority,
      parsed.status
    );

    return NextResponse.json({ ticket: updated, message: 'Ticket assignment & status updated' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update ticket assignment' }, { status: 400 });
  }
}
