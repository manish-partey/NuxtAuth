// server/models/Platform.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const PlatformSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['healthcare', 'hospitality', 'education', 'logistics', 'other'],
      default: 'other',
    },
    allowedOrganizationTypes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'OrganizationType',
      }
    ],
    autoApproveTypes: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

PlatformSchema.index({ category: 1 });
PlatformSchema.index({ status: 1 });

const Platform = models.Platform || model('Platform', PlatformSchema);
export default Platform;
