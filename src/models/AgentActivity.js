import mongoose from 'mongoose';

const AGENT_ACTIVITY_AGENTS = [
  'default',
  'researcher',
  'editor',
  'deep-search',
  'visualizer',
  'citation',
  'image-generator',
  'orchestrator',
];

const AgentActivitySchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  projectId: { type: String, index: true },
  chatId: { type: String, index: true },

  agentId: {
    type: String,
    required: true,
    enum: AGENT_ACTIVITY_AGENTS,
  },
  agentName: { type: String, required: true },

  task: { type: String, required: true },
  originalPrompt: { type: String },

  status: {
    type: String,
    enum: ['started', 'completed', 'failed'],
    required: true,
  },
  startedAt: { type: Date, required: true },
  completedAt: { type: Date },
  duration: { type: Number },

  output: { type: String },
  error: { type: String },

  workflowId: { type: String, index: true },
  isMultiAgent: { type: Boolean, default: false },
  workflowAgents: [{ type: String }],

  tokensUsed: { type: Number, default: 0 },
  modelUsed: { type: String },
}, {
  timestamps: true,
});

AgentActivitySchema.index({ userId: 1, createdAt: -1 });
AgentActivitySchema.index({ agentId: 1, createdAt: -1 });
AgentActivitySchema.index({ workflowId: 1, createdAt: 1 });
AgentActivitySchema.index({ status: 1, createdAt: -1 });

export default mongoose.models.AgentActivity || mongoose.model('AgentActivity', AgentActivitySchema);
export { AGENT_ACTIVITY_AGENTS };
