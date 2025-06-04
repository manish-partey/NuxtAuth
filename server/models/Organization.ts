import mongoose from 'mongoose';

const OrganizationSchema = new mongoose.Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true, unique: true },
}, {
  timestamps: true,
});

export default mongoose.models.Organization || mongoose.model('Organization', OrganizationSchema);