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
  is_first_login: { type: Boolean, default: true },
  profile: {
    faculty: { type: String, default: '' },
    major: { type: String, default: '' },
    skills_to_learn: [{ type: String }],
    education_level: { type: String, default: '' },
    learning_goal: { type: String, default: '' }
  },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
