# Testing Checklist - Organization Type Management System

## Pre-Testing Setup

- [ ] MongoDB is running
- [ ] `.env` file is configured with `MONGODB_URI`
- [ ] Dependencies installed: `npm install`
- [ ] Initialization script executed: `node scripts/init-org-type-system.mjs`

---

## 1. System Initialization Tests

### 1.1 Initialize System
```bash
node scripts/init-org-type-system.mjs
```

**Expected Results:**
- [ ] 11 organization types created (or skipped if already exist)
- [ ] 6 system configuration entries created
- [ ] No errors in console
- [ ] Success message displayed

**Verification:**
```javascript
// Check in MongoDB
db.organizationtypes.countDocuments({ scope: 'global', status: 'active' })
// Should return: 11

db.systemconfigs.countDocuments({ category: 'org_type_management' })
// Should return: 6
```

---

## 2. Configuration Service Tests

### 2.1 Get Configuration
```javascript
import { getConfig } from '~/server/services/config';

// Test getting mode
const mode = await getConfig('org_type_management_mode');
console.log('Mode:', mode); // Should be 'centralized'
```

**Expected Results:**
- [ ] Returns 'centralized' as default
- [ ] No errors thrown

### 2.2 Set Configuration
```javascript
import { setConfig } from '~/server/services/config';

await setConfig('org_type_management_mode', 'decentralized');
const newMode = await getConfig('org_type_management_mode');
console.log('Updated mode:', newMode); // Should be 'decentralized'
```

**Expected Results:**
- [ ] Configuration updated successfully
- [ ] Returns new value when queried

### 2.3 Helper Functions
```javascript
import { 
  getOrgTypeRateLimit, 
  isOrgTypeApprovalRequired 
} from '~/server/services/config';

const limit = await getOrgTypeRateLimit();
const approvalRequired = await isOrgTypeApprovalRequired();

console.log('Rate limit:', limit); // Should be 5
console.log('Approval required:', approvalRequired); // Should be true
```

**Expected Results:**
- [ ] Rate limit returns 5
- [ ] Approval required returns true
- [ ] No errors

---

## 3. API Endpoint Tests

### 3.1 GET /api/organization-types

**Test 1: Get all global types**
```bash
GET http://localhost:3000/api/organization-types
```

**Expected Response:**
```json
{
  "success": true,
  "organizationTypes": [ /* 11 types */ ]
}
```

**Checklist:**
- [ ] Status 200
- [ ] Returns 11 organization types
- [ ] All have scope: 'global'
- [ ] All have status: 'active'

**Test 2: Filter by category**
```bash
GET http://localhost:3000/api/organization-types?category=Healthcare
```

**Expected Results:**
- [ ] Returns only 4 types (hospital, clinic, pharmacy, diagnostic_center)
- [ ] All have category: 'Healthcare'

**Test 3: Filter by platform**
```bash
GET http://localhost:3000/api/organization-types?platformId=PLATFORM_ID
```

**Expected Results:**
- [ ] Returns global types + platform-specific types
- [ ] Respects allowCustomTypesPerPlatform config

---

### 3.2 POST /api/organization-types/create

**Test 1: Create type (first time)**
```json
POST http://localhost:3000/api/organization-types/create

{
  "code": "urgent_care",
  "name": "Urgent Care Center",
  "description": "Walk-in medical facility",
  "category": "Healthcare",
  "platformId": "PLATFORM_ID",
  "justification": "Need this for our urgent care network"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] Organization type created
- [ ] status: 'pending_approval' (unless auto-approve)
- [ ] suggestions array returned (may contain 'clinic')
- [ ] requiresApproval: true
- [ ] Audit log created

**Test 2: Duplicate detection**
```json
POST http://localhost:3000/api/organization-types/create

{
  "code": "hospital",  // Already exists as global
  "name": "Hospital",
  ...
}
```

**Expected Results:**
- [ ] Status 409
- [ ] Error: "Organization type already exists"

**Test 3: Rate limiting**
Create 6 types rapidly (within 24 hours):

**Expected Results:**
- [ ] First 5 succeed
- [ ] 6th fails with status 429
- [ ] Error: "Rate limit exceeded"

**Test 4: Similar type suggestions**
```json
{
  "code": "medical_clinic",
  "name": "Medical Clinic",
  ...
}
```

**Expected Results:**
- [ ] suggestions array contains "clinic"
- [ ] Up to 5 suggestions returned

**Test 5: Auto-approval**
Set platform.autoApproveTypes = true, then create type:

**Expected Results:**
- [ ] status: 'active' (not pending_approval)
- [ ] requiresApproval: false
- [ ] Type immediately available

---

### 3.3 GET /api/admin/organization-types/pending

**Setup:** Create 2-3 types via create endpoint

```bash
GET http://localhost:3000/api/admin/organization-types/pending
Authorization: Bearer SUPER_ADMIN_TOKEN
```

**Expected Results:**
- [ ] Status 200
- [ ] Returns all pending types
- [ ] count field matches array length
- [ ] Sorted by createdAt (newest first)
- [ ] createdBy and platformId populated

---

### 3.4 POST /api/admin/organization-types/approve

**Test 1: Approve type**
```json
POST http://localhost:3000/api/admin/organization-types/approve

