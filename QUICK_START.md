# Quick Start Guide - Organization Type Management System

## Prerequisites
- Node.js installed
- MongoDB running
- NuxtAuth project set up

## 5-Minute Setup

### Step 1: Initialize the System
```bash
# Seed default org types and configuration
node scripts/init-org-type-system.mjs
```

**What this does:**
- Creates 11 default organization types (hospital, clinic, hotel, etc.)
- Sets up system configuration (rate limits, approval settings, etc.)
- Takes ~5 seconds

**Expected Output:**
```
✅ Created "Hospital"
✅ Created "Clinic"
...
📊 Organization Types Summary:
   ✅ Created: 11
```

### Step 2: (Optional) Migrate Existing Organizations
If you have existing organizations with string-based types:

```bash
node scripts/migrate-organization-types.mjs
```

**What this does:**
- Converts Organization.type from String to ObjectId
- Matches type strings to OrganizationType.code
- Preserves original strings for rollback

**Skip this if:** You're starting fresh without existing organizations.

### Step 3: Start Your Application
```bash
npm run dev
```

## Testing the API

### 1. Get Available Organization Types
```bash
GET http://localhost:3000/api/organization-types
```

**Response:**
```json
{
  "success": true,
  "organizationTypes": [
    {
      "code": "hospital",
      "name": "Hospital",
      "category": "Healthcare",
      "scope": "global"
    }
  ]
}
```

### 2. Create a New Organization Type (Platform Admin)
```bash
POST http://localhost:3000/api/organization-types/create
Content-Type: application/json

{
  "code": "medical_clinic",
  "name": "Medical Clinic",
  "description": "Small medical facility",
  "category": "Healthcare",
  "platformId": "YOUR_PLATFORM_ID",
  "justification": "We need this for our network"
}
```

**Response:**
```json
{
  "success": true,
  "organizationType": { /* created type */ },
  "suggestions": [
    { "code": "clinic", "name": "Clinic" }
  ],
  "requiresApproval": true
}
```

### 3. List Pending Approvals (Super Admin)
```bash
GET http://localhost:3000/api/admin/organization-types/pending
```

### 4. Approve Pending Type (Super Admin)
```bash
POST http://localhost:3000/api/admin/organization-types/approve
Content-Type: application/json

{
  "typeId": "ORG_TYPE_ID",
  "action": "approve"
}
```

### 5. Configure Platform Allowed Types (Platform Admin)
```bash
POST http://localhost:3000/api/platform/settings/allowed-types
Content-Type: application/json

{
  "platformId": "YOUR_PLATFORM_ID",
  "allowedOrganizationTypes": [
    "HOSPITAL_TYPE_ID",
    "CLINIC_TYPE_ID"
  ]
}
```

### 6. Register Organization with Type
```bash
POST http://localhost:3000/api/org/register
Content-Type: application/json

{
  "orgName": "City Hospital",
  "orgDomain": "cityhospital.com",
  "adminName": "John Doe",
  "adminEmail": "admin@cityhospital.com",
  "platformId": "PLATFORM_ID",
  "organizationTypeId": "HOSPITAL_TYPE_ID"
}
```

## Configuration

### Switch to Decentralized Mode
Allow platform admins to create custom org types:

```javascript
// In MongoDB or via API
{
  "key": "org_type_management_mode",
  "value": "decentralized"
}
```

### Enable Auto-Approval for Trusted Platform
Skip approval queue for specific platform:

```javascript
// Update Platform document
{
  "autoApproveTypes": true
}
```

### Increase Rate Limit
Allow more type creations per day:

```javascript
// In MongoDB or via API
{
  "key": "org_type_rate_limit_per_day",
  "value": 10
}
```

## Common Tasks

### View Audit Logs
```javascript
import { getAuditLogs } from '~/server/services/audit';

const logs = await getAuditLogs({
  action: 'CREATE_ORG_TYPE',
  entityType: 'OrganizationType'
});
```

### Get System Configuration
```javascript
import { getConfig } from '~/server/services/config';

const mode = await getConfig('org_type_management_mode');
console.log('Mode:', mode); // 'centralized' or 'decentralized'
```

### Check Rate Limit Status
```javascript
import OrganizationType from '~/server/models/OrganizationType';
import { getOrgTypeRateLimit } from '~/server/services/config';

const limit = await getOrgTypeRateLimit();
const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

const count = await OrganizationType.countDocuments({
  createdBy: userId,
  createdAt: { $gte: oneDayAgo }
});

const remaining = limit - count;
console.log(`Rate limit: ${count}/${limit} (${remaining} remaining)`);
```

## Troubleshooting

### Issue: "Organization type not allowed for platform"
**Solution:** Configure platform's allowed types via `/api/platform/settings/allowed-types`

### Issue: Rate limit exceeded
**Solution:** Wait 24 hours or increase limit via system config

### Issue: Migration script shows unmatched types
**Solution:**
1. Review unmatched types in output
2. Create them manually via admin panel
3. Re-run migration script

### Issue: Suggestions not appearing
**Solution:** Check if similar types exist with similar codes/names (uses regex matching)

## Default Organization Types

Quick reference of pre-seeded types:

| Code | Name | Category | Icon |
|------|------|----------|------|
| hospital | Hospital | Healthcare | 🏥 |
| clinic | Clinic | Healthcare | 🏥 |
| pharmacy | Pharmacy | Healthcare | 💊 |
| diagnostic_center | Diagnostic Center | Healthcare | 🔬 |
| hotel | Hotel | Hospitality | 🏨 |
| resort | Resort | Hospitality | 🏖️ |
| restaurant | Restaurant | Hospitality | 🍽️ |
| cafe | Cafe | Hospitality | ☕ |
| university | University | Education | 🎓 |
| college | College | Education | 🏛️ |
| school | School | Education | 🏫 |

## Next Steps

1. **Test the API** using the examples above
2. **Configure your platform** with allowed organization types
3. **Set up auto-approval** for trusted platforms (optional)
4. **Build frontend UI** for type management
5. **Monitor audit logs** for compliance

## Need Help?

- 📖 Full documentation: `ORGANIZATION_TYPE_MANAGEMENT_SYSTEM.md`
- 📊 Implementation details: `IMPLEMENTATION_SUMMARY.md`
- 🐛 Check errors: `npm run dev` and review console

## Rollback (If Needed)

If something goes wrong, rollback the migration:

```bash
node scripts/rollback-organization-types.mjs --confirm
```

**Warning:** Only use if you've run the migration and need to revert.

---

**System Status:** ✅ Backend Complete | ⏳ Frontend Pending

You're ready to use the Organization Type Management System! 🎉
