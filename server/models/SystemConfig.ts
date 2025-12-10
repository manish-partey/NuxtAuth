// server/models/SystemConfig.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const SystemConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: Schema.Types.Mixed,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['organization', 'user', 'platform', 'security', 'general'],
      default: 'general',
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Index for category (key already has unique index)
SystemConfigSchema.index({ category: 1 });

const SystemConfig = models.SystemConfig || model('SystemConfig', SystemConfigSchema);

export default SystemConfig;
