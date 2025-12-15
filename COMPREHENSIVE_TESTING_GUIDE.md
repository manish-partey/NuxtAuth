# Complete Application Testing Guide

> ✅ **Updated:** December 14, 2025 - Includes new UI-based approve/reject workflow and additional admins activation

## 🚀 Quick Start

**Complete flow in 15 steps:**

1. Start server: `npm run dev`
2. **Phase 1:** Create Super Admin → Login
3. **Phase 2:** Create Healthcare Platform + Organization Types
4. **Phase 3:** Create 2 Platform Admins → Logout
5. **Phase 4:** Public org registration with 2 additional admins → Check emails
6. **Phase 5:** Platform Admin logs in → Views pending org → Clicks org name → Clicks "Approve" → Success!
7. **Phase 6:** All 3 admins set passwords → Login → Access dashboard

**That's it!** The system now has approve/reject UI buttons and activates ALL admins automatically.

---

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [System Architecture](#system-architecture)
3. [Role Hierarchy](#role-hierarchy)
4. [Testing Phases](#testing-phases)
5. [API Endpoints Reference](#api-endpoints-reference)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Services
- **MongoDB**: Running on default port 27017
- **Node.js**: v18+
- **npm**: Latest version
- **SMTP** (optional): For email testing, or check console logs

### Environment Setup
```bash
# Start development server
npm run dev
# Server runs on http://localhost:3000
```

### Verify MongoDB Connection
```bash
# Check MongoDB is running
mongosh
use nuxt-auth
db.stats()
```

---

## System Architecture

### Data Model Hierarchy
```
Super Admin (System Level)
    │
    └── Platform (Multiple)
            │
            ├── Platform Admin (Multiple per platform)
            │
            └── Organization (Multiple per platform)
                    │
                    ├── Organization Admin (Multiple per org)
                    ├── Manager (Multiple per org)
                    ├── Employee (Multiple per org)
                    └── Guest (Multiple per org)
```

### Key Relationships
- **1 Platform → Many Organizations** (enforced by required platformId)
- **1 Organization → Many Users** (enforced by organizationId foreign key)
- **Multiple Platform Admins** can manage same platform
- **Email uniqueness**: Per organization (compound index: email + organizationId)

---

## Role Hierarchy

### Permission Matrix

| Feature | Super Admin | Platform Admin | Org Admin | Manager | Employee | Guest |
|---------|------------|----------------|-----------|---------|----------|-------|
| Manage Platforms | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Organizations | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Org Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Managers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Employees | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View All Platforms | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| View Own Org | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |

---

## Testing Phases

## Phase 1: Super Admin Setup

### 1.1 Create Super Admin
```javascript
// MongoDB command
db.users.insertOne({
  username: "superadmin",
  name: "Super Administrator",
  email: "superadmin@test.com",
  password: "$2a$10$...", // Bcrypt hash of "Admin123!"
  role: "super_admin",
  status: "active",
  isVerified: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
```

### 1.2 Login as Super Admin
- URL: `http://localhost:3000/login`
- Email: `superadmin@test.com`
- Password: `Admin123!`

**✅ Verify:** Access to `/superadmin/dashboard`

---

## Phase 2: Platform Creation

### 2.1 Create Healthcare Platform

**As Super Admin:**
1. Go to: `http://localhost:3000/superadmin/platforms`
2. Click "Create New Platform"
3. Fill details:
   - Name: Healthcare Platform
   - Category: healthcare
   - Description: Main healthcare platform
4. Submit

**✅ Verify:**
- Platform appears in list
- Status: active
- Unique platform ID generated

### 2.2 Configure Organization Types

1. Click "Org Types" on platform card
2. Select allowed types:
   - ✅ Hospital
   - ✅ Clinic
   - ✅ Pharmacy
3. Save

---

## Phase 3: Platform Admins

### 3.1 Create First Platform Admin

**As Super Admin:**
1. Create user:
   - Name: Platform Admin One
   - Email: platformadmin1@healthcare.com
   - Role: platform_admin
   - Platform: Healthcare Platform
   - Status: active

**✅ Check Email:** Password reset link sent

### 3.2 Set Password & Login
1. Use reset link from console logs
2. Set password: `Platform123!`
3. Login at `/login`

**✅ Verify:**
- Access to `/platform/dashboard`
- Can see pending organizations
- ❌ Cannot access `/superadmin/*`

### 3.3 Create Second Platform Admin
Create `platformadmin2@healthcare.com` with same platform

**✅ Verify:** Both admins can access same platform data

---

## Phase 4: Public Organization Registration

### 4.1 Register Organization

**As Anonymous (logout):**
1. Go to: `http://localhost:3000/organization-register`
2. Fill form:
   ```
   Organization: St. Mary Hospital
   Type: Hospital
   Platform: Healthcare Platform
   Admin Name: John Doe
   Admin Email: john.doe@stmary.com
   Additional Admin: Jane Smith (jane.smith@stmary.com)
   ```
3. Submit

### 4.2 Verify Email Notifications

**Check console logs for 4 emails:**
1. ✉️ `john.doe@stmary.com` - Password reset
2. ✉️ `jane.smith@stmary.com` - Password reset
3. ✉️ `platformadmin1@healthcare.com` - Approval request
4. ✉️ `platformadmin2@healthcare.com` - Approval request

**✅ Verify Database:**
```javascript
db.organizations.findOne({ name: "St. Mary Hospital" })
// Expected:
// status: "pending"
// createdBy: John Doe's user ID

db.users.find({ email: { $in: ["john.doe@stmary.com", "jane.smith@stmary.com"] } })
// Expected: 2 users
// Both have:
// - role: "organization_admin"
// - status: "pending"
// - organizationId: ObjectId("...") ← SET IMMEDIATELY after org creation
// - resetPasswordToken: "uuid-token"
// - resetPasswordExpiry: Date (24 hours from now)
```

**✅ Verify organizationId Flow:**
1. **Initially:** User created with `organizationId: null`
2. **Immediately After Org Created:** User updated with `organizationId: organization._id`
3. **NOT when password is set** - organizationId is set before password

```javascript
// Trace the flow:
// Step 1: User created
db.users.findOne({ email: "john.doe@stmary.com" })
// organizationId: null (initially)

// Step 2: Organization created
db.organizations.insertOne({ name: "St. Mary Hospital", ... })

// Step 3: User updated IMMEDIATELY
db.users.updateOne(
  { _id: user._id },
  { $set: { organizationId: organization._id } }
)
// organizationId: ObjectId("...") ← NOW SET

// Step 4: User can set password (before or after approval)
// Step 5: Platform admin approves → user status changes to "active"
```

---

## Phase 5: Platform Admin Approval/Rejection

### 5.1 Login as Platform Admin

**Credentials:**
- Email: `platformadmin1@healthcare.com`
- Password: `Admin123!`

**Navigate to:** `/platform/organizations`

**✅ Verify:**
- See "St. Mary Hospital" in the list
- Status badge shows: "⏳ PENDING" (yellow)

### 5.2 View Organization Details

**Steps:**
1. Click on "St. Mary Hospital" row
2. You'll be taken to `/platform/organizations/[orgId]`

**✅ Verify Page Shows:**
- Yellow alert banner: "This organization is pending approval"
- Two action buttons visible:
  - ✓ Approve Organization (green)
  - ✗ Reject Organization (red)
- Organization details (name, type, description, created date)
- List of users (3 users: primary admin + 2 additional admins)

### 5.3 Approve Organization

**Click:** "Approve Organization" button

**Expected:**
- Confirmation dialog: "Are you sure you want to approve this organization?"
- Click OK
- Button shows "Processing..."
- Success message appears: "Organization approved successfully! User accounts have been activated."
- Yellow banner disappears
- Status badge changes to "✅ APPROVED" (green)

**✅ Check Console Logs:**
```
[APPROVE-ORG] Organization approved: St. Mary Hospital
[APPROVE-ORG] User account activated: admin@stmary.com
[APPROVE-ORG] Found 2 additional admin(s) to activate
[APPROVE-ORG] Additional admin account activated: admin2@stmary.com
[APPROVE-ORG] Additional admin account activated: admin3@stmary.com
```

**✅ Verify Emails Sent (5 emails total):**
1. Primary admin: approval email with password link
2. Additional admin 2: approval email with password link
3. Additional admin 3: approval email with password link

### 5.4 Test Rejection Flow (Optional)

**Create Another Organization:**
- Register "Test Clinic" from public URL
- Login as platform admin
- Navigate to Test Clinic's detail page

**Click:** "Reject Organization" button

**Expected:**
- Modal appears: "Reject Organization"
- Textarea for rejection reason
- "Minimum 10 characters" note

**Test Validation:**
- Type: "Bad" → Click Reject
- Error: "Rejection reason must be at least 10 characters"

**Provide Valid Reason:**
- Type: "This organization does not meet our healthcare licensing requirements."
- Click "Reject Organization"
- Success message: "Organization rejected. Notification email sent to the registrant."

**✅ Verify:**
- Status changes to "REJECTED"
- Rejection reason displayed
- Rejection email sent to creator

---

## Phase 5.5: Concurrent Approval Testing

### 5.5.1 Test Optimistic Concurrency

**Setup 2 Browser Sessions:**
- **Browser 1:** Login as `platformadmin1@healthcare.com`
- **Browser 2:** Login as `platformadmin2@healthcare.com`

**Create New Org:** Register "Concurrent Test Hospital" from public URL

**Both browsers navigate to:** `/platform/organizations`
**Both click:** "Concurrent Test Hospital" to open details page

### 5.5.2 Execute Simultaneous Approval

**At Same Time:**
- Browser 1: Click "Approve Organization" → Confirm → ✅ Success
- Browser 2: Click "Approve Organization" (1 sec later) → Confirm → ❌ 409 Conflict

**Expected Response (Browser 2):**
```
Status: 409 Conflict
Message: "Organization already approved by Platform Admin One on 12/14/2025, 10:00:00 AM"
```

**✅ Verify Database:**
```javascript
// Check organization
db.organizations.findOne({ name: "St. Mary Hospital" })
// status: "approved"
// approvedBy: Platform Admin 1's ID only
// approvedAt: First approval timestamp

// Check user status change
db.users.findOne({ email: "admin@stmary.com" })
// organizationId: ObjectId (already set during registration)
// status: "active" (changed from "pending" upon approval)
// User can now login and access the system
```

**✅ Success Criteria:**
- Only ONE approval recorded
- First admin wins
- Second admin gets clear error
- No data corruption
- User status changes from "pending" to "active"
- User can now login with their password

### 5.3 Test Concurrent Rejection

Create "Test Clinic" → Both admins try rejecting simultaneously

**Expected:**
- First rejection succeeds
- Second gets: "Already rejected by [Name] on [timestamp]"

**✅ Verify Database:**
```javascript
// Check organization
db.organizations.findOne({ name: "Test Clinic" })
// status: "rejected"
// rejectedBy: Platform Admin 1's ID
// rejectedAt: Rejection timestamp
// rejectionReason: "..."

// Check user status (UNCHANGED)
db.users.findOne({ email: "admin@testclinic.com" })
// organizationId: ObjectId (still set from registration)
// status: "pending" (NOT changed - user cannot login)
// Rejection email sent to user
```

---

## Phase 6: Organization Admin Access (All 3 Admins)

### 6.1 Set Password for Primary Admin

**As John Doe (Primary Admin):**
1. Check email or console logs for reset token
2. Go to: `/reset-password?token=TOKEN`
3. Set password: `Hospital123!`

**✅ Verify:**
```javascript
db.users.findOne({ email: "john.doe@stmary.com" })
// password: "hashed_password" (now set)
// status: "active" (because organization was approved)
// organizationId: St. Mary Hospital's ID
```

### 6.2 Set Password for Additional Admins

**As Additional Admin 2:**
1. Email: `admin2@stmary.com`
2. Check email/console for reset token
3. Go to: `/reset-password?token=TOKEN`
4. Set password: `Hospital123!`

**As Additional Admin 3:**
1. Email: `admin3@stmary.com`
2. Repeat same process
3. Set password: `Hospital123!`

**✅ Verify All 3 Admins Activated:**
```javascript
db.users.find({ 
  organizationId: ObjectId("..."), 
  role: "organization_admin" 
}, { name: 1, email: 1, status: 1 })

// Should return 3 users, all with status: "active"
```

**⚠️ Important:** 
- User status changed to "active" when organization was **approved**, not when password was set
- ALL organization admins (primary + additional) are activated upon approval
- If organization is still pending, user status remains "pending" even after setting password
- User can set password before OR after organization approval

### 6.3 Login as Primary Org Admin
- Email: `john.doe@stmary.com`
- Password: `Hospital123!`

**✅ Verify Access:**
- `/org/dashboard` ✅
- `/org/users` ✅
- `/platform/*` ❌
- `/superadmin/*` ❌

### 6.4 Login as Additional Admin (Test)

**Login as Additional Admin 2:**
- Email: `admin2@stmary.com`
- Password: `Hospital123!`

**✅ Verify:**
- Can access same pages as primary admin
- Same permissions
- Can see all 3 admins in user list
- Can manage organization settings

---

## Phase 7: Create Manager

### 7.1 Org Admin Creates Manager

**As John Doe:**
1. Go to: `/org/users`
2. Create user:
   - Name: Manager Mike
   - Email: mike.manager@stmary.com
   - Role: manager

### 7.2 Manager Login

**As Manager Mike:**
1. Set password via reset link
2. Login: `Manager123!`

**✅ Test Permissions:**
- Can view org dashboard ✅
- Can create employees ✅
- Cannot create managers ❌
- Cannot access org settings ❌

---

## Phase 8: Create Employee

### 8.1 Manager Creates Employee

**As Manager Mike:**
1. Create user:
   - Name: Employee Emma
   - Email: emma.employee@stmary.com
   - Role: employee

### 8.2 Employee Login

**As Employee Emma:**
1. Set password: `Employee123!`
2. Login

**✅ Test Permissions:**
- Can view own profile ✅
- Can upload documents ✅
- Cannot create users ❌
- Cannot view other employees ❌

---

## Phase 9: Create Guest

### 9.1 Create Guest User

**As Org Admin:**
- Name: Guest George
- Email: george.guest@stmary.com
- Role: guest

**✅ Guest Permissions:**
- Read-only access ✅
- Cannot modify anything ❌

---

## Phase 10: Document Management

### 10.1 Configure Document Types

**As Super Admin:**
1. Go to: `/superadmin/document-types`
2. Create types for:
   - Platform level: Business License
   - Organization level: Insurance Certificate
   - User level: Identity Proof

### 10.2 Upload Documents

**As Org Admin:**
- Navigate to `/org/documents`
- Upload required documents

**As Employee:**
- Navigate to `/user/documents`
- Upload personal documents

---

## Phase 11: Multiple Organizations

### 11.1 Create Second Organization

Register "General Hospital" in same platform

### 11.2 Test Organization Isolation

**As John Doe (St. Mary):**
- ✅ Can only see St. Mary data
- ❌ Cannot access General Hospital

**As Mary (General Hospital):**
- ✅ Can only see General Hospital data
- ❌ Cannot access St. Mary

### 11.3 Test Duplicate Email

**Create users:**
1. In St. Mary: `shared@test.com` ✅
2. In General Hospital: `shared@test.com` ✅

**✅ Both can login and see their respective org data**

---

## Phase 12: Advanced Testing

### 12.1 Password Reset Flow

1. Logout
2. Click "Forgot Password"
3. Enter email
4. Use reset link from logs
5. Set new password

**✅ Verify:** Can login with new password

### 12.2 User Suspension

**As Org Admin:**
1. Suspend Employee Emma
2. Emma tries login → "Account suspended" error

**Reactivate:**
1. Change status to "active"
2. Emma can login again

### 12.3 Organization Rejection

**Register "Test Clinic":**
1. Platform admin clicks "Reject"
2. Enter reason: "Incomplete documentation"

**✅ Verify:**
- Status: "rejected"
- Creator receives rejection email
- rejectionReason stored in DB

---

## API Endpoints Reference

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"superadmin@test.com","password":"Admin123!"}' \
  -c cookies.txt
```

### Super Admin

```bash
# Get platforms
curl http://localhost:3000/api/superadmin/platforms \
  -b cookies.txt

# Create platform
curl -X POST http://localhost:3000/api/superadmin/platforms \
  -b cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"name":"Education Platform","category":"education"}'

# Get organization types
curl http://localhost:3000/api/superadmin/organization-types \
  -b cookies.txt

# Create organization type
curl -X POST http://localhost:3000/api/superadmin/organization-types \
  -b cookies.txt \
  -d '{"code":"university","name":"University","category":"education"}'
```

### Platform Admin

```bash
# Approve organization
curl -X POST http://localhost:3000/api/platform/organizations/[orgId]/approve \
  -b cookies.txt

# Reject organization
curl -X POST http://localhost:3000/api/platform/organizations/[orgId]/reject \
  -b cookies.txt \
  -d '{"reason":"Incomplete documentation"}'

# Get organizations
curl http://localhost:3000/api/platform/organizations \
  -b cookies.txt
```

---

## Troubleshooting

### Cannot Login

**Check:**
```javascript
db.users.findOne({ email: "user@test.com" })
// Verify: status: "active", isVerified: true

// Fix if needed:
db.users.updateOne(
  { email: "user@test.com" },
  { $set: { status: "active", isVerified: true } }
)
```

### 403 Forbidden

**Causes:**
- Wrong role for endpoint
- Accessing different platform/org
- Not authenticated

**Solution:** Verify role and platformId/organizationId

### Emails Not Sending

**Without SMTP:**
- Emails log to console
- Copy tokens from terminal output

**With SMTP:** Check `.env` configuration

### Organization Already Approved

**Expected behavior** during concurrent testing

**Reset for testing:**
```javascript
db.organizations.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "pending", approvedBy: null, approvedAt: null } }
)
```

### Duplicate Key Error

**Email conflict within same organization**

**Solution:**
- Email must be unique per organization
- Same email CAN exist in different orgs
- Change email or different organization

---

## Database Queries

### View All Users
```javascript
db.users.find({}, { name: 1, email: 1, role: 1, status: 1 })
```

### View Pending Organizations
```javascript
db.organizations.find({ status: "pending" })
```

### Count Users by Role
```javascript
db.users.aggregate([
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

### Reset Organization Status
```javascript
db.organizations.updateMany(
  { status: "approved" },
  { $set: { status: "pending", approvedBy: null, approvedAt: null } }
)
```

---

## Testing Checklist

### Users Created
- [x] Super Admin
- [x] Platform Admin 1
- [x] Platform Admin 2
- [x] Organization Admin 1 (John Doe)
- [x] Organization Admin 2 (Jane Smith)
- [x] Manager (Mike)
- [x] Employee (Emma)
- [x] Guest (George)

### Workflows Tested
- [x] Platform creation
- [x] Organization type configuration
- [x] Public organization registration
- [x] Email notifications (all platform admins)
- [x] Concurrent approval (optimistic concurrency)
- [x] Concurrent rejection
- [x] Password reset
- [x] User creation hierarchy
- [x] Role-based access control
- [x] Document management
- [x] Organization isolation
- [x] Duplicate email across organizations
- [x] User suspension/activation

### Permissions Verified
- [x] Super admin system-wide access
- [x] Platform admin platform-scoped
- [x] Org admin organization-scoped
- [x] Manager limited permissions
- [x] Employee self-only access
- [x] Guest read-only access

---

## Test User Credentials

| Role | Email | Password | Platform | Organization |
|------|-------|----------|----------|--------------|
| Super Admin | superadmin@test.com | Admin123! | - | - |
| Platform Admin 1 | platformadmin1@healthcare.com | Platform123! | Healthcare | - |
| Platform Admin 2 | platformadmin2@healthcare.com | Platform123! | Healthcare | - |
| Org Admin 1 | john.doe@stmary.com | Hospital123! | Healthcare | St. Mary Hospital |
| Org Admin 2 | jane.smith@stmary.com | Hospital123! | Healthcare | St. Mary Hospital |
| Manager | mike.manager@stmary.com | Manager123! | Healthcare | St. Mary Hospital |
| Employee | emma.employee@stmary.com | Employee123! | Healthcare | St. Mary Hospital |
| Guest | george.guest@stmary.com | Guest123! | Healthcare | St. Mary Hospital |

---

**Testing Complete! 🎉**

*All application flows covered from user creation through role hierarchies, organization management, concurrent operations, and permission boundaries.*

---

*Last Updated: December 14, 2025*
*Version: 1.0*
