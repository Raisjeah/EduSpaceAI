'use server';

import midtransClient from 'midtrans-client';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
import UsageCounter from '@/models/UsageCounter';
import Document from '@/models/Document';
import { getSessionUser } from '@/lib/session';
import crypto from 'crypto';

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export async function createTransaction(planName) {
  try {
    const validPlans = ['CLASSIC', 'PRO', 'ULTRA'];
    if (!validPlans.includes(planName)) {
      throw new Error('Paket tidak valid.');
    }

    await dbConnect();
    const user = await getSessionUser();

    if (!user) {
      throw new Error('Sesi berakhir. Silakan login kembali.');
    }

    const userId = user._id.toString();
    const plan = await Plan.findOne({ name: planName }).lean();

    if (!plan) {
      throw new Error('Data paket tidak ditemukan di database.');
    }

    const randomStr = crypto.randomBytes(4).toString('hex').toUpperCase();
    const orderId = `SUBS-${Date.now()}-${randomStr}`;

    // Apply 70% discount for ULTRA for new users
    let finalPrice = plan.price;
    if (planName === 'ULTRA') {
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

export async function getSubscriptionStatus() {
  try {
    const user = await getSessionUser();
    return {
      currentPlan: user?.current_plan || 'FREE',
      planExpiredAt: user?.plan_expired_at,
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
    const plan = await Plan.findOne({ name: user.current_plan || 'FREE' }).lean();

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

    return {
      planName: user.current_plan || 'FREE',
      messageLimit: plan?.message_limit || 20,
      messagesUsed: usage?.count || 0,
      fileQuota: plan?.file_upload ? 'Unlimited' : 'Limited (Free)', // Simplified for now
      fileCount: fileCount,
      daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
      planExpiry: user.plan_expired_at,
      imageUpload: plan?.image_upload || false,
      fileUpload: plan?.file_upload || false
    };
  } catch (error) {
    console.error("Failed to get user usage stats:", error);
    return null;
  }
}
