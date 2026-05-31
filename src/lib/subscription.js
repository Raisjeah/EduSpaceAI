import Plan from '@/models/Plan';
import Chat from '@/models/Chat';
import dbConnect from '@/lib/mongodb';

export const TIERS = {
  FREE: 'FREE',
  CLASSIC: 'CLASSIC',
  PRO: 'PRO',
  ULTRA: 'ULTRA',
};

export const MODELS = {
  [TIERS.FREE]: 'gemini-1.5-flash',
  [TIERS.CLASSIC]: 'gemini-1.5-pro',
  [TIERS.PRO]: 'gemini-1.5-pro',
  [TIERS.ULTRA]: 'claude-3-5-sonnet-20241022',
};

export const MODEL_PERMISSIONS = {
  'gemini-1.5-flash': TIERS.FREE,
  'gemini-1.5-pro': TIERS.CLASSIC,
  'claude-3-5-sonnet-20241022': TIERS.ULTRA,
};

export function getModelByPlan(userPlan) {
  return MODELS[userPlan] || MODELS[TIERS.FREE];
}

export function isModelAllowed(userPlan, modelId) {
  const requiredTier = MODEL_PERMISSIONS[modelId];
  if (!requiredTier) return false;

  const tierHierarchy = {
    [TIERS.FREE]: 0,
    [TIERS.CLASSIC]: 1,
    [TIERS.PRO]: 2,
    [TIERS.ULTRA]: 3,
  };

  return tierHierarchy[userPlan || TIERS.FREE] >= tierHierarchy[requiredTier];
}

export async function checkFeatureAccess(user, feature) {
  await dbConnect();
  const planDoc = await Plan.findOne({ name: user.current_plan || 'FREE' }).lean();

  if (!planDoc) return false;

  switch (feature) {
    case 'image_upload':
      return planDoc.image_upload;
    case 'file_upload':
      return planDoc.file_upload;
    case 'ai_agent':
      return planDoc.ai_agent_level > 0;
    case 'long_memory':
      return planDoc.memory_enabled;
    case 'premium_context':
      return planDoc.name !== 'FREE';
    default:
      return false;
  }
}

export async function getDailyUsage(userId) {
  await dbConnect();
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const count = await Chat.countDocuments({
    userId,
    role: 'user',
    createdAt: { $gte: startOfDay }
  });

  return count;
}

export async function checkUsageLimit(user) {
  await dbConnect();
  let planDoc = await Plan.findOne({ name: user.current_plan || 'FREE' }).lean();
  const currentUsage = await getDailyUsage(user._id);

  // Fallback to FREE if plan not found in DB
  if (!planDoc) {
    planDoc = { name: 'FREE', message_limit: 20 };
  }

  return {
    allowed: currentUsage < planDoc.message_limit,
    limit: planDoc.message_limit,
    current: currentUsage
  };
}

export function getFileSizeLimit(userPlan) {
  switch (userPlan) {
    case TIERS.CLASSIC:
      return 5 * 1024 * 1024; // 5MB
    case TIERS.PRO:
      return 20 * 1024 * 1024; // 20MB
    case TIERS.ULTRA:
      return 100 * 1024 * 1024; // 100MB
    default:
      return 0; // No upload for FREE
  }
}
