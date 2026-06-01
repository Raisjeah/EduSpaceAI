import mongoose from 'mongoose';

const ALLOWED_AGENTS = [
  'default',
  'researcher',
  'editor',
  'deep-search',
  'visualizer',
  'citation',
  'image-generator',
];

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  userId: { type: String, required: true, index: true },
  agentId: {
    type: String,
    required: true,
    default: 'default',
    enum: ALLOWED_AGENTS,
  },
  manualSelection: { type: Boolean, default: false },
  isArchived: { type: Boolean, default: false },
  archivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
});

ProjectSchema.index({ userId: 1, createdAt: -1 });
ProjectSchema.index({ isArchived: 1, archivedAt: 1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export { ALLOWED_AGENTS };
