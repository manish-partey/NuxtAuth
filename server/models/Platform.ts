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
    description: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Platform = models.Platform || model('Platform', PlatformSchema);
export default Platform;
