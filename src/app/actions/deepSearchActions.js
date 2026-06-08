'use server';

import { 
  deepSearchStep1_Analyze, 
  deepSearchStep2_SearchAndExtract, 
  deepSearchStep3_AnalyzeContext, 
  deepSearchStep4_Write 
} from '@/lib/agents/deepSearch/workflow';
import { getSessionUser } from '@/lib/core/session';
import { checkUsageLimit } from '@/lib/core/subscription';
import Chat from '@/models/Chat';
import dbConnect from '@/lib/db/mongodb';

export async function runDeepSearchAnalyzer(userQuery, chatId, userId) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  await dbConnect();
  const previousMessages = await Chat.find({ userId: user._id.toString(), chatId }).sort({ createdAt: -1 }).limit(10).lean();
  previousMessages.reverse();
  const historyContext = previousMessages.length > 0
    ? previousMessages.map(h => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.text}`).join('\n')
    : "No previous history.";

  const subQueries = await deepSearchStep1_Analyze(userQuery, historyContext);
  return { subQueries, historyContext };
}

export async function runDeepSearchExtractor(subQueries, userQuery) {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return await deepSearchStep2_SearchAndExtract(subQueries, userQuery);
}

export async function runDeepSearchAnalyst(userQuery, historyContext, structuredContext, fileParts = [], modelName = "gemini-2.5-flash") {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return await deepSearchStep3_AnalyzeContext(userQuery, historyContext, "", structuredContext, modelName, fileParts);
}

export async function runDeepSearchWriter(userQuery, historyContext, factualContext, verifiedSources, fileParts = [], modelName = "gemini-2.5-flash") {
  const user = await getSessionUser();
  if (!user) throw new Error('Unauthorized');
  return await deepSearchStep4_Write(userQuery, historyContext, "", factualContext, verifiedSources, modelName, fileParts);
}
