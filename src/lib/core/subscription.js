import Plan from '@/models/Plan';
import User from '@/models/User';
import UsageCounter from '@/models/UsageCounter';
import dbConnect from '@/lib/db/mongodb';

// Simple in-memory cache for plans
const planCache = {
  data: {},
  lastFetch: 0,
  ttl: 1000 * 60 * 5, // 5 minutes cache
};

async function getCachedPlan(planName) {
  const now = Date.now();
  if (planCache.data[planName] && now - planCache.lastFetch < planCache.ttl) {
    return planCache.data[planName];
  }

  await dbConnect();
  const planDoc = await Plan.findOne({ name: planName }).lean();
  if (planDoc) {
    planCache.data[planName] = planDoc;
    planCache.lastFetch = now;
  }
  return planDoc;
}

export const TIERS = {
  FREE: 'FREE',
  CLASSIC: 'CLASSIC',
  PRO: 'PRO',
  ULTRA: 'ULTRA',
};

// Map plan -> guaranteed-real SDK model slug. IDs are stable for DB / UI selectors
// while the actual underlying model can be swapped without breaking the contract.
export const MODELS = {
  [TIERS.FREE]: 'gemini-2.5-flash',
  [TIERS.CLASSIC]: 'gemini-2.5-pro',
  [TIERS.PRO]: 'gemini-2.5-pro',
  [TIERS.ULTRA]: 'claude-sonnet-4-6',
};

export const MODEL_PERMISSIONS = {
  'gemini-2.5-flash': TIERS.FREE,
  'gemini-2.5-pro': TIERS.CLASSIC,
  'claude-4-6-sonnet': TIERS.ULTRA,
  'gemini-2.5-flash-image': TIERS.ULTRA,
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

// Auto-downgrade a user to FREE when their paid plan has expired.
async function getEffectivePlan(user) {
  if (!user) return 'FREE';
  const expired = user.plan_expired_at && new Date(user.plan_expired_at) < new Date();
  if (expired && user.current_plan !== 'FREE') {
    try {
      await User.findByIdAndUpdate(user._id, {
        current_plan: 'FREE',
        plan_expired_at: null,
      });
    } catch (e) {
      console.error('Failed to auto-downgrade expired plan:', e);
    }
    return 'FREE';
  }
  return user.current_plan || 'FREE';
}

export async function checkFeatureAccess(user, feature) {
  const planName = await getEffectivePlan(user);
  const planDoc = await getCachedPlan(planName);

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

function utcDayKey(date = new Date()) {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, '0');
  const d = String(date.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export async function getDailyUsage(userId) {
  await dbConnect();
  const day = utcDayKey();
  const doc = await UsageCounter.findOne({ userId: String(userId), day }).lean();
  return doc?.count || 0;
}

/**
 * Atomically check-and-increment the daily usage counter for a user.
 * Only increments when the user is under their plan's daily message_limit.
 */
export async function checkUsageLimit(user) {
  const planName = await getEffectivePlan(user);
  let planDoc = await getCachedPlan(planName);
  if (!planDoc) planDoc = { name: 'FREE', message_limit: 20 };

  await dbConnect();

  const day = utcDayKey();
  const userId = String(user._id);

  let updated;
  try {
    updated = await UsageCounter.findOneAndUpdate(
      { userId, day, count: { $lt: planDoc.message_limit } },
      { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
      { new: true, upsert: true }
    );
  } catch (err) {
    // Duplicate key on (userId, day) unique index means another request already
    // upserted a doc that is at-or-over the limit — treat as not allowed.
    if (err?.code === 11000) {
      // Race: another request upserted concurrently. Retry without upsert.
      const retried = await UsageCounter.findOneAndUpdate(
        { userId, day, count: { $lt: planDoc.message_limit } },
        { $inc: { count: 1 }, $set: { updatedAt: new Date() } },
        { new: true }
      );
      if (retried) {
        return {
          allowed: true,
          limit: planDoc.message_limit,
          current: retried.count,
        };
      }
      const current = await getDailyUsage(userId);
      return {
        allowed: false,
        limit: planDoc.message_limit,
        current,
      };
    }
    throw err;
  }

  return {
    allowed: true,
    limit: planDoc.message_limit,
    current: updated.count,
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
