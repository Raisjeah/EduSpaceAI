import mongoose from 'mongoose';

const DocumentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

DocumentSchema.index({ userId: 1, createdAt: -1 });

export default mongoose.models.Document || mongoose.model('Document', DocumentSchema);
