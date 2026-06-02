import { NextResponse } from 'next/server';
import { getSessionUser } from '@/lib/session';
import { logAgentActivity } from '@/lib/agents/shared/activityLogger';

export async function POST(request) {
  try {
    const user = await getSessionUser();
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const activityId = await logAgentActivity({
      ...body,
      userId: user._id.toString(),
    });

    if (!activityId) {
      return NextResponse.json({ error: 'Failed to log activity' }, { status: 400 });
    }

    return NextResponse.json({ success: true, activityId });
  } catch (error) {
    console.error('Error logging agent activity:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
