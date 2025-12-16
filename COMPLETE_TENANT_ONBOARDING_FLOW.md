# Complete Tenant Onboarding Flow
## From Platform Creation to All User Roles

> **Last Updated:** December 15, 2025  
> **Purpose:** Step-by-step guide for complete tenant (platform + organization) setup with all user roles

---

## 📋 Overview

This guide covers the **complete flow** from creating a new platform (tenant) to adding all user roles within an organization.

**What You'll Create:**
- 1 Platform (Healthcare Platform)
- 1 Platform Admin
- 1 Organization (St. Mary Hospital)
- 1 Organization Admin (Primary)
- 2 Additional Organization Admins
- 1 Manager
- 1 Employee
- 1 Guest

**Total Time:** ~20 minutes

---

## Phase 1: Super Admin Setup (One-Time Bootstrap)

**⚠️ This entire phase is a ONE-TIME setup to create the first super admin in the system.**

### 1.1 Start the Application

```bash
cd C:\easemycargo\sourcecode\orginal-orgcreation\manish\NuxtAuth
npm run dev
```

Server starts at: `http://localhost:3000`

### 1.2 Create Super Admin Account

**Navigate to:** `http://localhost:3000/register`

**Fill in:**
```
Username: superadmin88
Full Name: Super Admin 88
Email: superadmin88@yopmail.com
Password: SuperAdmin123!
Phone Number: (leave blank or enter optional phone)
```

**Click:** "Create Account"

### 1.3 Verify Email (Console Method)

Since you're in development, check the **terminal console** for:

```
=== EMAIL NOTIFICATION ===
To: superadmin88@yopmail.com
Subject: Verify Your Email Address
Body: ... verification token ...
```

**Copy the token** from the console (looks like: `abc123-def456-...`)

**Navigate to:** `http://localhost:3000/verify-email?token=YOUR_TOKEN`

### 1.4 Upgrade Role to Super Admin

**⚠️ IMPORTANT:** New registrations get `guest` role by default. You must manually upgrade to `super_admin` via MongoDB.

**📌 NOTE:** This step is **ONE-TIME ONLY** for creating the **first super admin**. After this, the super admin can create other users through the UI.

**Open a new PowerShell terminal** and run:

```powershell
mongosh "mongodb://localhost:27017/nuxt-auth" --eval "db.users.updateOne({ email: 'superadmin88@yopmail.com' }, { `$set: { role: 'super_admin' } })"
```

**⚠️ PowerShell Note:** Use backtick **`** (not backslash) to escape the `$` symbol.

**✅ Expected Output:**
```
{
  acknowledged: true,
  matchedCount: 1,
  modifiedCount: 1
}
```

**Verify the role change:**
```powershell
mongosh "mongodb://localhost:27017/nuxt-auth" --quiet --eval "db.users.findOne({ email: 'superadmin88@yopmail.com' }, { name: 1, email: 1, role: 1 })"
```

**✅ Should show:** `role: 'super_admin'`

### 1.5 Login as Super Admin

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: superadmin88@yopmail.com
Password: SuperAdmin123!
```

**✅ Verify:** You see the Super Admin dashboard at `/superadmin`

---

## Phase 2: Create New Platform (Tenant)

### 2.1 Navigate to Platform Creation

**From Super Admin Dashboard:**
- Click "Platforms" in sidebar
- Click "+ Create Platform" button

**Or directly:** `http://localhost:3000/superadmin/create-platform`

### 2.2 Fill Platform Details

```
Platform Name: Healthcare Platform
Description: Healthcare services management platform
Platform Code: healthcare-001
Status: Active
Contact Email: contact@healthcare.com
Contact Phone: +1-555-0100
```

**Click:** "Create Platform"

**✅ Success:** Platform created with ID displayed

### 2.3 Configure Organization Types for Platform

**Navigate to:** `http://localhost:3000/superadmin/platforms`

**Find:** "Healthcare Platform" in the list

**Click:** "Org Types" button

**Add Organization Types:**

1. **Hospital**
   - Code: `hospital`
   - Name: `Hospital`
   - Category: `healthcare`
   - Click "Add Type"

2. **Clinic**
   - Code: `clinic`
   - Name: `Clinic`
   - Category: `healthcare`
   - Click "Add Type"

