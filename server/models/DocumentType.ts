import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocumentType extends MongooseDocument {
  name: string;
  key: string;
  layer: 'platform' | 'organization' | 'user' | string;
  required: boolean;
  rolesAllowed?: string[]; // roles allowed to upload this document
  description?: string;
  active?: boolean;
  order?: number;
  maxSize?: number; // max file size in bytes
  allowedMimeTypes?: string[]; // allowed MIME types
}

const DocumentTypeSchema: Schema = new Schema({
  name: { type: String, required: true },
  key: { type: String, required: true, unique: true },
  layer: { type: String, enum: ['platform', 'organization', 'user'], required: true },
  required: { type: Boolean, default: false },
  rolesAllowed: { type: [String], default: [] },
  description: { type: String },
  active: { type: Boolean, default: true },
  order: { type: Number, default: 0 },
  maxSize: { type: Number, default: 10 * 1024 * 1024 }, // 10MB default
  allowedMimeTypes: { type: [String], default: [] }, // empty means all allowed
});

export default mongoose.models.DocumentType ||
  mongoose.model<IDocumentType>('DocumentType', DocumentTypeSchema);
