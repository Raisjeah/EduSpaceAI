import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, default: 'Anon', trim: true },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
  password: { type: String, required: true },
  image: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },
  current_plan: { type: String, default: 'FREE', index: true },
  plan_expired_at: { type: Date },
  is_active: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
