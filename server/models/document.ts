import mongoose, { Schema, Document as MongooseDocument } from 'mongoose';

export interface IDocument extends MongooseDocument {
  name: string;
  originalName: string;
  fileUrl: string;
  mimeType: string;
  size: number;
  layer: 'platform' | 'organization' | 'user' | string;
  layerId?: string;
  uploadedBy: string;
  status: 'uploaded' | 'pending' | 'approved' | 'rejected';
  required: boolean;
  uploadedAt: Date;
  approvedAt?: Date;
  approvedBy?: string;
  rejectedAt?: Date;
  rejectedBy?: string;
  rejectionReason?: string;
  documentTypeId?: string;
}

const DocumentSchema: Schema = new Schema({
  name: { type: String, required: true },
  originalName: { type: String, required: true },
  fileUrl: { type: String, required: true },
  mimeType: { type: String, required: true },
  size: { type: Number, required: true },
  layer: { type: String, enum: ['platform', 'organization', 'user'], required: true },
  layerId: { type: String },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { 
    type: String, 
    enum: ['uploaded', 'pending', 'approved', 'rejected'], 
    default: 'uploaded' 
  },
  required: { type: Boolean, default: false },
  uploadedAt: { type: Date, default: Date.now },
  approvedAt: { type: Date },
  approvedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectedAt: { type: Date },
  rejectedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  rejectionReason: { type: String },
  documentTypeId: { type: Schema.Types.ObjectId, ref: 'DocumentType' }
});

// Add indexes for better query performance
DocumentSchema.index({ layer: 1, layerId: 1 });
DocumentSchema.index({ uploadedBy: 1 });
DocumentSchema.index({ status: 1 });
DocumentSchema.index({ documentTypeId: 1 });

export default mongoose.models.Document ||
  mongoose.model<IDocument>('Document', DocumentSchema);