'use server';

import midtransClient from 'midtrans-client';
import dbConnect from '@/lib/db/mongodb';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import UsageCounter from '@/models/UsageCounter';
import Document from '@/models/Document';
import User from '@/models/User';
import { getSessionUser } from '@/lib/core/session';
import { getCachedPlan, getEffectivePlan, getWindowUsage } from '@/lib/core/subscription';
import { PLAN_NAMES, getPlanDefinition, normalizePlanName, toPlanSeed } from '@/lib/plans';
import crypto from 'crypto';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function createTransaction(planName) {
  try {
    const normalizedPlanName = normalizePlanName(planName);
    const validPlans = PLAN_NAMES.filter((name) => name !== 'FREE');
    if (!validPlans.includes(normalizedPlanName)) {
      throw new Error('Paket tidak valid.');
    }

    await dbConnect();
    const user = await getSessionUser();

    if (!user) {
      throw new Error('Sesi berakhir. Silakan login kembali.');
    }

    const planSeed = toPlanSeed(getPlanDefinition(normalizedPlanName));
    const plan = await Plan.findOneAndUpdate(
      { name: normalizedPlanName },
      { $set: planSeed },
      { upsert: true, new: true, runValidators: true }
    ).lean();

    const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `SUBS-${Date.now()}-${randomStr}`;

    // Apply 70% discount for ULTRA for new users
    let finalPrice = plan.price;
    if (normalizedPlanName === 'ULTRA') {
       // Check if user has previous successful subscriptions
       const prevSub = await Subscription.findOne({
         user_id: user._id,
         payment_status: 'settlement'
       }).lean();

       if (!prevSub) {
         finalPrice = plan.price * 0.3; // 70% discount
       }
    }

    const amount = Math.round(finalPrice);

    const parameter = {
      transaction_details: {
        order_id: orderId,
        gross_amount: amount,
      },
      customer_details: {
        first_name: user.name || 'User',
        email: user.email,
      },
      item_details: [{
        id: plan._id.toString(),
        price: amount,
        quantity: 1,
        name: `EduSpaceAI ${plan.name} Plan`,
      }],
    };

    const transaction = await snap.createTransaction(parameter);

    const newSubscription = new Subscription({
      user_id: user._id,
      plan_id: plan._id,
      amount: amount,
      payment_status: 'pending',
      midtrans_order_id: orderId,
    });

    await newSubscription.save();

    return {
      success: true,
      snapToken: transaction.token,
      orderId: orderId,
    };

  } catch (error) {
    console.error('Midtrans createTransaction error:', error);
    return { success: false, error: error.message };
  }
}

export async function verifyPayment(orderId) {
  try {
    await dbConnect();
    const user = await getSessionUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const statusResponse = await snap.transaction.status(orderId);
    if (!statusResponse || !statusResponse.transaction_status) {
      return { success: false, error: 'Invalid response from Midtrans' };
    }

    const { transaction_status, fraud_status } = statusResponse;

    const subscription = await Subscription.findOne({ midtrans_order_id: orderId });
    if (!subscription) return { success: false, error: 'Subscription not found' };
    if (subscription.user_id.toString() !== user._id.toString()) {
      return { success: false, error: 'Forbidden' };
    }

    // Idempotency
    if (subscription.payment_status === 'settlement' || subscription.payment_status === 'capture') {
      const subscriptionUser = await User.findById(subscription.user_id).lean();
      return { success: true, plan: subscriptionUser?.current_plan || user.current_plan };
    }

    subscription.transaction_id = statusResponse.transaction_id;

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        subscription.payment_status = 'challenge';
      } else {
        subscription.payment_status = 'settlement';
        
        const plan = await Plan.findById(subscription.plan_id);
        if (plan) {
          const expiredAt = new Date();
          expiredAt.setDate(expiredAt.getDate() + (plan.duration || 30));

          subscription.start_date = new Date();
          subscription.expired_date = expiredAt;

          await User.findByIdAndUpdate(subscription.user_id, {
            current_plan: plan.name,
            plan_expired_at: expiredAt,
            is_active: true,
          });
        }
      }
    } else {
      subscription.payment_status = transaction_status;
    }

    await subscription.save();

    if (subscription.payment_status === 'settlement') {
      const updatedUser = await User.findById(user._id).lean();
      return { success: true, plan: updatedUser?.current_plan };
    }

    return { success: false, error: 'Payment not successful yet' };
  } catch (error) {
    console.error('verifyPayment error:', error);
    return { success: false, error: error.message };
  }
}

export async function getSubscriptionStatus() {
  try {
    const user = await getSessionUser();
    const currentPlan = await getEffectivePlan(user);
    return {
      currentPlan,
      planExpiredAt: currentPlan === 'FREE' ? null : user?.plan_expired_at,
    };
  } catch (error) {
    return { currentPlan: 'FREE' };
  }
}

export async function getUserUsageStats() {
  try {
    const user = await getSessionUser();
    if (!user) return null;

    await dbConnect();
    const effectivePlan = await getEffectivePlan(user);
    const plan = await getCachedPlan(effectivePlan);

    // Get daily messages
    const today = new Date().toISOString().split('T')[0];
    const usage = await UsageCounter.findOne({
      userId: user._id.toString(),
      day: today
    }).lean();

    // Get total files
    const fileCount = await Document.countDocuments({ userId: user._id.toString() });

    // Calculate days remaining
    let daysRemaining = 0;
    if (user.plan_expired_at) {
      const expiry = new Date(user.plan_expired_at);
      const now = new Date();
      daysRemaining = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    }

    // Ambil window usage untuk semua fitur
    const userIdStr = user._id.toString();
    const [liveCallUsage, fileUploadUsage, agentUsage] = await Promise.all([
      getWindowUsage(userIdStr, 'live_call', plan?.live_call_window_hours || 24),
      getWindowUsage(userIdStr, 'file_upload', plan?.file_upload_window_hours || 4),
      getWindowUsage(userIdStr, 'agent_request', plan?.agent_window_hours || 4),
    ]);

    return {
      planName: effectivePlan,
      messageLimit: plan?.message_limit || 20,
      messagesUsed: usage?.count || 0,
      fileQuota: plan?.file_upload ? 'Unlimited' : 'Limited (Free)', // Simplified for now
      fileCount: fileCount,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      planExpiry: effectivePlan === 'FREE' ? null : user.plan_expired_at,
      imageUpload: plan?.image_upload || false,
      fileUpload: plan?.file_upload || false,
      liveCall: {
        used: liveCallUsage.used,
        limit: plan?.live_call_minutes_per_window || 0,
        windowResetAt: liveCallUsage.windowResetAt,
        enabled: plan?.live_call_enabled || false,
      },
      fileUploadWindow: {
        used: fileUploadUsage.used,
        limit: plan?.file_upload_per_window || 0,
        windowResetAt: fileUploadUsage.windowResetAt,
      },
      agentRequests: {
        used: agentUsage.used,
        limit: plan?.agent_requests_per_window || 0,
        windowResetAt: agentUsage.windowResetAt,
        enabled: plan?.agent_enabled || false,
      },
    };
  } catch (error) {
    console.error("Failed to get user usage stats:", error);
    return null;
  }
}
