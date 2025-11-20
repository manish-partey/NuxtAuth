// types/document.d.ts
export interface DocumentType {
  _id: string;
  name: string;
  description: string;
  required: boolean;
  key: string;
  layer: 'platform' | 'organization' | 'user';
  order: number;
  maxSize?: number;
  allowedMimeTypes?: string[];
}

export interface UploadedDocument {
  _id?: string;
  documentTypeId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: Date;
  layer: 'platform' | 'organization' | 'user';
  layerId?: string;
}