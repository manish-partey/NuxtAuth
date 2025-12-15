# Organization Type Management System

## Overview

This system implements **Scenario B+ (With Approval + Enhancements)** for managing organization types in a multi-tenant SaaS platform. It provides a balanced approach between centralized control and platform flexibility.

## Features

✅ **Configurable Management** - Switch between centralized/decentralized modes  
✅ **Smart Approval Workflow** - New types require super admin approval by default  
✅ **Auto-Approval for Trusted Platforms** - Platforms can bypass approval queue  
✅ **Rate Limiting** - Prevents abuse (5 types/day per user default)  
✅ **Similar Type Suggestions** - Reduces duplicate creation attempts  
✅ **Comprehensive Audit Trail** - Tracks all operations with IP/User-Agent  
✅ **Periodic Review & Promotion** - Platform types can be promoted to global  
✅ **Usage Tracking** - Monitor adoption across organizations  

## Architecture

### Database Models

#### OrganizationType
Stores organization type definitions (hospital, clinic, hotel, etc.)

**Key Fields:**
- `code` - Unique identifier (e.g., 'hospital', 'clinic')
- `name` - Display name
- `scope` - 'global' (available to all) or 'platform' (platform-specific)
- `status` - 'active', 'pending_approval', or 'inactive'
- `platformId` - Owner platform (null for global types)
- `usageCount` - Number of organizations using this type
- `promotionEligible` - Flag for promotion to global

#### SystemConfig
Key-value store for system configuration

**Configuration Keys:**
- `org_type_management_mode` - 'centralized' or 'decentralized'
- `org_type_approval_required` - Boolean
- `org_type_allow_custom_per_platform` - Boolean
- `org_type_rate_limit_per_day` - Number (default: 5)
- `org_type_auto_approve_threshold` - Number (default: 3)
- `org_type_review_period_days` - Number (default: 90)

#### Platform (Enhanced)
Platform entity with org type configuration

**Added Fields:**
- `allowedOrganizationTypes` - Array of ObjectId refs to OrganizationType
- `autoApproveTypes` - Boolean flag for auto-approval
- `category` - Platform category

#### Organization (Modified)
Organization entity referencing org type

**Changed Fields:**
- `type` - Changed from String to ObjectId ref OrganizationType
- `typeString` - Added for backward compatibility

## API Endpoints

### Public/Organization Endpoints

#### `GET /api/organization-types`
Fetch available organization types

**Query Parameters:**
- `platformId` - Filter by platform (includes global + platform-specific)
- `category` - Filter by category (Healthcare, Hospitality, Education)
- `includeInactive` - Include inactive types (default: false)
- `scope` - Filter by scope ('global' or 'platform')

**Response:**
```json
{
  "success": true,
  "organizationTypes": [
    {
      "_id": "...",
      "code": "hospital",
      "name": "Hospital",
      "description": "Medical facility providing inpatient and outpatient care",
      "icon": "🏥",
      "category": "Healthcare",
      "scope": "global",
      "status": "active",
      "usageCount": 42
    }
  ]
}
```

#### `POST /api/organization-types/create`
Create new organization type

**Request Body:**
```json
{
  "code": "medical_center",
  "name": "Medical Center",
  "description": "Comprehensive healthcare facility",
  "icon": "🏥",
  "category": "Healthcare",
  "platformId": "...",
  "justification": "We need this type for our specialized medical network"
}
```

**Features:**
- Rate limiting check (5/day default)
- Duplicate detection
- Similar type suggestions
- Auto-approval for trusted platforms
- Comprehensive audit logging

**Response:**
```json
{
  "success": true,
  "organizationType": { /* created type */ },
  "suggestions": [
    { "code": "hospital", "name": "Hospital", "similarity": 0.85 }
  ],
  "requiresApproval": true
}
```

#### `POST /api/org/register`
Register new organization (Updated)

**Request Body:**
```json
{
  "orgName": "City Hospital",
  "orgDomain": "cityhospital.com",
  "adminName": "John Doe",
  "adminEmail": "admin@cityhospital.com",
  "platformId": "...",
  "organizationTypeId": "..." // Required: ObjectId of OrganizationType
}
```

**Validation:**
- Validates platform exists
- Validates org type exists and is active
- Checks if org type is allowed for platform
- Increments OrganizationType.usageCount

### Super Admin Endpoints

