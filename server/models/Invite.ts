import mongoose from 'mongoose';

interface IInvite {
  _id: mongoose.Types.ObjectId;
  email: string;
  role: string;
  organizationId: mongoose.Types.ObjectId;
  inviterUserId: mongoose.Types.ObjectId;
  inviterName?: string;
  status: 'pending' | 'accepted' | 'expired' | 'revoked';
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  revoked?: boolean;
  acceptedAt?: Date;
}

const InviteSchema = new mongoose.Schema<IInvite>({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  role: {
    type: String,
    required: true,
    enum: ['user', 'admin', 'organization_admin'],
    default: 'user'
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Organization',
    required: true
  },
  inviterUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  inviterName: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'expired', 'revoked'],
    default: 'pending'
  },
  token: {
    type: String,
    required: true,
    unique: true
  },
  expiresAt: {
    type: Date,
    required: true,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
  },
  revoked: {
    type: Boolean,
    default: false
  },
  acceptedAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for faster queries
InviteSchema.index({ email: 1, organizationId: 1 });
InviteSchema.index({ status: 1 });

// Auto-expire invites
InviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Invite || mongoose.model<IInvite>('Invite', InviteSchema);