3. **Laboratory**
   - Code: `laboratory`
   - Name: `Medical Laboratory`
   - Category: `healthcare`
   - Click "Add Type"

**✅ Verify:** Preview section shows "Organizations registering on this platform will see 3 type(s)"

---

## Phase 3: Create Platform Admin

### 3.1 Navigate to User Creation

**From Super Admin Dashboard:**
- Click "Users" in sidebar
- Click "+ Create User" button

**Or directly:** `http://localhost:3000/superadmin/create-user`

### 3.2 Fill Platform Admin Details

```
Name: Platform Admin One
Email: platformadmin@healthcare.com
Role: Platform Admin
Status: Active
Platform: Healthcare Platform (select from dropdown)
Send Welcome Email: ✓ (checked)
```

**Click:** "Create User"

### 3.3 Set Platform Admin Password

**Check Console Logs** for password reset token:

```
=== EMAIL NOTIFICATION ===
To: platformadmin@healthcare.com
Subject: Your Account Has Been Created
Body: ... reset password link with token ...
```

**Copy the token**

**Navigate to:** `http://localhost:3000/reset-password?token=YOUR_TOKEN`

**Set Password:**
```
New Password: PlatformAdmin123!
Confirm Password: PlatformAdmin123!
```

**Click:** "Reset Password"

### 3.4 Test Platform Admin Login

**Logout** from Super Admin

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: platformadmin@healthcare.com
Password: PlatformAdmin123!
```

**✅ Verify:** You see Platform Admin dashboard at `/platform`

---

## Phase 4: Public Organization Registration

### 4.1 Get Public Registration URL

**As Platform Admin**, navigate to: `http://localhost:3000/platform/settings`

**Copy the Public Registration URL:** `http://localhost:3000/organization-register?platform=PLATFORM_ID`

**Or directly navigate to:** `http://localhost:3000/organization-register`

### 4.2 Logout and Access Public Form

**Click:** Logout (or open incognito browser)

**Navigate to:** `http://localhost:3000/organization-register`

### 4.3 Fill Organization Registration Form

**Primary Admin Information:**
```
Your Name: John Doe
Your Email: john.doe@stmary.com
```

**Organization Information:**
```
Organization Name: St. Mary Hospital
Description: Leading healthcare provider in the region
Organization Type: Hospital (select from dropdown)
Platform: Healthcare Platform (select from dropdown)
```

**Additional Admins (Optional):**

Click "+ Add Another Admin"

**Additional Admin 1:**
```
Name: Jane Smith
Email: jane.smith@stmary.com
```

Click "+ Add Another Admin"

**Additional Admin 2:**
```
Name: Mike Johnson
Email: mike.johnson@stmary.com
```

**Click:** "Register Organization"

**✅ Success Message:** "Registration successful! 3 organization admins have been created and will be activated once the organization is approved."

### 4.4 Verify Emails Sent

**Check Console Logs** for 5 emails:

1. **To Primary Admin** (john.doe@stmary.com) - Password reset link
2. **To Additional Admin 1** (jane.smith@stmary.com) - Password reset link
3. **To Additional Admin 2** (mike.johnson@stmary.com) - Password reset link
4. **To Platform Admin** (platformadmin@healthcare.com) - Approval request
5. **To Platform Admin** (any additional platform admins) - Approval request

---

## Phase 5: Platform Admin Approves Organization

### 5.1 Login as Platform Admin

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: platformadmin@healthcare.com
Password: PlatformAdmin123!
```

### 5.2 View Pending Organizations

**Navigate to:** `http://localhost:3000/platform/organizations`

**✅ Verify:** You see "St. Mary Hospital" with status "⏳ PENDING" (yellow badge)

### 5.3 Open Organization Details

**Click:** "St. Mary Hospital" row

**You'll be taken to:** `/platform/organizations/[orgId]`

**✅ Verify Page Shows:**
- Yellow alert banner: "This organization is pending approval"
- Two buttons: "✓ Approve Organization" (green) and "✗ Reject Organization" (red)
- Organization details (name, type, description, dates)
- User list showing 3 users (all with status: PENDING)

### 5.4 Approve the Organization

**Click:** "✓ Approve Organization" button