#### `GET /api/admin/organization-types/pending`
List pending approval requests

**Response:**
```json
{
  "success": true,
  "organizationTypes": [ /* pending types */ ],
  "count": 5
}
```

#### `POST /api/admin/organization-types/approve`
Approve or reject pending type

**Request Body:**
```json
{
  "typeId": "...",
  "action": "approve", // or "reject"
  "rejectionReason": "Duplicate of existing type" // required if rejecting
}
```

#### `POST /api/admin/organization-types/promote`
Promote platform type to global

**Request Body:**
```json
{
  "typeId": "...",
  "mergeWithGlobalId": "..." // optional: merge with existing global type
}
```

**Actions:**
- **Promote**: Convert platform type to global (if no conflict)
- **Merge**: Migrate all orgs to existing global type, deactivate platform type

#### `GET /api/admin/organization-types/review`
List types eligible for periodic review

**Response:**
```json
{
  "success": true,
  "organizationTypes": [
    {
      "code": "medical_clinic",
      "name": "Medical Clinic",
      "usageCount": 15,
      "similarTypesCount": 4,
      "promotionEligible": true,
      "daysSinceCreation": 95
    }
  ],
  "autoApprovalThreshold": 3
}
```

### Platform Admin Endpoints

#### `POST /api/platform/settings/allowed-types`
Configure allowed organization types

**Request Body:**
```json
{
  "platformId": "...",
  "allowedOrganizationTypes": ["...", "..."], // Array of OrganizationType IDs
  "autoApproveTypes": true // Only super admin can set this
}
```

## Services

### Config Service (`server/services/config.ts`)
Centralized configuration management

**Functions:**
- `getConfig(key)` - Get config value
- `setConfig(key, value)` - Set config value
- `getOrgTypeManagementMode()` - Get management mode
- `isOrgTypeApprovalRequired()` - Check if approval required
- `allowCustomTypesPerPlatform()` - Check if custom types allowed
- `getOrgTypeRateLimit()` - Get rate limit
- `getAutoApprovalThreshold()` - Get auto-approval threshold
- `getReviewPeriodDays()` - Get review period
- `initializeDefaultConfigs()` - Initialize default configuration

### Audit Service (`server/services/audit.ts`)
Comprehensive audit logging

**Functions:**
- `logAudit(params)` - Log audit entry
- `getAuditLogs(filters)` - Retrieve audit logs
- `getClientIp(event)` - Extract client IP

**Logged Actions:**
- CREATE_ORG_TYPE
- UPDATE_ORG_TYPE
- DELETE_ORG_TYPE
- APPROVE_ORG_TYPE
- REJECT_ORG_TYPE
- PROMOTE_ORG_TYPE
- CONFIG_UPDATE

## Setup & Installation

### 1. Initialize System

Run the initialization script to seed default organization types and configuration:

```bash
node scripts/init-org-type-system.mjs
```

This creates:
- 11 default global organization types (4 healthcare, 4 hospitality, 3 education)
- 6 system configuration entries

### 2. Migrate Existing Organizations

If you have existing organizations with string-based types, run the migration:

```bash
node scripts/migrate-organization-types.mjs
```

This script:
- Converts Organization.type from String to ObjectId
- Matches type strings to OrganizationType.code
- Preserves original string in Organization.typeString for rollback
- Increments usageCount on each OrganizationType

### 3. Rollback (If Needed)

If migration causes issues, rollback to string-based types:

```bash
node scripts/rollback-organization-types.mjs --confirm
```

## Configuration

### Centralized Mode
- Only super admins can create organization types
- All types are global
- Platform admins select from global types

**Use Case:** Tight control, standardized taxonomy

### Decentralized Mode
- Platform admins can create custom types
- New types require super admin approval (unless auto-approved)
- Each platform has global + platform-specific types

**Use Case:** Flexibility while maintaining quality control

### Setting Configuration

Update configuration via super admin panel or directly in database:

```javascript
import { setConfig } from '~/server/services/config';

// Switch to decentralized mode
await setConfig('org_type_management_mode', 'decentralized');

// Increase rate limit
await setConfig('org_type_rate_limit_per_day', 10);
```

## Workflows

### Creating Organization Type (Decentralized)

1. **Platform Admin Creates Type**
   - POST /api/organization-types/create
   - System checks rate limit (5/day)
   - System searches for similar existing types
   - Returns suggestions if found

