// server/models/Setting.ts
import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true }
});

export default mongoose.models.Setting || mongoose.model('Setting', settingSchema);
