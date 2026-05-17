import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  projectId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

ChatSchema.index({ userId: 1, chatId: 1, createdAt: 1 });
ChatSchema.index({ userId: 1, role: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, projectId: 1, createdAt: -1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
