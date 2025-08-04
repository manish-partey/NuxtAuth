import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  fileUrl: string;
  uploadedAt: Date;
  tenantId?: string;
  industryId?: string;
}

const DocumentSchema: Schema = new Schema({
  name: { type: String, required: true },
  fileUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  tenantId: { type: String },
  industryId: { type: String }
});

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);