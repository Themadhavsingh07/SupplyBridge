import { NextRequest, NextResponse } from 'next/server';
import { addSupportInternalNote } from '@/server/services/admin-support.service';
import { ComplaintInternalNoteSchema } from '@/lib/validations/admin';

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();
    const parsed = ComplaintInternalNoteSchema.parse({ ...body, complaintId: id });
    const agentUserId = req.headers.get('x-user-id') || 'usr_support_default';

    const note = await addSupportInternalNote(agentUserId, id, parsed.content);

    return NextResponse.json({ note, message: 'Internal note added' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to add internal note' }, { status: 400 });
  }
}
