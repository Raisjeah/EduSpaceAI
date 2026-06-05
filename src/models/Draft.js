import mongoose from 'mongoose';

const DraftSchema = new mongoose.Schema(
  {
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true },
    type: {
      type: String,
      required: true,
    },
    content: { type: String, required: true },
    version: { type: Number, default: 1 },
    status: {
      type: String,
      enum: ['draft', 'approved'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.models.Draft || mongoose.model('Draft', DraftSchema);
