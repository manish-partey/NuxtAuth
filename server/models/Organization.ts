// server/models/Organization.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const OrganizationSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: {
      type: Schema.Types.ObjectId,
      ref: 'OrganizationType',
      required: true,
    },
    typeString: { 
      type: String,
      // Legacy field for backward compatibility during migration
    },
    slug: { type: String, required: true, trim: true, unique: true },
    domain: { type: String, required: false, trim: true, sparse: true },
    status: {
      type: String,
      enum: ['approved', 'pending', 'rejected'],
      default: 'pending',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      required: true,
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
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    rejectionReason: {
      type: String,
      default: null,
    },
  },
  { 
    timestamps: true,
    optimisticConcurrency: true // Enable version control for concurrent updates
  }
);

// ✅ Index for uniqueness within platform
OrganizationSchema.index({ name: 1, platformId: 1 }, { unique: true });

// #2 - Auto-populate typeString from OrganizationType
OrganizationSchema.pre('save', async function(next) {
  // Only populate if type is set and typeString is empty
  if (this.type && !this.typeString) {
    try {
      const OrganizationType = (await import('./OrganizationType')).default;
      const orgType = await OrganizationType.findById(this.type);
      if (orgType) {
        this.typeString = orgType.code;
      }
    } catch (error) {
      console.error('Error populating typeString:', error);
    }
  }
  next();
});

// ✅ Register model
const Organization = (models?.Organization || model('Organization', OrganizationSchema));
export default Organization;
