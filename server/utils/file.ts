// server/utils/file.ts
import { writeFile, readFile, mkdir, unlink } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export interface FileInfo {
  originalName: string;
  mimeType: string;
  size: number;
  filepath: string;
}

export interface SaveFileOptions {
  baseDir?: string;
  subPath?: string;
  generateUniqueName?: boolean;
  allowedMimeTypes?: string[];
  maxSize?: number; // in bytes
}

export interface SavedFile {
  filename: string;
  filepath: string;
  url: string;
  size: number;
}

/**
 * Validate file against constraints
 */
export function validateFile(file: FileInfo, options: SaveFileOptions = {}): void {
  if (options.maxSize && file.size > options.maxSize) {
    throw new Error(`File size ${file.size} bytes exceeds maximum allowed size ${options.maxSize} bytes`);
  }

  if (options.allowedMimeTypes && options.allowedMimeTypes.length > 0) {
    if (!options.allowedMimeTypes.includes(file.mimeType)) {
      throw new Error(`File type ${file.mimeType} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`);
    }
  }
}

/**
 * Save file to disk with optional validation
 */
export async function saveFile(file: FileInfo, options: SaveFileOptions = {}): Promise<SavedFile> {
  // Validate file
  validateFile(file, options);

  const baseDir = options.baseDir || path.resolve('public/uploads');
  const subPath = options.subPath || '';
  const destDir = path.join(baseDir, subPath);

  // Ensure directory exists
  if (!existsSync(destDir)) {
    await mkdir(destDir, { recursive: true });
  }

  // Generate filename
  let filename = file.originalName;
  if (options.generateUniqueName !== false) {
    const ext = path.extname(file.originalName);
    const name = path.basename(file.originalName, ext);
    filename = `${Date.now()}-${uuidv4()}-${name}${ext}`;
  }

  const fullPath = path.join(destDir, filename);
  
  // Read and write file
  const data = await readFile(file.filepath);
  await writeFile(fullPath, data);

  // Generate URL path
  const urlPath = path.posix.join('/uploads', subPath, filename);

  return {
    filename,
    filepath: fullPath,
    url: urlPath,
    size: file.size
  };
}

/**
 * Delete file from disk
 */
export async function deleteFile(filepath: string): Promise<void> {
  try {
    await unlink(filepath);
  } catch (error: any) {
    // Ignore file not found errors
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

/**
 * Ensure upload directory exists
 */
export async function ensureUploadDir(subPath: string = ''): Promise<string> {
  const baseDir = path.resolve('public/uploads');
  const fullDir = path.join(baseDir, subPath);
  
  if (!existsSync(fullDir)) {
    await mkdir(fullDir, { recursive: true });
  }
  
  return fullDir;
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  return path.extname(filename).toLowerCase();
}

/**
 * Check if file type is image
 */
export function isImageFile(mimeType: string): boolean {
  return mimeType.startsWith('image/');
}

/**
 * Check if file type is document
 */
export function isDocumentFile(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain',
    'text/csv'
  ];
  return documentTypes.includes(mimeType);
}

/**
 * Convert bytes to human readable size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}