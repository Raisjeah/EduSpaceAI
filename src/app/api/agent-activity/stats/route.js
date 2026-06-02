import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import AgentActivity from '@/models/AgentActivity';

function getStartDate(timeframe) {
  const now = new Date();
  const startDate = new Date(now);

  switch (timeframe) {
    case '1d':
      startDate.setDate(now.getDate() - 1);
      return startDate;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      return startDate;
    case 'all':
      return new Date(0);
    case '7d':
    default:
      startDate.setDate(now.getDate() - 7);
      return startDate;
  }
}

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { searchParams } = new URL(request.url);
    const timeframe = searchParams.get('timeframe') || '7d';
    const startDate = getStartDate(timeframe);
    const userId = user._id.toString();
    const match = {
      userId,
      createdAt: { $gte: startDate },
    };

    const [agentStats, totalStats, recentActivities] = await Promise.all([
      AgentActivity.aggregate([
        { $match: match },
        {
          $group: {
            _id: '$agentId',
            count: { $sum: 1 },
            avgDuration: { $avg: '$duration' },
            successRate: {
              $avg: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
            totalTokens: { $sum: '$tokensUsed' },
          },
        },
        { $sort: { count: -1 } },
      ]),
      AgentActivity.aggregate([
        { $match: match },
        {
          $group: {
            _id: null,
            totalActivities: { $sum: 1 },
            totalDuration: { $sum: '$duration' },
            totalTokens: { $sum: '$tokensUsed' },
            successCount: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0],
              },
            },
          },
        },
      ]),
      AgentActivity.find(match).sort({ createdAt: -1 }).limit(20).lean(),
    ]);

    return NextResponse.json({
      agentStats: agentStats.map((stat) => ({
        agentId: stat._id,
        count: stat.count,
        avgDuration: stat.avgDuration || 0,
        successRate: stat.successRate || 0,
        totalTokens: stat.totalTokens || 0,
      })),
      totalStats: totalStats[0] || {
        totalActivities: 0,
        totalDuration: 0,
        totalTokens: 0,
        successCount: 0,
      },
      recentActivities: JSON.parse(JSON.stringify(recentActivities)),
    });
  } catch (error) {
    console.error('Error fetching agent stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
