'use server';

import midtransClient from 'midtrans-client';
import dbConnect from '@/lib/mongodb';
import Plan from '@/models/Plan';
import Subscription from '@/models/Subscription';
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
