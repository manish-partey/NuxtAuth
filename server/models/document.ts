import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  originalName: string;
  fileUrl: string;
  mimeType?: string;
  size?: number;
  layer?: 'platform' | 'organization' | 'user' | string;
  layerId?: string; // the id of the platform/org/user this document belongs to
  uploadedBy?: string; // user id
  status?: 'pending' | 'approved' | 'rejected' | 'uploaded';
  required?: boolean;
  uploadedAt: Date;
}

const DocumentSchema: Schema = new Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String },
  size: { type: Number },
  layer: { type: String, enum: ['platform', 'organization', 'user'], default: 'organization' },
  layerId: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['pending', 'approved', 'rejected', 'uploaded'], default: 'uploaded' },
  required: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);