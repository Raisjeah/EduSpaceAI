import { AGENT_IDS } from '@/lib/constants';
import mongoose from 'mongoose';

const ALLOWED_AGENTS = [
  AGENT_IDS.DEFAULT,
  AGENT_IDS.RESEARCHER,
  AGENT_IDS.EDITOR,
  AGENT_IDS.DEEP_SEARCH,
  AGENT_IDS.VISUALIZER,
  AGENT_IDS.CITATION,
  AGENT_IDS.IMAGE_GENERATOR,
];

const ProjectSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 120 },
  userId: { type: String, required: true, index: true },
  agentId: {
    type: String,
    required: true,
    default: AGENT_IDS.DEFAULT,
    enum: ALLOWED_AGENTS,
  },
  createdAt: { type: Date, default: Date.now },
});

ProjectSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
export { ALLOWED_AGENTS };
