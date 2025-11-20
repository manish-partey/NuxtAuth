import { ref, computed } from 'vue'

// TypeScript interfaces
interface DocumentType {
  _id: string
  name: string
  required: boolean
  maxSize?: number
  allowedMimeTypes?: string[]
  layer?: 'platform' | 'organization' | 'user'
}

interface UploadedDocument {
  documentTypeId: string
  [key: string]: any
}

// Document validation for different layers (platform, organization, user)
export const useDocumentValidation = () => {
  const documentTypes = ref<DocumentType[]>([])
  const uploadedDocuments = ref<UploadedDocument[]>([])
  const loading = ref(false)
  const error = ref('')

  // Computed properties
  const requiredDocuments = computed(() => 
    documentTypes.value.filter(doc => doc.required)
  )

  const optionalDocuments = computed(() => 
    documentTypes.value.filter(doc => !doc.required)
  )

  const uploadedRequiredDocs = computed(() => 
    uploadedDocuments.value.filter(uploaded => {
      const docType = documentTypes.value.find(dt => dt._id === uploaded.documentTypeId)
      return docType?.required
    })
  )

  const missingRequiredDocs = computed(() => 
    requiredDocuments.value.filter(required => 
      !uploadedDocuments.value.some(uploaded => uploaded.documentTypeId === required._id)
    )
  )

  const isValidationComplete = computed(() => 
    missingRequiredDocs.value.length === 0
  )

  const validationProgress = computed(() => {
    if (requiredDocuments.value.length === 0) return 100
    return Math.round((uploadedRequiredDocs.value.length / requiredDocuments.value.length) * 100)
  })

  // Load document types for a specific layer
  const loadDocumentTypes = async (layer: 'platform' | 'organization' | 'user') => {
    loading.value = true
    error.value = ''
    
    try {
      const response = await $fetch('/api/document-types/public', {
        query: { layer }
      })
      
      if (response.success) {
        documentTypes.value = response.documentTypes || []
        return response.documentTypes
      } else {
        throw new Error(response.message || 'Failed to load document types')
      }
    } catch (err: any) {
      error.value = err.message || 'Failed to load document types'
      console.error('Error loading document types:', err)
      return []
    } finally {
      loading.value = false
    }
  }

  // Add an uploaded document to the validation
  const addUploadedDocument = (document: any) => {
    const existingIndex = uploadedDocuments.value.findIndex(
      doc => doc.documentTypeId === document.documentTypeId
    )
    
    if (existingIndex !== -1) {
      uploadedDocuments.value[existingIndex] = document
    } else {
      uploadedDocuments.value.push(document)
    }
  }

  // Remove an uploaded document
  const removeUploadedDocument = (documentTypeId: string) => {
    const index = uploadedDocuments.value.findIndex(
      doc => doc.documentTypeId === documentTypeId
    )
    if (index !== -1) {
      uploadedDocuments.value.splice(index, 1)
    }
  }

  // Get document type name by ID
  const getDocumentTypeName = (documentTypeId: string) => {
    const docType = documentTypes.value.find(dt => dt._id === documentTypeId)
    return docType?.name || 'Unknown Document'
  }

  // Validate file before upload
  const validateFile = (file: File, documentType: any) => {
    const errors = []

    // Check file size
    const maxSize = documentType.maxSize || (10 * 1024 * 1024) // 10MB default
    if (file.size > maxSize) {
      errors.push(`File size ${formatFileSize(file.size)} exceeds maximum allowed size ${formatFileSize(maxSize)}`)
    }

    // Check file type
    const allowedTypes = documentType.allowedMimeTypes || []
    if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
      errors.push(`File type ${file.type} is not allowed. Allowed types: ${allowedTypes.join(', ')}`)
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Reset validation state
  const reset = () => {
    documentTypes.value = []
    uploadedDocuments.value = []
    error.value = ''
  }

  return {
    // State
    documentTypes,
    uploadedDocuments,
    loading,
    error,
    
    // Computed
    requiredDocuments,
    optionalDocuments,
    uploadedRequiredDocs,
    missingRequiredDocs,
    isValidationComplete,
    validationProgress,
    
    // Methods
    loadDocumentTypes,
    addUploadedDocument,
    removeUploadedDocument,
    getDocumentTypeName,
    validateFile,
    formatFileSize,
    reset
  }
}

// Legacy function for backward compatibility
export async function useDocumentValidationLegacy(tenant: string, industry: string) {
  try {
    const [configRes, docsRes] = await Promise.all([
      fetch('/api/docs-config'),
      fetch('/api/docs')
    ])
    console.log('inside usedocumentvalidation')
    const config = await configRes.json()
    const allDocsResponse = await docsRes.json()
    const allDocs = allDocsResponse.documents || []
    console.log(allDocs)
    // Get required and optional docs for the given tenant and industry
    const industryConfig = config[tenant]?.[industry] || { required: [], optional: [] }
    const requiredDocs = industryConfig.required || []
    const optionalDocs = industryConfig.optional || []
    console.log('required', requiredDocs)
    const uploadedDocs = allDocs.filter((doc: any) => doc.tenant === tenant && doc.industry === industry)
    console.log('uploadedDocs', uploadedDocs)
    const missing = requiredDocs.filter((req: any) => {
      return !uploadedDocs.some((uploaded: any) => uploaded.name === req.name)
    })

    return {
      missing,
      isComplete: missing.length === 0,
      requiredDocs,
      optionalDocs,
      uploadedDocs
    }
  } catch (err) {
    console.error('Document validation failed:', err)
    return {
      missing: [],
      isComplete: false,
      requiredDocs: [],
      optionalDocs: [],
      uploadedDocs: []
    }
  }
}
