import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  projectId: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
