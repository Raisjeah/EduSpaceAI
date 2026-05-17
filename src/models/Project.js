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
  createdAt: { type: Date, default: Date.now },
});

ProjectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export { ALLOWED_AGENTS };
