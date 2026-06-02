import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { getSessionUser } from '@/lib/session';
import Chat from '@/models/Chat';

function getStartDate(timeRange) {
  const now = new Date();
  if (timeRange === '30d') return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  if (timeRange === 'all') return new Date(0);
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
}

function getActivityStatus(agentTrace = []) {
  if (agentTrace.some((trace) => trace.status === 'failed')) return 'failed';
  if (agentTrace.some((trace) => trace.status === 'running' || trace.status === 'pending')) return 'running';
  return 'completed';
}

export async function GET(request) {
  try {
    const user = await getSessionUser();
    if (!user?._id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('timeRange') || '7d';
    const agentId = searchParams.get('agentId');
    const userId = user._id.toString();
    const match = {
      userId,
      role: 'model',
      createdAt: { $gte: getStartDate(timeRange) },
    };

    if (agentId) match.agentId = agentId;

    const addTraceStats = {
      $addFields: {
        traceItems: { $ifNull: ['$agentTrace', []] },
        failedTraceCount: {
          $size: {
            $filter: {
              input: { $ifNull: ['$agentTrace', []] },
              as: 'trace',
              cond: { $eq: ['$$trace.status', 'failed'] },
            },
          },
        },
      },
    };

    const [totalStats, perAgentStats, recentChats] = await Promise.all([
      Chat.aggregate([
        { $match: match },
        addTraceStats,
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            avgExecutionTime: { $avg: '$executionTimeMs' },
            successCount: {
              $sum: {
                $cond: [{ $eq: ['$failedTraceCount', 0] }, 1, 0],
              },
            },
          },
        },
      ]),
      Chat.aggregate([
        { $match: match },
        addTraceStats,
        {
          $group: {
            _id: '$agentId',
            tasksCompleted: { $sum: 1 },
            avgTime: { $avg: '$executionTimeMs' },
            successRate: {
              $avg: {
                $cond: [{ $eq: ['$failedTraceCount', 0] }, 1, 0],
              },
            },
          },
        },
        { $sort: { tasksCompleted: -1 } },
      ]),
      Chat.find(match)
        .sort({ createdAt: -1 })
        .limit(20)
        .select('agentId text executionTimeMs agentTrace delegatedAgents createdAt isManualSelection')
        .lean(),
    ]);

    const totals = totalStats[0] || { totalTasks: 0, avgExecutionTime: 0, successCount: 0 };
    const totalTasks = totals.totalTasks || 0;

    return NextResponse.json({
      totals: {
        totalTasks,
        avgExecutionTime: totals.avgExecutionTime || 0,
        successRate: totalTasks > 0 ? (totals.successCount / totalTasks) * 100 : 0,
      },
      perAgent: perAgentStats.map((stat) => ({
        _id: stat._id || 'default',
        agentId: stat._id || 'default',
        tasksCompleted: stat.tasksCompleted || 0,
        avgTime: stat.avgTime || 0,
        successRate: (stat.successRate || 0) * 100,
      })),
      recentActivities: recentChats.map((chat) => ({
        _id: chat._id?.toString(),
        agentId: chat.agentId || 'default',
        delegatedAgents: chat.delegatedAgents || [],
        task: chat.agentTrace?.[0]?.task || chat.text?.substring(0, 120) || 'Agent response',
        status: getActivityStatus(chat.agentTrace || []),
        executionTime: chat.executionTimeMs || 0,
        timestamp: chat.createdAt,
        isManualSelection: Boolean(chat.isManualSelection),
        trace: chat.agentTrace || [],
      })),
    });
  } catch (error) {
    console.error('Error fetching agent activity:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
