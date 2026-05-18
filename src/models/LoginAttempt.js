import mongoose from 'mongoose';

const LoginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
  firstAttempt: { type: Date, default: Date.now },
  lastAttempt: { type: Date, default: Date.now }
});

// Auto-expire documents after 1 hour (longer than the 10-minute window)
LoginAttemptSchema.index({ lastAttempt: 1 }, { expireAfterSeconds: 3600 });

export default mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema);
