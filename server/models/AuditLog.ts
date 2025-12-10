// server/models/AuditLog.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models } = mongoosePkg;

const AuditLogSchema = new Schema(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'user_created',
        'user_updated',
        'user_removed',
        'role_changed',
        'password_reset_sent',
        'user_suspended',
        'user_activated',
        'organization_updated',
        'settings_updated',
        'user_invited',
        'CREATE_ORG_TYPE',
        'UPDATE_ORG_TYPE',
        'DELETE_ORG_TYPE',
        'APPROVE_ORG_TYPE',
        'REJECT_ORG_TYPE',
        'PROMOTE_ORG_TYPE',
        'CONFIG_UPDATE',
      ],
    },
    targetType: {
      type: String,
      required: true,
      enum: ['user', 'organization', 'setting', 'OrganizationType', 'Platform', 'SystemConfig'],
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: false,
    },
    details: {
      type: Object,
      default: {},
    },
    ipAddress: {
      type: String,
      default: 'unknown',
    },
    userAgent: {
      type: String,
      default: 'unknown',
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
AuditLogSchema.index({ organizationId: 1, createdAt: -1 });
AuditLogSchema.index({ organizationId: 1, userId: 1 });
AuditLogSchema.index({ organizationId: 1, action: 1 });

const AuditLog = models?.AuditLog || model('AuditLog', AuditLogSchema);
export default AuditLog;
