import mongoosePkg from 'mongoose';

const { Schema, model, models } = mongoosePkg;
const PlatformSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    description: {
      type: String,
      trim: true,
      default: ""
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active"
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    }
  },
  {
    timestamps: true
  }
);
const Platform = models.Platform || model("Platform", PlatformSchema);

export { Platform as P };
//# sourceMappingURL=Platform.mjs.map