**Confirmation Dialog:** "Are you sure you want to approve this organization?"

**Click:** "OK"

**Expected:**
- Button shows "Processing..."
- Green success message: "Organization approved successfully! User accounts have been activated."
- Yellow banner disappears
- Status badge changes to "✅ APPROVED" (green)
- All 3 users now show status: ACTIVE

### 5.5 Verify Activation Emails

**Check Console Logs** for 3 approval emails:

1. **To Primary Admin** (john.doe@stmary.com) - "Organization Approved" with password reset link
2. **To Additional Admin 1** (jane.smith@stmary.com) - Same email
3. **To Additional Admin 2** (mike.johnson@stmary.com) - Same email

**✅ All 3 admins are now ACTIVE** and can set passwords!

---

## Phase 6: Organization Admins Set Passwords

### 6.1 Primary Admin Sets Password

**From Console Logs**, copy reset token for john.doe@stmary.com

**Navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Hospital123!
Confirm Password: Hospital123!
```

**Click:** "Reset Password"

### 6.2 Additional Admin 1 Sets Password

**From Console Logs**, copy reset token for jane.smith@stmary.com

**Navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Hospital123!
Confirm Password: Hospital123!
```

**Click:** "Reset Password"

### 6.3 Additional Admin 2 Sets Password

**From Console Logs**, copy reset token for mike.johnson@stmary.com

**Navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Hospital123!
Confirm Password: Hospital123!
```

**Click:** "Reset Password"

### 6.4 Test Organization Admin Login

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: john.doe@stmary.com
Password: Hospital123!
```

**✅ Verify:** You see Organization Admin dashboard at `/org/dashboard`

---

## Phase 7: Add Manager Role

### 7.1 Navigate to User Management

**As Organization Admin** (john.doe@stmary.com)

**Navigate to:** `http://localhost:3000/org/users`

**Click:** "+ Create User" or "+ Invite User"

### 7.2 Create Manager User

```
Name: Manager Mike
Email: mike.manager@stmary.com
Role: Manager (select from dropdown)
Status: Active
Send Welcome Email: ✓ (checked)
```

**Click:** "Create User"

**✅ Success:** User created

### 7.3 Manager Sets Password

**Check Console Logs** for password reset token

**Copy token and navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Manager123!
Confirm Password: Manager123!
```

### 7.4 Test Manager Login

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: mike.manager@stmary.com
Password: Manager123!
```

**✅ Verify Access:**
- Can access `/org/dashboard` ✓
- Can access `/user/profile` ✓
- Cannot access platform admin pages ✗
- Cannot create other managers ✗

---

## Phase 8: Add Employee Role

### 8.1 Navigate to User Management

**As Organization Admin** (login as john.doe@stmary.com)

**Navigate to:** `http://localhost:3000/org/users`

**Click:** "+ Create User"

### 8.2 Create Employee User

```
Name: Employee Emma
Email: emma.employee@stmary.com
Role: Employee (select from dropdown)
Status: Active
Send Welcome Email: ✓ (checked)
```

**Click:** "Create User"

### 8.3 Employee Sets Password

**Check Console Logs** for password reset token

**Navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Employee123!
Confirm Password: Employee123!
```

### 8.4 Test Employee Login

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: emma.employee@stmary.com
Password: Employee123!
```

**✅ Verify Access:**
- Can access `/user/profile` ✓
- Can access limited org features ✓
- Cannot manage users ✗
- Cannot access org settings ✗

---

## Phase 9: Add Guest Role

### 9.1 Navigate to User Management

**As Organization Admin** (login as john.doe@stmary.com)

**Navigate to:** `http://localhost:3000/org/users`

**Click:** "+ Create User"

### 9.2 Create Guest User

```
Name: Guest Gary
Email: gary.guest@stmary.com
Role: Guest (select from dropdown)
Status: Active
Send Welcome Email: ✓ (checked)
```

**Click:** "Create User"

### 9.3 Guest Sets Password

**Check Console Logs** for password reset token

**Navigate to:** `http://localhost:3000/reset-password?token=TOKEN`

**Set Password:**
```
New Password: Guest123!
Confirm Password: Guest123!
```

### 9.4 Test Guest Login

**Navigate to:** `http://localhost:3000/login`

