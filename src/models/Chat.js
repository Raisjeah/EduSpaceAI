import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema({
  role: { type: String, enum: ['user', 'model'], required: true },
  text: { type: String, required: true },
  userId: { type: String, required: true },
  chatId: { type: String, required: true },
  projectId: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },

  agentId: { type: String, default: 'default', index: true },
  delegatedAgents: [{ type: String }],
  executionTimeMs: { type: Number, default: 0 },
  agentTrace: [{
    agent: String,
    task: String,
    status: { type: String, enum: ['pending', 'running', 'completed', 'failed'] },
    startTime: Date,
    endTime: Date,
    executionTimeMs: { type: Number, default: 0 },
    output: String,
    error: String,
  }],
  isManualSelection: { type: Boolean, default: false },
});

ChatSchema.index({ userId: 1, chatId: 1, createdAt: 1 });
ChatSchema.index({ userId: 1, role: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, projectId: 1, createdAt: -1 });
ChatSchema.index({ userId: 1, agentId: 1, createdAt: -1 });
ChatSchema.index({ 'agentTrace.status': 1 });
// Added index for Sidebar history grouping (aggregated by chatId)
ChatSchema.index({ userId: 1, createdAt: -1, chatId: 1 });

export default mongoose.models.Chat || mongoose.model('Chat', ChatSchema);
