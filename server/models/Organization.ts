// server/models/Organization.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const OrganizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      required: true,
    },
    settings: {
      type: Schema.Types.Mixed, // Allows storing any JSON-like object
      default: {},
    },
    // Optional: add description or metadata fields if needed
    // description: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound unique index to ensure org name uniqueness per platform
OrganizationSchema.index({ name: 1, platformId: 1 }, { unique: true });

const Organization = models.Organization || model('Organization', OrganizationSchema);

export default Organization;
