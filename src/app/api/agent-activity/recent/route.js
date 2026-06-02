import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import AgentActivity from '@/models/AgentActivity';

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const parsedLimit = Number.parseInt(searchParams.get('limit') || '10', 10);
    const limit = Number.isFinite(parsedLimit) ? Math.min(Math.max(parsedLimit, 1), 50) : 10;

    const activities = await AgentActivity.find({
      userId: user._id.toString(),
    })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ activities: JSON.parse(JSON.stringify(activities)) });
  } catch (error) {
    console.error('Error fetching recent activities:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
