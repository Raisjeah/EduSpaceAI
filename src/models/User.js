import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'Anon' },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  current_plan: { type: String, default: 'FREE' },
  plan_expired_at: { type: Date },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
