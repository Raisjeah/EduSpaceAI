import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, default: 'Anon' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
