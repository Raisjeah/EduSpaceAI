import dbConnect from '@/lib/mongodb';
import AgentActivity from '@/models/AgentActivity';

const MAX_TEXT_LENGTH = 1000;

function trimText(value) {
  if (typeof value !== 'string') return value;
  return value.length > MAX_TEXT_LENGTH ? value.slice(0, MAX_TEXT_LENGTH) : value;
}

function normalizeDate(value, fallback = new Date()) {
  return value ? new Date(value) : fallback;
}

function buildActivityPayload(data = {}) {
  const startedAt = normalizeDate(data.startedAt);
  const completedAt = data.completedAt ? new Date(data.completedAt) : undefined;

  return {
    userId: data.userId,
    projectId: data.projectId || undefined,
    chatId: data.chatId || undefined,
    agentId: data.agentId,
    agentName: data.agentName,
    task: trimText(data.task || 'Agent task'),
    originalPrompt: trimText(data.originalPrompt),
    status: data.status,
    startedAt,
    completedAt,
    duration: completedAt ? Math.max(0, completedAt.getTime() - startedAt.getTime()) : undefined,
    output: trimText(data.output),
    error: trimText(data.error),
    workflowId: data.workflowId,
    isMultiAgent: Boolean(data.isMultiAgent),
    workflowAgents: Array.isArray(data.workflowAgents) ? data.workflowAgents : [],
    tokensUsed: data.tokensUsed || 0,
    modelUsed: data.modelUsed,
  };
}

export async function logAgentActivity(data = {}) {
  try {
    if (!data.userId || !data.agentId || !data.agentName || !data.status) {
      return null;
    }

    await dbConnect();
    const payload = buildActivityPayload(data);

    if (data.activityId) {
      const updated = await AgentActivity.findOneAndUpdate(
        { _id: data.activityId, userId: data.userId },
        { $set: payload },
        { new: true }
      ).select('_id');
      return updated?._id?.toString() || null;
    }

    const activity = await AgentActivity.create(payload);
    return activity._id.toString();
  } catch (error) {
    console.error('Error logging agent activity:', error);
    return null;
  }
}
