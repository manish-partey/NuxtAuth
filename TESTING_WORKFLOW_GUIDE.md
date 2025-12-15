# Complete Workflow Testing Guide

## Test Users Created
You mentioned you have these 4 users already created:
- `hb_superadmin@test.com` - Super Admin
- `hb_platformadmin@test.com` - Platform Admin  
- `hb_orgadmin@test.com` - Organization Admin
- `hb_user@test.com` - Regular User

## Testing Workflow

### Phase 1: Super Admin Setup

#### 1. Login as Super Admin
```
Email: hb_superadmin@test.com
Password: [your password]
```

#### 2. Create Platform
Navigate to: `/superadmin/platforms`
- Click "Create New Platform"
- Name: `Hotel Booking Test Platform`
- Description: `Test platform for hotel booking management`
- Click Submit

#### 3. Assign Platform Admin
Navigate to: `/superadmin/users`
- Find user: `hb_platformadmin@test.com`
- Change role to: `platform_admin`
- Select Platform: `Hotel Booking Test Platform`
- Click Save

**Expected Result:**
- ✅ Platform admin receives email with password reset link
- ✅ Email shows platform name and responsibilities
- ✅ Token valid for 24 hours

---

### Phase 2: Platform Admin Creates Organizations

#### 4. Login as Platform Admin
```
Email: hb_platformadmin@test.com
Password: [your password or use reset link from email]
```

#### 5. Create High Trust Organization
Navigate to: `/organization-register`
- Platform: Auto-selected (`Hotel Booking Test Platform`)
- Organization Name: `Marriott Downtown Test`
- Organization Type: `Hotel`
- **Trust Level: High** (Immediate approval)
- Primary Admin Email: `marriott-admin@test.com`
- Additional Admins:
  - `operations@marriott.com`
  - `gm@marriott.com`
- Click Submit

**Expected Result:**
- ✅ Organization status: `Approved` immediately
- ✅ All 3 admins receive password reset emails
- ✅ Can start using system right away

#### 6. Create Low Trust Organization
Navigate to: `/organization-register`
- Platform: Auto-selected
- Organization Name: `Sunset Inn Test`
- Organization Type: `Hotel`
- **Trust Level: Low** (Requires verification)
- Primary Admin Email: `owner@sunsetinn.com`
- Click Submit

**Expected Result:**
- ✅ Organization status: `Pending Documents`
- ✅ Admin receives email requesting documents
- ✅ Must upload business license, tax ID before approval

#### 7. View Organizations
Navigate to: `/platform/organizations`

**Expected to see:**
- ✅ Marriott Downtown Test - Status Badge with icon
- ✅ Sunset Inn Test - Status Badge with icon
- ✅ Color-coded status indicators

---

### Phase 3: Super Admin Drill-Down

#### 8. View Platform Details
Navigate to: `/superadmin/platforms`
- Click on platform name "Hotel Booking Test Platform"
- OR click "View Details" button

**Expected to see:**
- Statistics: Total orgs, approved count, pending count
- Organizations table with all orgs
- User counts per organization
- Click-through to org details

#### 9. Drill Down to Organization
Click on: `Marriott Downtown Test`

**Expected to see:**
- Organization information
- All users in the organization (3 admins)
- User roles, status, verification status
- Last login times

---

### Phase 4: Organization Admin Operations

#### 10. Login as Org Admin
First, assign hb_orgadmin to an organization:

As Super Admin:
- Navigate to `/superadmin/users`
- Find: `hb_orgadmin@test.com`
- Change role to: `organization_admin`
- Select Organization: `Marriott Downtown Test`
- Save

Then login as:
```
Email: hb_orgadmin@test.com
Password: [your password]
```

#### 11. Organization Dashboard
Navigate to: `/org/dashboard`

**Expected features:**
- Organization statistics
- Platform information display
- Quick action cards

#### 12. Invite Users
Navigate to: `/org/invites`
- Invite staff members (manager, employee)
- Set appropriate roles
- Staff receives invitation emails

---

## API Testing (Optional)

### Test Platform Admin Email Notification

**Endpoint:** `POST /api/user/update`

**Body:**
```json
{
  "userId": "[hb_platformadmin_id]",
  "role": "platform_admin",
  "platformId": "[platform_id]"
}
```

**Expected:**
- ✅ User role updated
- ✅ Password reset token generated
- ✅ Email sent to hb_platformadmin@test.com
- ✅ Email contains: platform name, reset link, responsibilities, security warnings

---

### Test Platform Admin Org Creation

**Endpoint:** `POST /api/platform/organization/register`

**Headers:**
```
Cookie: auth_token=[platform_admin_token]
```

