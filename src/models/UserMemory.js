import mongoose from 'mongoose';

const UserMemorySchema = new mongoose.Schema({
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  content: { type: String, required: true, maxlength: 5000 },
  tags: [{ type: String }],
  created_at: { type: Date, default: Date.now },
});

UserMemorySchema.index({ user_id: 1, created_at: -1 });

export default mongoose.models.UserMemory || mongoose.model('UserMemory', UserMemorySchema);
