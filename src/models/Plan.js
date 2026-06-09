import mongoose from 'mongoose';

const PlanSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, uppercase: true, trim: true }, // FREE, CLASSIC, PRO, ULTRA
  price: { type: Number, required: true, min: 0 },
  duration: { type: Number, default: 30 }, // in days
  message_limit: { type: Number, default: 20 },
  image_upload: { type: Boolean, default: false },
  file_upload: { type: Boolean, default: false },
  ai_agent_level: { type: Number, default: 0 },
  
  // Live Call (Prof Kore)
  live_call_enabled: { type: Boolean, default: false },
  live_call_minutes_per_window: { type: Number, default: 0 }, // 0 = tidak boleh
  live_call_window_hours: { type: Number, default: 24 }, // window reset dalam jam (24 = harian)

  // File Upload Window
  file_upload_per_window: { type: Number, default: 0 }, // jumlah file per window (0 = tidak boleh)
  file_upload_window_hours: { type: Number, default: 4 }, // window reset dalam jam

  // AI Agent
  agent_enabled: { type: Boolean, default: false },
  agent_requests_per_window: { type: Number, default: 0 }, // 0 = tidak boleh, -1 = unlimited
  agent_window_hours: { type: Number, default: 4 }, // window reset dalam jam

  memory_enabled: { type: Boolean, default: false },
  priority_access: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Plan || mongoose.model('Plan', PlanSchema);
