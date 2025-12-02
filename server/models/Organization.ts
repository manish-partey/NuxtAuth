// server/models/Organization.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, unique: true },
    domain: { type: String, required: false, trim: true, sparse: true },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: () => 'Organization', // ✅ Defer resolution of circular reference
      required: [
        function(this: any) {
          // Only required if this is not a platform itself
          return this.type !== 'platform';
        },
        'Platform ID is required for non-platform organizations'
      ],
      default: null
    },
    description: { 
      type: String, 
      default: '' 
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
const Organization = (models?.Organization || model('Organization', OrganizationSchema));
export default Organization;
