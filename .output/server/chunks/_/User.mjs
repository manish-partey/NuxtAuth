import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: {
    type: String
  },
  isVerificationTokenUsed: {
    type: Boolean,
    default: false
  },
  verificationTokenExpiry: {
    type: Date
  },
  resetPasswordToken: {
    type: String
  },
  resetPasswordExpiry: {
    type: Date
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user"
  },
  organizationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Organization",
    required: false
  }
}, {
  timestamps: true
});
UserSchema.pre("save", async function(next) {
  if (!this.isModified("password")) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};
const User = mongoose.models.User || mongoose.model("User", UserSchema);

export { User as U };
//# sourceMappingURL=User.mjs.map
