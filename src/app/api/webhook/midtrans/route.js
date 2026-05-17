import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import User from '@/models/User';
import Plan from '@/models/Plan';

function safeEqual(a, b) {
  try {
    const bufA = Buffer.from(String(a || ''), 'utf8');
    const bufB = Buffer.from(String(b || ''), 'utf8');
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req) {
  try {
    const serverKey = process.env.MIDTRANS_SERVER_KEY;
    if (!serverKey) {
      console.error('[Midtrans Webhook] MIDTRANS_SERVER_KEY not configured');
      return NextResponse.json({ message: 'Server misconfigured' }, { status: 500 });
    }

    const body = await req.json();
    const {
      order_id,
      transaction_status,
      fraud_status,
      signature_key,
      gross_amount,
      status_code,
    } = body;

    if (!order_id || !transaction_status || !signature_key || !gross_amount || !status_code) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Verify signature using a constant-time compare.
    const hash = crypto
      .createHash('sha512')
      .update(order_id + status_code + gross_amount + serverKey)
      .digest('hex');

    if (!safeEqual(hash, signature_key)) {
      console.warn(`[Midtrans Webhook] Invalid signature for order ${order_id}`);
      return NextResponse.json({ message: 'Invalid Signature' }, { status: 400 });
    }

    await dbConnect();
    const subscription = await Subscription.findOne({ midtrans_order_id: order_id });

    if (!subscription) {
      console.warn(`[Midtrans Webhook] Subscription not found for order_id: ${order_id}`);
      return NextResponse.json({ message: 'Subscription not found' }, { status: 404 });
    }

    // Validate gross_amount against the server-recorded amount.
    // Midtrans sends values like "200000.00" — compare as numbers, not strings.
    const expectedAmount = Number(subscription.amount);
    const receivedAmount = Number(gross_amount);
    if (!Number.isFinite(receivedAmount) || Math.abs(receivedAmount - expectedAmount) > 0.5) {
      console.warn(
        `[Midtrans Webhook] gross_amount mismatch for order ${order_id}: expected ${expectedAmount}, got ${receivedAmount}`
      );
      return NextResponse.json({ message: 'Amount mismatch' }, { status: 400 });
    }

    // Idempotency: already finalized as a successful payment.
    if (subscription.payment_status === 'settlement' || subscription.payment_status === 'capture') {
      console.log(`[Midtrans Webhook] Skipping duplicate webhook for ${order_id}`);
      return NextResponse.json({ message: 'Already processed' });
    }

    console.log(`[Midtrans Webhook] Processing ${transaction_status} for order: ${order_id}`);

    subscription.transaction_id = body.transaction_id;

    if (transaction_status === 'settlement' || transaction_status === 'capture') {
      if (fraud_status === 'challenge') {
        subscription.payment_status = 'challenge';
      } else {
        subscription.payment_status = 'settlement';

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

        console.log(
          `[Midtrans Webhook] User ${subscription.user_id} upgraded to ${plan.name} until ${expiredAt.toISOString()}`
        );
      }
    } else {
      // pending / cancel / deny / expire (or anything else): just record the status.
      subscription.payment_status = transaction_status;
    }

    await subscription.save();

    return NextResponse.json({ message: 'OK' });
  } catch (error) {
    console.error('Midtrans Webhook Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
