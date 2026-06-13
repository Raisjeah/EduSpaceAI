import mongoose from 'mongoose';

const LoginAttemptSchema = new mongoose.Schema({
  email: { type: String, required: true, index: true },
  count: { type: Number, default: 0 },
  firstAttempt: { type: Date, default: Date.now },
  lastAttempt: { type: Date, default: Date.now }
});

// Auto-expire documents after 10 minutes from first attempt
LoginAttemptSchema.index({ firstAttempt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.models.LoginAttempt || mongoose.model('LoginAttempt', LoginAttemptSchema);