**Credentials:**
```
Email: gary.guest@stmary.com
Password: Guest123!
```

**✅ Verify Access:**
- Can access `/user/profile` ✓
- Very limited read-only access ✓
- Cannot modify anything ✗
- Cannot access org features ✗

---

## Phase 10: Verification - Complete User Roster

### 10.1 View All Users

**Login as Organization Admin:** john.doe@stmary.com

**Navigate to:** `http://localhost:3000/org/users`

**✅ Verify You See All 6 Users:**

| Name | Email | Role | Status |
|------|-------|------|--------|
| John Doe | john.doe@stmary.com | Organization Admin | Active |
| Jane Smith | jane.smith@stmary.com | Organization Admin | Active |
| Mike Johnson | mike.johnson@stmary.com | Organization Admin | Active |
| Manager Mike | mike.manager@stmary.com | Manager | Active |
| Employee Emma | emma.employee@stmary.com | Employee | Active |
| Guest Gary | gary.guest@stmary.com | Guest | Active |

### 10.2 Database Verification

**Open MongoDB:**

```bash
mongosh
use nuxt-auth
```

**Check Organization:**
```javascript
db.organizations.findOne({ name: "St. Mary Hospital" })
// status: "approved"
// platformId: [Healthcare Platform ID]
```

**Check All Users:**
```javascript
db.users.find({ 
  organizationId: ObjectId("YOUR_ORG_ID") 
}, { 
  name: 1, 
  email: 1, 
  role: 1, 
  status: 1 
}).pretty()
```

**Expected:** 6 users, all with status: "active"

---

## 📊 Complete Role Hierarchy Summary

### Platform Level (Healthcare Platform)

```
Healthcare Platform (Tenant)
├── Platform Admin: platformadmin@healthcare.com
│   ├── Can approve/reject organizations
│   ├── Can manage platform settings
│   └── Can view all organizations under platform
│
└── Organizations
    └── St. Mary Hospital
        ├── Organization Admins (3)
        │   ├── john.doe@stmary.com (Primary)
        │   ├── jane.smith@stmary.com
        │   └── mike.johnson@stmary.com
        ├── Manager (1)
        │   └── mike.manager@stmary.com
        ├── Employee (1)
        │   └── emma.employee@stmary.com
        └── Guest (1)
            └── gary.guest@stmary.com
```

### Global Hierarchy

```
Super Admin (superadmin88@yopmail.com)
    │
    └── Can create/manage platforms
        │
        └── Platform Admin (platformadmin@healthcare.com)
            │
            └── Can approve organizations
                │
                └── Organization Admin (3 admins)
                    │
                    ├── Manager (can manage team)
                    │
                    ├── Employee (regular user)
                    │
                    └── Guest (read-only)
```

---

## 🎯 Access Control Matrix

| Feature | Super Admin | Platform Admin | Org Admin | Manager | Employee | Guest |
|---------|-------------|----------------|-----------|---------|----------|-------|
| Create Platforms | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Approve Organizations | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ |
| Manage Org Settings | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Org Admins | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Managers | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ |
| Create Employees | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| View Org Dashboard | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Manage Documents | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ |

---

## 🔍 Testing Each Role's Access

### Test Super Admin Access

**Login:** superadmin88@yopmail.com

**Can Access:**
- `/superadmin` - Dashboard
- `/superadmin/platforms` - Manage all platforms
- `/superadmin/create-platform` - Create new platforms
- `/superadmin/users` - View all users across all platforms
- `/superadmin/organizations` - View all organizations

**Cannot Be Restricted:** Has access to everything

---

### Test Platform Admin Access

**Login:** platformadmin@healthcare.com

**Can Access:**
- `/platform/dashboard` - Platform dashboard
- `/platform/organizations` - View organizations in Healthcare Platform
- `/platform/organizations/[id]` - Approve/reject organizations
- `/platform/settings` - Platform settings

**Cannot Access:**
- `/superadmin/*` - Super admin features
- `/org/*` - Organization-specific features (unless also org admin)
- Other platforms' data

---

### Test Organization Admin Access

**Login:** john.doe@stmary.com

**Can Access:**
- `/org/dashboard` - Organization dashboard
- `/org/users` - Manage users in St. Mary Hospital
- `/org/settings` - Organization settings
- `/org/invites` - Invite users
- `/org/documents` - Manage documents

