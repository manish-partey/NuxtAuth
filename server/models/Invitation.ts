// server/models/Invitation.ts
import mongoosePkg from 'mongoose';
const { Schema, model, models, Types } = mongoosePkg;

// Reusable role types
export const allowedInviteRoles = ['platform_admin', 'org_admin', 'user'] as const;
type InviteRole = typeof allowedInviteRoles[number];

export interface IInvitation {
  email: string;
  name?: string;
  role: InviteRole;
  organizationId?: Types.ObjectId;
  platformId?: Types.ObjectId;
  inviterName?: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  revoked?: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InvitationSchema = new Schema<IInvitation>(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: allowedInviteRoles,
      required: true,
    },
    organizationId: { type: Schema.Types.ObjectId, ref: 'Organization' },
    platformId: { type: Schema.Types.ObjectId, ref: 'Platform' },
    inviterName: { type: String, trim: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast duplicate invite lookups
InvitationSchema.index({ email: 1, status: 1 });

export default models.Invitation || model<IInvitation>('Invitation', InvitationSchema);