2. **Approval Queue**
   - Type status: 'pending_approval'
   - Super admin receives notification
   - Super admin reviews in admin panel

3. **Super Admin Review**
   - Approves → status: 'active', available immediately
   - Rejects → status: 'inactive', rejection reason logged

4. **Auto-Approval (Trusted Platforms)**
   - Platform.autoApproveTypes = true
   - Skips approval queue
   - Type status: 'active' immediately

### Promoting Platform Type to Global

1. **Periodic Review** (Every 90 days)
   - GET /api/admin/organization-types/review
   - Lists platform types with high usage
   - Shows promotion eligibility

2. **Super Admin Decision**
   - **Promote**: Convert to global type
   - **Merge**: Migrate to existing global type
   - **Keep**: Mark as reviewed, keep platform-specific

3. **Promotion**
   - POST /api/admin/organization-types/promote
   - Updates scope to 'global'
   - All platforms can now use it

4. **Merge**
   - Migrates all organizations to target global type
   - Deactivates platform type
   - Logs migration count in audit trail

## Security & Validation

### Rate Limiting
- Default: 5 org types per user per 24 hours
- Prevents spam/abuse
- Configurable via `org_type_rate_limit_per_day`

### Permission Checks
- **Create Type**: Platform admin for their platform, super admin for global
- **Approve Type**: Super admin only
- **Promote Type**: Super admin only
- **Configure Platform**: Platform admin for their platform, super admin for all

### Validation
- Duplicate detection (exact code match within scope)
- Platform allowlist enforcement
- Active status check before org registration
- ObjectId reference validation

## Audit & Compliance

All operations are logged with:
- **Action Type** (CREATE, APPROVE, REJECT, PROMOTE)
- **User ID** (Who performed the action)
- **Platform ID** (Which platform)
- **Entity ID** (Which org type)
- **Details** (Changes, justification, etc.)
- **IP Address** (Client IP)
- **User Agent** (Browser/client info)
- **Timestamp**

Query audit logs:

```javascript
import { getAuditLogs } from '~/server/services/audit';

const logs = await getAuditLogs({
  action: 'CREATE_ORG_TYPE',
  entityType: 'OrganizationType',
  userId: '...',
  platformId: '...'
});
```

## Frontend Integration (To Be Implemented)

### Super Admin Panel
- [ ] System configuration page
- [ ] Organization type management
- [ ] Approval queue with batch actions
- [ ] Periodic review dashboard
- [ ] Promotion workflow UI

### Platform Admin Panel
- [ ] Create organization type form
- [ ] Platform settings (allowed types)
- [ ] View pending approval status

### Organization Registration
- [ ] Platform selection dropdown
- [ ] Organization type dropdown (filtered by platform)
- [ ] Type descriptions and icons

## Default Organization Types

### Healthcare (4 types)
- Hospital 🏥
- Clinic 🏥
- Pharmacy 💊
- Diagnostic Center 🔬

### Hospitality (4 types)
- Hotel 🏨
- Resort 🏖️
- Restaurant 🍽️
- Cafe ☕

### Education (3 types)
- University 🎓
- College 🏛️
- School 🏫

## Troubleshooting

### Organizations Not Showing in Dropdown
- Check Platform.allowedOrganizationTypes is populated
- Verify OrganizationType.status = 'active'
- Ensure scope is 'global' or matches platformId

### Type Creation Fails with Rate Limit
- Check OrganizationType.createdAt for last 24 hours
- Increase limit via `org_type_rate_limit_per_day` config
- Wait for rate limit window to reset

### Migration Fails with Unmatched Types
- Review unmatched types in migration output
- Create missing types manually via admin panel
- Re-run migration script

## Best Practices

1. **Start with Centralized Mode**
   - Establish solid taxonomy first
   - Switch to decentralized when needed

2. **Review Pending Types Promptly**
   - Don't let approval queue grow
   - Provide clear rejection reasons

3. **Promote Common Types**
   - Run periodic review quarterly
   - Promote types used by 3+ platforms
   - Merge duplicates to maintain consistency

4. **Monitor Audit Logs**
   - Track unusual creation patterns
   - Identify platforms needing auto-approval
   - Review rejected types for trends

5. **Maintain Clean Taxonomy**
   - Use suggestions feature
   - Reject true duplicates
   - Promote successful platform types

## License

Part of the NuxtAuth SaaS Platform.
