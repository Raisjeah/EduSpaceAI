import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Plan from '@/models/Plan';

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      gross_amount,
      status_code,
    } = body;

    // Verify Signature
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    const hash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (hash !== signature_key) {
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 400 });
    }

    await dbConnect();
    const subscription = await Subscription.findOne({ midtrans_order_id: order_id });

    if (!subscription) {
      console.warn(`[Midtrans Webhook] Subscription not found for order_id: ${order_id}`);
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
    }

    console.log(`[Midtrans Webhook] Processing ${transaction_status} for order: ${order_id}`);

    // Update Subscription Status
    subscription.payment_status = transaction_status;
    subscription.transaction_id = body.transaction_id;

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        subscription.payment_status = 'challenge';
      } else {
        subscription.payment_status = 'settlement';

        // Activate Subscription for User
        const plan = await Plan.findById(subscription.plan_id);
        if (!plan) {
           throw new Error(`Plan not found for ID: ${subscription.plan_id}`);
        }

        const expiredAt = new Date();
        expiredAt.setDate(expiredAt.getDate() + (plan.duration || 30));

        subscription.start_date = new Date();
        subscription.expired_date = expiredAt;

        await User.findByIdAndUpdate(subscription.user_id, {
          current_plan: plan.name,
          plan_expired_at: expiredAt,
          is_active: true,
        });

        console.log(`[Midtrans Webhook] User ${subscription.user_id} upgraded to ${plan.name} until ${expiredAt}`);
      }
    } else if (
      transaction_status === 'cancel' ||
      transaction_status === 'deny' ||
      transaction_status === 'expire'
    ) {
      subscription.payment_status = transaction_status;
    }

    await subscription.save();

    return NextResponse.json({ message: 'OK' });

  } catch (error) {
    console.error('Midtrans Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
