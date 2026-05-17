import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true, trim: true }, // FREE, CLASSIC, PRO, ULTRA
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, default: 30 }, // in days
  message_limit: { type: Number, default: 20 },
  image_upload: { type: Boolean, default: false },
  file_upload: { type: Boolean, default: false },
  ai_agent_level: { type: Number, default: 0 },
  memory_enabled: { type: Boolean, default: false },
  priority_access: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
