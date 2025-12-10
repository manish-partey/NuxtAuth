// server/models/OrganizationType.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const OrganizationTypeSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    icon: {
      type: String,
      default: 'building',
    },
    category: {
      type: String,
      enum: ['healthcare', 'hospitality', 'education', 'logistics', 'other'],
      required: true,
    },
    scope: {
      type: String,
      enum: ['global', 'platform'],
      default: 'global',
    },
    platformId: {
      type: Schema.Types.ObjectId,
      ref: 'Platform',
      default: null,
    },
    status: {
      type: String,
      enum: ['active', 'pending_approval', 'inactive', 'archived'],
      default: 'active',
    },
    deletedAt: {
      type: Date,
      default: null,
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
    rejectionReason: {
      type: String,
      default: null,
    },
    justification: {
      type: String,
      default: '',
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    promotionEligible: {
      type: Boolean,
      default: false,
    },
    active: {
      type: Boolean,
      default: true,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Compound unique index: code must be unique within scope
OrganizationTypeSchema.index({ code: 1, scope: 1, platformId: 1 }, { unique: true });
OrganizationTypeSchema.index({ category: 1, active: 1 });
OrganizationTypeSchema.index({ scope: 1, status: 1 });
OrganizationTypeSchema.index({ platformId: 1, status: 1 });
OrganizationTypeSchema.index({ promotionEligible: 1 });

// #10 - Soft delete protection: Prevent deletion if in use
OrganizationTypeSchema.pre('deleteOne', { document: true, query: false }, async function(next) {
  if (this.usageCount && this.usageCount > 0) {
    throw new Error(`Cannot delete organization type "${this.name}" because it is being used by ${this.usageCount} organization(s). Archive it instead.`);
  }
  next();
});

OrganizationTypeSchema.pre('findOneAndDelete', async function(next) {
  const doc = await this.model.findOne(this.getFilter());
  if (doc && doc.usageCount > 0) {
    throw new Error(`Cannot delete organization type "${doc.name}" because it is being used by ${doc.usageCount} organization(s). Archive it instead.`);
  }
  next();
});

const OrganizationType = models.OrganizationType || 
  model('OrganizationType', OrganizationTypeSchema);

export default OrganizationType;