**Body:**
```json
{
  "name": "Test Hotel",
  "type": "[hotel_type_id]",
  "trustLevel": "high",
  "primaryAdmin": {
    "name": "Test Admin",
    "email": "testadmin@test.com"
  },
  "additionalAdmins": [
    {
      "name": "Test Manager",
      "email": "testmanager@test.com"
    }
  ]
}
```

**Expected:**
- ✅ Organization created with status "approved"
- ✅ Both admins created with reset tokens
- ✅ Emails sent to both admins
- ✅ Platform admin notified

---

### Test Drill-Down APIs

**Get Platform Organizations:**
```
GET /api/superadmin/platforms/[platform_id]/organizations
```

**Get Organization Users:**
```
GET /api/superadmin/platforms/[platform_id]/organizations/[org_id]/users
```

---

## Verification Checklist

### ✅ Email Notifications
- [ ] Platform admin receives welcome email when assigned
- [ ] Email includes platform name in subject
- [ ] Reset link is included and valid for 24 hours
- [ ] Responsibilities list is displayed
- [ ] Security warnings are present

### ✅ Trust-Based Approval
- [ ] High trust orgs get immediate "approved" status
- [ ] Low trust orgs get "pending_documents" status
- [ ] Multiple org admins all receive emails
- [ ] Password reset tokens work correctly

### ✅ Drill-Down Navigation
- [ ] Super admin can click platform name
- [ ] Platform detail shows organization list
- [ ] Organization detail shows user list
- [ ] Back navigation works via breadcrumbs
- [ ] Statistics are accurate at each level

### ✅ Status Badges
- [ ] All organization states have icons
- [ ] Approved shows ✅ green
- [ ] Pending shows ⏳ yellow
- [ ] Needs Documents shows 📋 blue
- [ ] Under Review shows 🔍 orange
- [ ] Rejected shows ❌ red
- [ ] Suspended shows ⏸️ gray

### ✅ Role-Based Access
- [ ] Super admin can access all features
- [ ] Platform admin limited to their platform
- [ ] Org admin limited to their organization
- [ ] Regular users have minimal access
- [ ] Unauthorized access attempts are blocked

---

## Quick Test Commands

### Check Email Logs (if using console logging)
```powershell
# In your server logs, look for:
[INFO] Platform admin welcome email sent to: hb_platformadmin@test.com
[INFO] Organization admin password reset email sent to: [email]
```

### Query MongoDB Directly
```javascript
// Check platform admin assignment
db.users.findOne({ email: "hb_platformadmin@test.com" })
// Should have: role="platform_admin", platformId=[ObjectId], resetPasswordToken

// Check organizations
db.organizations.find({ platformId: [platform_id] })
// Should show orgs with different statuses based on trustLevel

// Check audit logs
db.auditlogs.find({}).sort({createdAt: -1}).limit(10)
```

---

## Troubleshooting

### Platform Admin Doesn't Receive Email
- Check email service configuration in `.env`
- Check server console for email errors
- Verify SMTP settings are correct
- Check spam folder

### Organization Not Created
- Verify platform admin is logged in
- Check platform admin has valid platformId
- Ensure organization type exists (run init-org-type-system.mjs)
- Check server logs for errors

### Drill-Down Navigation Not Working
- Verify super_admin role
- Check route middleware
- Ensure platform/org IDs are valid ObjectIds
- Check browser console for errors

### Status Badges Not Showing
- Clear browser cache
- Check CSS classes are loaded
- Verify organization status field exists
- Inspect element to see applied classes

---

## Success Criteria

Your implementation is working correctly if:
1. ✅ All 4 test users can login with appropriate access levels
2. ✅ Super admin can assign platform admin and email is sent
3. ✅ Platform admin can create orgs with different trust levels
4. ✅ High trust orgs are approved immediately
5. ✅ Low trust orgs require document verification
6. ✅ Super admin can drill down: Platforms → Organizations → Users
7. ✅ Status badges display correctly with icons and colors
8. ✅ All emails contain correct information and working reset links
9. ✅ Role-based access control works at all levels
10. ✅ Audit logs capture all important actions

---

## Next Steps After Testing

1. **Production Readiness:**
   - Configure real SMTP service (SendGrid, AWS SES, etc.)
   - Set up email templates with company branding
   - Configure proper domain for reset links
   - Enable SSL/TLS for security

2. **Additional Features:**
   - Document upload interface for low-trust orgs
   - Approval workflow UI for super admin
   - Notification system for pending actions
   - Analytics dashboard for platform metrics

3. **Performance:**
   - Add caching for frequently accessed data
   - Optimize drill-down queries with indexes
   - Implement pagination for large lists
   - Add search and filter capabilities

4. **Security:**
   - Enable rate limiting on sensitive endpoints
   - Add CSRF protection
   - Implement audit log review system
   - Set up monitoring and alerts

---

## Contact & Support

For issues or questions:
- Check server logs first
- Review API error messages
- Consult implementation documentation
- Test with Postman/Insomnia for API issues
