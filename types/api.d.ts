// types/api.d.ts
// API Response Types to avoid TypeScript recursion issues

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface OrgVerifyResponse {
  success: boolean;
  hasOrgAccess: boolean;
  message?: string;
  organizationId?: string;
  role?: string;
}

export interface UserInviteResponse {
  success: boolean;
  message: string;
  results?: {
    successful: string[];
    failed: Array<{
      email: string;
      error: string;
    }>;
  };
}

export interface DocumentUploadResponse {
  success: boolean;
  document: {
    id: string;
    name: string;
    status: string;
    fileUrl: string;
  };
}

export interface DocumentListResponse {
  success: boolean;
  documents: Array<{
    _id: string;
    name: string;
    originalName: string;
    fileUrl: string;
    status: string;
    uploadedAt: string;
    layer: string;
    required: boolean;
  }>;
}

// Helper type for $fetch calls to avoid recursion
export type FetchOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  credentials?: 'include' | 'omit' | 'same-origin';
  headers?: Record<string, string>;
  query?: Record<string, any>;
};