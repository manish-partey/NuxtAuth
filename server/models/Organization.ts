// server/models/Organization.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    domain: { type: String, required: true, trim: true, unique: true },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization', // ✅ Treat platform as an org
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// ✅ Index for uniqueness within platform
OrganizationSchema.index({ name: 1, platformId: 1 }, { unique: true });

// ✅ Register model
const Organization = models.Organization || model('Organization', OrganizationSchema);
export default Organization;
