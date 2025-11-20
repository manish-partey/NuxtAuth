# Step-by-Step: Creating Required Business Registration Document

## Example: Organization Business Registration (Required)

### 1. Access Admin Interface
- Navigate to `/admin/document-types`
- Click "Create Document Type"

### 2. Basic Configuration
- **Name**: "Business Registration Certificate"
- **Key**: "business_registration" (unique identifier)
- **Layer**: "Organization" 
- **Required**: ✅ CHECKED (makes it mandatory)

### 3. Validation Rules
- **Max Size**: 10 MB
- **Allowed Types**: application/pdf, image/jpeg, image/png
- **Description**: "Official business registration certificate from government authorities"

### 4. Display Settings
- **Order**: 1 (appears first in lists)
- **Active**: ✅ CHECKED (enables the document type)

### 5. Save Configuration
- Click "Create" button
- Document type is now enforced across all organizations

## Result: 
- All organizations MUST upload this document
- Upload interface will show it with red "Required" badge
- System prevents organization approval without this document
- File validation enforces PDF/image formats only