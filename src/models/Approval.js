import mongoose from 'mongoose';

const ApprovalSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    actionType: { type: String, required: true },
    summary: { type: String, required: true },
    approved: { type: Boolean, required: true, default: false },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Approval || mongoose.model('Approval', ApprovalSchema);
