import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    status: {
      type: String,
      enum: ['analyzing', 'drafting', 'waiting_approval', 'completed'],
      default: 'analyzing',
    },
    objective: { type: String, required: true },
    createdBy: { type: String, required: true },
    conversationId: { type: String, required: false, default: 'default' },
    documentIds: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);
