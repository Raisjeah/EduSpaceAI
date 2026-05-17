import mongoose from 'mongoose';

const UsageCounterSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  day: { type: String, required: true }, // YYYY-MM-DD (UTC)
  count: { type: Number, default: 0 },
  updatedAt: { type: Date, default: Date.now },
});

UsageCounterSchema.index({ userId: 1, day: 1 }, { unique: true });
// Auto-cleanup counter docs after 14 days (TTL index)
UsageCounterSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 14 });

export default mongoose.models.UsageCounter || mongoose.model('UsageCounter', UsageCounterSchema);