{
  "typeId": "PENDING_TYPE_ID",
  "action": "approve"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] status changed to 'active'
- [ ] approvedBy set to super admin ID
- [ ] approvedAt timestamp set
- [ ] Audit log created (action: APPROVE_ORG_TYPE)

**Test 2: Reject type**
```json
POST http://localhost:3000/api/admin/organization-types/approve

{
  "typeId": "PENDING_TYPE_ID",
  "action": "reject",
  "rejectionReason": "Duplicate of existing clinic type"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] status changed to 'inactive'
- [ ] rejectionReason stored
- [ ] Audit log created (action: REJECT_ORG_TYPE)

**Test 3: Invalid action**
```json
{
  "typeId": "PENDING_TYPE_ID",
  "action": "invalid"
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "Invalid action"

**Test 4: Non-pending type**
```json
{
  "typeId": "ALREADY_APPROVED_TYPE_ID",
  "action": "approve"
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "not pending approval"

---

### 3.5 POST /api/admin/organization-types/promote

**Test 1: Promote to global (no conflict)**
```json
POST http://localhost:3000/api/admin/organization-types/promote

{
  "typeId": "PLATFORM_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] scope changed to 'global'
- [ ] platformId set to null
- [ ] status: 'active'
- [ ] Audit log created (action: PROMOTE_ORG_TYPE)

**Test 2: Merge with existing global**
```json
POST http://localhost:3000/api/admin/organization-types/promote

{
  "typeId": "PLATFORM_TYPE_ID",
  "mergeWithGlobalId": "GLOBAL_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] All organizations updated to use global type
- [ ] Platform type status: 'inactive'
- [ ] organizationsMigrated count returned
- [ ] Audit log created

**Test 3: Conflict without merge**
Create platform type with code 'hospital', then try to promote:

**Expected Results:**
- [ ] Status 409
- [ ] Error suggests using mergeWithGlobalId

**Test 4: Promote global type**
```json
{
  "typeId": "GLOBAL_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "Only platform-specific types can be promoted"

---

### 3.6 GET /api/admin/organization-types/review

**Setup:** Create platform types > 90 days old (modify createdAt in DB)

```bash
GET http://localhost:3000/api/admin/organization-types/review
```

**Expected Results:**
- [ ] Status 200
- [ ] Returns types older than 90 days
- [ ] usageCount populated for each
- [ ] similarTypesCount calculated
- [ ] promotionEligible flag set correctly
- [ ] daysSinceCreation calculated
- [ ] autoApprovalThreshold included in response

---

### 3.7 POST /api/platform/settings/allowed-types

**Test 1: Set allowed types**
```json
POST http://localhost:3000/api/platform/settings/allowed-types

{
  "platformId": "PLATFORM_ID",
  "allowedOrganizationTypes": [
    "HOSPITAL_TYPE_ID",
    "CLINIC_TYPE_ID"
  ]
}
```

**Expected Results:**
- [ ] Status 200
- [ ] Platform.allowedOrganizationTypes updated
- [ ] Audit log created
- [ ] Returns updated platform settings

**Test 2: Invalid type ID**
```json
{
  "platformId": "PLATFORM_ID",
  "allowedOrganizationTypes": ["INVALID_ID"]
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "invalid or inactive"

**Test 3: Set auto-approve (super admin only)**
```json
{
  "platformId": "PLATFORM_ID",
  "autoApproveTypes": true
}
```

**Expected Results:**
- [ ] Status 200 (if super admin)
- [ ] Status 403 (if platform admin)
- [ ] autoApproveTypes updated only by super admin

**Test 4: Wrong platform (permission check)**
Platform admin tries to update different platform:

**Expected Results:**
- [ ] Status 403
- [ ] Error: "Access denied"

---

### 3.8 POST /api/org/register (Updated)

**Test 1: Register with valid type**
```json
POST http://localhost:3000/api/org/register

{
  "orgName": "City Hospital",
  "orgDomain": "cityhospital.com",
  "adminName": "John Doe",
  "adminEmail": "admin@cityhospital.com",
  "platformId": "PLATFORM_ID",
  "organizationTypeId": "HOSPITAL_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 200
- [ ] Organization created
- [ ] type field is ObjectId reference
- [ ] typeString field contains org type code
- [ ] OrganizationType.usageCount incremented
- [ ] Admin user created

**Test 2: Invalid type ID**
```json
{
  ...,
  "organizationTypeId": "INVALID_ID"
}
```

**Expected Results:**
- [ ] Status 404
- [ ] Error: "Organization type not found"

**Test 3: Inactive type**
```json
{
  ...,
  "organizationTypeId": "INACTIVE_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "not available"

**Test 4: Type not allowed for platform**
```json
{
  "platformId": "PLATFORM_ID",  // Only allows hospital, clinic
  "organizationTypeId": "HOTEL_TYPE_ID"
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "not allowed for platform"

**Test 5: Missing required fields**
```json
{
  "orgName": "Test",
  // Missing organizationTypeId
}
```

**Expected Results:**
- [ ] Status 400
- [ ] Error: "All fields are required"

---

## 4. Audit Service Tests

### 4.1 Log Audit Entry
```javascript
import { logAudit } from '~/server/services/audit';

await logAudit({
  action: 'CREATE_ORG_TYPE',
  entityType: 'OrganizationType',
  entityId: 'TYPE_ID',
  userId: 'USER_ID',
  platformId: 'PLATFORM_ID',
  details: { code: 'test_type', name: 'Test Type' },
  event // H3 event object
});
```

**Expected Results:**
- [ ] Audit log created
- [ ] IP address captured
- [ ] User agent captured
- [ ] All fields populated correctly

### 4.2 Get Audit Logs
```javascript
import { getAuditLogs } from '~/server/services/audit';

const logs = await getAuditLogs({
  action: 'CREATE_ORG_TYPE',
  userId: 'USER_ID'
});
```

**Expected Results:**
- [ ] Returns filtered logs
- [ ] Sorted by timestamp (newest first)
- [ ] User populated
- [ ] Platform populated (if applicable)

---

## 5. Migration Script Tests

### 5.1 Migration (Fresh Data)

**Setup:** Create test organizations with string types:
```javascript
await Organization.create({
  name: 'Test Hospital',
  type: 'hospital',
  ...
});
```

**Execute:**
```bash
node scripts/migrate-organization-types.mjs
```

**Expected Results:**
- [ ] Organization.type converted to ObjectId
- [ ] Organization.typeString = 'hospital'
- [ ] OrganizationType.usageCount incremented
- [ ] Summary shows: X migrated, Y skipped, Z failed
- [ ] No errors

**Verification:**
```javascript
const org = await Organization.findOne({ name: 'Test Hospital' });
console.log(typeof org.type); // Should be 'object' (ObjectId)
console.log(org.typeString); // Should be 'hospital'
```

### 5.2 Migration (Already Migrated)

**Execute migration again:**
```bash
node scripts/migrate-organization-types.mjs
```

**Expected Results:**
- [ ] All organizations skipped
- [ ] Summary shows: 0 migrated, X skipped
- [ ] No errors

### 5.3 Migration (Unmatched Types)

**Setup:** Create org with non-existent type:
```javascript
await Organization.create({
  name: 'Test Business',
  type: 'unknown_type',
  ...
});
```

**Execute migration:**

**Expected Results:**
- [ ] Warning: "No matching type for..."
- [ ] Unmatched types listed at end
- [ ] Recommendation provided
- [ ] Organization not migrated

---

## 6. Rollback Script Tests

### 6.1 Rollback (Without Confirm)
```bash
node scripts/rollback-organization-types.mjs
```

**Expected Results:**
- [ ] Warning message displayed
- [ ] Script exits without changes
- [ ] Suggests using --confirm flag

### 6.2 Rollback (With Confirm)
```bash
node scripts/rollback-organization-types.mjs --confirm
```

**Expected Results:**
- [ ] Organization.type converted back to String
- [ ] Value restored from typeString
- [ ] OrganizationType.usageCount decremented
- [ ] Summary shows: X rolled back, Y failed
- [ ] No errors

**Verification:**
```javascript
const org = await Organization.findOne({ name: 'Test Hospital' });
console.log(typeof org.type); // Should be 'string'
console.log(org.type); // Should be 'hospital'
```

---

## 7. Integration Tests

### 7.1 Complete Workflow (Decentralized Mode)

**Steps:**
1. [ ] Set mode to 'decentralized'
2. [ ] Platform admin creates new type
3. [ ] Type status: 'pending_approval'
4. [ ] Super admin lists pending types
5. [ ] Super admin approves type
6. [ ] Type status: 'active'
7. [ ] Platform configures allowed types (includes new type)
8. [ ] User registers organization with new type
9. [ ] Organization created successfully
10. [ ] usageCount incremented

**Verify audit trail:**
- [ ] CREATE_ORG_TYPE logged
- [ ] APPROVE_ORG_TYPE logged
- [ ] All entries have IP and user agent

### 7.2 Auto-Approval Workflow

**Steps:**
1. [ ] Set platform.autoApproveTypes = true
2. [ ] Platform admin creates new type
3. [ ] Type status: 'active' (not pending)
4. [ ] Type immediately usable
5. [ ] requiresApproval: false in response

### 7.3 Promotion Workflow

**Steps:**
1. [ ] Create platform type with usageCount > 3
2. [ ] Create similar types on 2 other platforms
3. [ ] Run periodic review
4. [ ] Type marked promotionEligible: true
5. [ ] Super admin promotes type
6. [ ] Type scope: 'global'
7. [ ] Available to all platforms

### 7.4 Rate Limiting Workflow

**Steps:**
1. [ ] Get rate limit (default: 5)
2. [ ] Create 5 types (all succeed)
3. [ ] Try 6th type (fails with 429)
4. [ ] Wait 24 hours
5. [ ] Create type again (succeeds)

---

## 8. Error Handling Tests

### 8.1 Database Connection Error
**Test:** Stop MongoDB, try creating type

**Expected Results:**
- [ ] Status 500
- [ ] Error message about database

### 8.2 Invalid ObjectId
**Test:** Pass malformed ID to endpoints

**Expected Results:**
- [ ] Status 400 or 404
- [ ] Clear error message

### 8.3 Missing Required Fields
**Test:** Omit required fields in requests

**Expected Results:**
- [ ] Status 400
- [ ] Error lists missing fields

### 8.4 Permission Denied
**Test:** Platform admin tries super admin endpoint

**Expected Results:**
- [ ] Status 403
- [ ] Error: "Access denied" or "Insufficient permissions"

---

## 9. Performance Tests

### 9.1 Large Dataset
**Setup:** Create 100+ organization types

**Test:** GET /api/organization-types

**Expected Results:**
- [ ] Response time < 1 second
- [ ] All types returned
- [ ] Proper sorting applied

### 9.2 Concurrent Requests
**Test:** 10 users create types simultaneously

**Expected Results:**
- [ ] All requests handled
- [ ] Rate limiting enforced per user
- [ ] No race conditions
- [ ] Audit logs accurate

---

## 10. Security Tests

### 10.1 SQL Injection
**Test:** Malicious input in type code
```json
{
  "code": "test'; DROP TABLE organizationtypes;--"
}
```

**Expected Results:**
- [ ] No SQL executed
- [ ] Input sanitized
- [ ] Type created with sanitized code

### 10.2 XSS Attack
**Test:** Script in type name
```json
{
  "name": "<script>alert('XSS')</script>"
}
```

**Expected Results:**
- [ ] Script not executed
- [ ] Content escaped in responses

### 10.3 Authorization Bypass
**Test:** Modify platformId in JWT, try accessing other platform

**Expected Results:**
- [ ] Status 403
- [ ] Access denied

---

## Summary Checklist

### Backend Implementation
- [ ] All models created/modified
- [ ] All services implemented
- [ ] All 8 API endpoints working
- [ ] All scripts functional
- [ ] No compilation errors
- [ ] No runtime errors

### Functionality
- [ ] Organization types created from MongoDB
- [ ] Approval workflow functional
- [ ] Rate limiting enforced
- [ ] Suggestions working
- [ ] Auto-approval working
- [ ] Promotion working
- [ ] Audit logging complete

### Data Integrity
- [ ] Migration preserves data
- [ ] Rollback restores data
- [ ] usageCount accurate
- [ ] Foreign key references valid

### Documentation
- [ ] Quick start guide
- [ ] Full documentation
- [ ] Implementation summary
- [ ] Testing checklist

---

## Test Results Template

```
Date: ___________
Tester: ___________

System Initialization: ___/2 passed
Configuration Service: ___/3 passed
API Endpoints: ___/8 endpoints passed
Audit Service: ___/2 passed
Migration Scripts: ___/3 passed
Integration Tests: ___/4 passed
Error Handling: ___/4 passed
Performance Tests: ___/2 passed
Security Tests: ___/3 passed

Total: ___/31 tests passed

Issues Found:
1. ___________
2. ___________

Notes:
___________
```

---

**Ready to test!** Start with system initialization and work through each section. 🧪
