import mongoose from 'mongoose';

const SubscriptionSchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  plan_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
  amount: { type: Number, required: true },
  payment_status: { type: String, default: 'pending', index: true }, // pending, settlement, capture, challenge, cancel, expire, deny
  start_date: { type: Date },
  expired_date: { type: Date },
  midtrans_order_id: { type: String, required: true, unique: true },
  transaction_id: { type: String },
  created_at: { type: Date, default: Date.now },
});

SubscriptionSchema.index({ user_id: 1, payment_status: 1 });
SubscriptionSchema.index({ user_id: 1, created_at: -1 });

export default mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema);