**Cannot Access:**
- `/superadmin/*` - Super admin features
- `/platform/*` - Platform admin features
- Other organizations' data

---

### Test Manager Access

**Login:** mike.manager@stmary.com

**Can Access:**
- `/org/dashboard` - View organization dashboard
- `/user/profile` - Own profile
- Limited team management features

**Cannot Access:**
- `/org/settings` - Organization settings
- `/org/users` - Cannot create/delete users
- `/platform/*` - Platform features
- `/superadmin/*` - Super admin features

---

### Test Employee Access

**Login:** emma.employee@stmary.com

**Can Access:**
- `/user/profile` - Own profile
- Limited read access to org features

**Cannot Access:**
- User management
- Organization settings
- Platform/Super admin features

---

### Test Guest Access

**Login:** gary.guest@stmary.com

**Can Access:**
- `/user/profile` - Own profile only
- Very limited read-only access

**Cannot Access:**
- Almost all organization features
- Any administrative functions

---

## 🚀 Quick Commands Reference

### Start Application
```bash
npm run dev
```

### MongoDB Queries

**View all users in organization:**
```javascript
db.users.find({ organizationId: ObjectId("ORG_ID") }, { name: 1, email: 1, role: 1, status: 1 })
```

**View all organizations in platform:**
```javascript
db.organizations.find({ platformId: ObjectId("PLATFORM_ID") }, { name: 1, status: 1 })
```

**View all platforms:**
```javascript
db.platforms.find({}, { name: 1, code: 1 })
```

**Count users by role:**
```javascript
db.users.aggregate([
  { $match: { organizationId: ObjectId("ORG_ID") } },
  { $group: { _id: "$role", count: { $sum: 1 } } }
])
```

---

## ✅ Completion Checklist

- [ ] Super Admin created and verified
- [ ] Platform created (Healthcare Platform)
- [ ] Organization types configured (3 types)
- [ ] Platform Admin created and can login
- [ ] Organization registered (St. Mary Hospital)
- [ ] Platform Admin approved organization
- [ ] Primary Org Admin can login (john.doe@stmary.com)
- [ ] Additional Org Admin 1 can login (jane.smith@stmary.com)
- [ ] Additional Org Admin 2 can login (mike.johnson@stmary.com)
- [ ] Manager created and can login (mike.manager@stmary.com)
- [ ] Employee created and can login (emma.employee@stmary.com)
- [ ] Guest created and can login (gary.guest@stmary.com)
- [ ] All 6 users visible in org users list
- [ ] Access control verified for each role

**Total Users Created:** 9 (1 Super Admin + 1 Platform Admin + 3 Org Admins + 1 Manager + 1 Employee + 1 Guest)

---

## 🎉 Congratulations!

You've successfully set up a complete tenant with all user roles! The system now has:

- ✅ 1 Platform (tenant) with proper configuration
- ✅ 1 Platform Admin managing the tenant
- ✅ 1 Approved organization
- ✅ 6 Users with different roles in the organization
- ✅ Complete role-based access control working
- ✅ Email notifications for all steps
- ✅ Password reset functionality tested

**Next Steps:**
- Add more organizations to the platform
- Configure document requirements
- Set up organization-specific settings
- Test document upload/approval workflows
- Configure platform-specific features

---

## 📞 Troubleshooting

### Issue: Can't login after setting password

**Solution:** Check user status in database:
```javascript
db.users.findOne({ email: "USER_EMAIL" })
// status should be "active", not "pending"
```

If status is "pending", organization may not be approved yet.

---

### Issue: Organization not appearing for Platform Admin

**Solution:** Verify platformId matches:
```javascript
db.organizations.findOne({ _id: ObjectId("ORG_ID") })
// platformId should match platform admin's platformId
```

---

### Issue: Can't create users

**Solution:** 
1. Verify you're logged in as Organization Admin
2. Check organizationId is set
3. Verify you have proper permissions

---

### Issue: Emails not received

**Solution:** Check console logs. In development, emails are logged to console, not actually sent (unless SMTP is configured).

---

**Document Version:** 1.0  
**Last Updated:** December 15, 2025  
**Maintained By:** Development Team
