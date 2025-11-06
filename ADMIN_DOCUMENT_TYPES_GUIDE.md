# Document Type Management for Admins

This guide explains how admins (super_admin and platform_admin) can configure required and optional documents for each layer in the system.

## Overview

The Document Management System allows administrators to:
- Create, edit, and delete document types
- Set documents as required or optional per layer (platform, organization, user)
- Configure file validation rules (size limits, allowed file types)
- Manage document ordering and descriptions
- Seed default document types

## Admin Access

### Who Can Manage Document Types?
- **Super Admin** (`super_admin`): Full access to all document type management
- **Platform Admin** (`platform_admin`): Full access to all document type management

### Accessing Document Type Management
1. **Via Navigation Bar**: Click "Doc Types" in the top navigation
2. **Via Admin Dashboard**: Go to `/admin` and click "Document Types" card
3. **Direct URL**: Navigate to `/admin/document-types`

## Document Type Configuration

### Creating a New Document Type

1. Go to `/admin/document-types`
2. Click "Create Document Type" button
3. Fill in the required fields:
   - **Name**: Display name (e.g., "Organization Registration")
   - **Key**: Unique identifier (e.g., "org_registration") - cannot be changed after creation
   - **Layer**: Choose from Platform, Organization, or User - cannot be changed after creation
   - **Required**: Check if this document is mandatory
   - **Description**: Optional description explaining the document purpose
   - **Max Size (MB)**: Maximum file size allowed (default: 10MB)
   - **Order**: Display order (0 = first, higher numbers = later)
   - **Allowed File Types**: MIME types separated by commas (leave empty to allow all types)
   - **Active**: Check to enable this document type

### Editing Document Types

1. In the document types table, click "Edit" next to any document type
2. Modify the fields (Note: Key and Layer cannot be changed)
3. Click "Update" to save changes

### Deleting Document Types

1. Click "Delete" next to any document type
2. Confirm the deletion
3. **Note**: You cannot delete document types that have existing documents uploaded. Delete or reassign those documents first.

## Document Layers

### Platform Layer
- Documents required for platform-wide compliance
- Typically uploaded by platform administrators
- Examples: Platform agreement, compliance certificates

### Organization Layer  
- Documents required for organization registration/operation
- Uploaded by organization administrators
- Examples: Business registration, tax certificates, licenses

### User Layer
- Documents required from individual users
- Uploaded by end users
- Examples: ID verification, professional certificates

## Setting Required vs Optional Documents

### Required Documents
- **Purpose**: Must be uploaded before user/organization can proceed
- **Effect**: System enforces validation and completion
- **Use Cases**: Legal compliance, mandatory certifications

### Optional Documents
- **Purpose**: Can be uploaded for additional verification or benefits
- **Effect**: System allows but doesn't enforce upload
- **Use Cases**: Additional certifications, supplementary documents

## Default Document Types

### Seeding Defaults
1. Click "Seed Defaults" button in the document types management page
2. This creates common document types for all layers:
   - **Platform**: Platform Agreement (required)
   - **Organization**: Business Registration (required), Tax Certificate (required), Business License (optional)
   - **User**: ID Verification (optional), Professional Certificate (optional)

### Customizing After Seeding
- Edit any seeded document types to match your requirements
- Add new document types specific to your business needs
- Deactivate document types you don't need

## File Validation Configuration

### File Size Limits
- Set maximum file size per document type
- Recommended: 5-10MB for most documents, 20MB+ for detailed presentations
- System will reject files exceeding the limit

### Allowed File Types
Configure allowed MIME types:
- **PDFs**: `application/pdf`
- **Images**: `image/jpeg, image/png, image/gif`
- **Documents**: `application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- **All Types**: Leave empty to allow any file type

## API Endpoints

The document type management uses these API endpoints:

- `GET /api/admin/document-types/list` - List all document types (with optional layer filter)
- `POST /api/admin/document-types/create` - Create new document type
- `PUT /api/admin/document-types/[id]` - Update existing document type
- `DELETE /api/admin/document-types/[id]` - Delete document type
- `POST /api/documents/seed` - Seed default document types

## Best Practices

### Document Type Design
1. **Clear Naming**: Use descriptive names that users will understand
2. **Unique Keys**: Use lowercase, underscore-separated keys (e.g., `business_license`)
3. **Logical Ordering**: Set order values to group related documents
4. **Appropriate Requirements**: Only mark truly essential documents as required

### File Validation
1. **Reasonable Limits**: Don't set size limits too low (min 5MB recommended)
2. **Security**: Restrict file types when possible to prevent malicious uploads
3. **User Experience**: Allow common formats (PDF, JPG, PNG)

### Layer Assignment
1. **Platform**: System-wide documents affecting all users
2. **Organization**: Business-level documents for company operations  
3. **User**: Individual user documents for personal verification

## Troubleshooting

### Common Issues

**Cannot delete document type**
- Check if any documents are using this type
- Delete or reassign existing documents first

**Document type not appearing in upload**
- Verify the document type is active
- Check if user has appropriate role permissions
- Ensure layer matches the current context

**File upload rejected**
- Check file size against document type limits
- Verify file type is in allowed MIME types list
- Ensure document type is active

### Getting Help

- Check server logs for detailed error messages
- Verify user permissions and authentication
- Ensure all required fields are provided when creating/updating

## Integration

### Frontend Integration
Document types are automatically loaded by:
- Platform documents page (`/platform/documents`)
- Organization documents page (`/org/documents`) 
- Admin documents page (`/admin/documents`)

### Dynamic Loading
The system fetches current document types from the database, so changes take effect immediately without requiring application restarts.