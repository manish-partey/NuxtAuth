import mongoosePkg from 'mongoose';

const { Schema, model, models, Types } = mongoosePkg;
const allowedInviteRoles = ["platform_admin", "organization_admin", "user"];
const InvitationSchema = new Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    name: { type: String, trim: true },
    role: {
      type: String,
      enum: allowedInviteRoles,
      required: true
    },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization" },
    platformId: { type: Schema.Types.ObjectId, ref: "Platform" },
    inviterName: { type: String, trim: true },
    token: { type: String, required: true, unique: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending"
    },
    revoked: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true, index: true }
  },
  {
    timestamps: true
  }
);
InvitationSchema.index({ email: 1, status: 1 });
const Invitation = models.Invitation || model("Invitation", InvitationSchema);

export { Invitation as I };
//# sourceMappingURL=Invitation2.mjs.map
