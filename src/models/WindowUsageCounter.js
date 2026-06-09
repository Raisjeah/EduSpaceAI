import mongoose from 'mongoose';

const WindowUsageCounterSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  feature: { type: String, required: true }, // 'live_call', 'file_upload', 'agent_request'
  windowStart: { type: Date, required: true },
  windowDurationMs: { type: Number, required: true }, // durasi window dalam ms
  usedAmount: { type: Number, default: 0 }, // menit untuk live_call, count untuk lainnya
  updatedAt: { type: Date, default: Date.now },
});

// Compound index untuk lookup cepat
WindowUsageCounterSchema.index({ userId: 1, feature: 1, windowStart: 1 });
// Auto-cleanup setelah 7 hari
WindowUsageCounterSchema.index({ updatedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 7 });

export default mongoose.models.WindowUsageCounter || mongoose.model('WindowUsageCounter', WindowUsageCounterSchema);
