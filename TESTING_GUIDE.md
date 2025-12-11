# Testing Guide: Organization Self-Registration Workflow

## Use Case: Sunrise Grand Hotel Registration

This guide walks you through the complete workflow using a real-world example.

---

## 📋 Prerequisites

1. **Server Running**: Make sure your Nuxt application is running
   ```bash
   npm run dev
   ```

2. **Database Access**: You should have MongoDB Atlas connection configured

3. **Existing Platform**: You need at least one platform created (e.g., "HotelHub")

4. **Platform Admin Account**: You need a platform admin user to approve registrations

---

## 🎯 Scenario

**Goal**: A new hotel owner wants to register their hotel "Sunrise Grand Hotel" on the HotelHub platform.

### Actors:
- **Hotel Owner**: New user wanting to register their organization
- **Platform Admin**: Existing HotelHub admin who will approve the registration

---

## 📝 Step-by-Step Testing

### **Step 1: Public Registration (No Login Required)**

1. **Open your browser** and navigate to:
   ```
   http://localhost:3000/organization-register
   ```

2. **Fill in the registration form**:

   **Your Information:**
   - Name: `John Smith`
   - Email: `john.smith@sunrisehotel.com`
   - Password: `SecurePass123`

   **Organization Details:**
   - Select Platform: `HotelHub` (or your platform name)
   - Organization Name: `Sunrise Grand Hotel`
   - Organization Type: Select `Hotel` or appropriate type
   - Description (Optional): `A luxury beachfront hotel offering world-class amenities`

3. **Submit the form**

4. **Expected Result**:
   - ✅ Success message appears: "Registration successful! Your organization is pending approval..."
   - ✅ You see a link to login
   - ✅ Form is cleared

5. **Check Server Console**:
   You should see email notifications logged:
   ```
   === EMAIL NOTIFICATION ===
   To: john.smith@sunrisehotel.com
   Subject: Organization Registration Received: Sunrise Grand Hotel
   ...
   
   === EMAIL NOTIFICATION ===
   To: [platform-admin-email]
   Subject: New Organization Pending Approval: Sunrise Grand Hotel
   ...
   ```

---

### **Step 2: Check Database (Optional)**

Open MongoDB Compass or Atlas and verify:

**Organizations Collection:**
```javascript
{
  name: "Sunrise Grand Hotel",
  status: "pending",
  platformId: ObjectId("..."),
  createdBy: ObjectId("..."),
  approvedBy: null,
  approvedAt: null
}
```

**Users Collection:**
```javascript
{
  name: "John Smith",
  email: "john.smith@sunrisehotel.com",
  role: "organization_admin",
  status: "pending",
  organizationId: ObjectId("..."),
  platformId: ObjectId("...")
}
```

---

### **Step 3: Platform Admin Reviews Registration**

1. **Login as Platform Admin**:
   ```
   http://localhost:3000/login
   ```
   Use your platform admin credentials

2. **Navigate to Pending Approvals**:
   - Click on **"Approvals"** in the navigation menu
   - OR click **"Pending Approvals"** card on the dashboard
   - OR go directly to: `http://localhost:3000/platform/pending-organizations`

3. **Review the Pending Organization**:
   You should see a card showing:
   - 🟠 Status badge: "Pending"
   - Organization Name: "Sunrise Grand Hotel"
   - Description: "A luxury beachfront hotel..."
   - Type: Hotel icon + name
   - Requested By: John Smith (john.smith@sunrisehotel.com)
   - Requested On: [timestamp]

---

### **Step 4: Test Approval Flow**

1. **Click "Approve" button** on the Sunrise Grand Hotel card

2. **Confirm approval** in the confirmation dialog

3. **Expected Result**:
   - ✅ Success message: "Organization approved successfully"
   - ✅ Card now shows green "Approved" badge
   - ✅ Shows "Approved By" and "Approved At" information
   - ✅ Approve/Reject buttons are hidden

4. **Check Server Console**:
   ```
   [APPROVE-ORG] Organization approved: Sunrise Grand Hotel
   
   === EMAIL NOTIFICATION ===
   To: john.smith@sunrisehotel.com
   Subject: Organization Approved: Sunrise Grand Hotel
   Body: Congratulations! Your Organization Has Been Approved...
   ```

5. **Check Database**:
   ```javascript
   // Organization
   {
     status: "approved",
     approvedBy: ObjectId("[platform-admin-id]"),
     approvedAt: ISODate("2025-12-11T...")
   }
   
   // User
   {
     status: "active"  // Changed from "pending"
   }
   ```

---

### **Step 5: Test User Can Login**

1. **Logout** from platform admin account

2. **Login as the new organization admin**:
   - Email: `john.smith@sunrisehotel.com`
   - Password: `SecurePass123`

3. **Expected Result**:
   - ✅ Successful login
   - ✅ Redirected to organization dashboard
   - ✅ Can see organization name: "Sunrise Grand Hotel"
   - ✅ Has organization admin capabilities

---

### **Step 6: Test Rejection Flow (Optional)**

To test the rejection workflow, create another test registration:

1. **Register another organization** (Step 1 again):
   - Name: `Beach Paradise Resort`
   - Email: `owner@beachparadise.com`
   - Password: `TestPass123`

2. **Login as Platform Admin** and navigate to Pending Approvals

3. **Click "Reject" button** on Beach Paradise Resort card

4. **Fill in rejection reason**:
   ```
   We currently have reached our maximum capacity for hotel registrations. 
   Please reapply after Q1 2026.
   ```

5. **Submit rejection**

6. **Expected Result**:
   - ✅ Success message: "Organization rejected"
   - ✅ Card shows red "Rejected" badge
   - ✅ Shows rejection reason, rejected by, and timestamp

7. **Check Console for Email**:
   ```
   === EMAIL NOTIFICATION ===
   To: owner@beachparadise.com
   Subject: Organization Registration Update: Beach Paradise Resort
   Body: Unfortunately, your organization registration could not be approved...
   Reason: We currently have reached our maximum capacity...
   ```

---

## 🧪 Advanced Testing Scenarios

### **Test Concurrency Control**

Test what happens when two admins try to approve the same organization:

1. Create a pending organization
2. Login as platform admin in **two different browsers** (or incognito)
3. Navigate to pending organizations in both
4. Click "Approve" in **both browsers simultaneously**
5. **Expected**: Second approval should fail with error message showing who already approved it

---

### **Test Status Filtering**

1. Create multiple organizations with different statuses
2. Use the status filter tabs:
   - **Pending**: Shows only pending organizations
   - **Approved**: Shows only approved organizations
   - **Rejected**: Shows only rejected organizations
   - **All**: Shows all organizations

---

### **Test Validation**

Try these error scenarios:

1. **Duplicate Email**: Register with same email twice
   - Expected: Error message about existing email

2. **Duplicate Organization Name**: Register same org name in same platform
   - Expected: Error about duplicate organization name

3. **Short Password**: Try password less than 6 characters
   - Expected: Password validation error

4. **Missing Required Fields**: Submit form with empty fields
   - Expected: Browser validation prevents submission

5. **Short Rejection Reason**: Try rejecting with less than 10 characters
   - Expected: Error about minimum reason length

---

## 🔍 Troubleshooting

### Issue: Emails not showing in console

**Check**:
- Server console is visible and running
- No SMTP settings in environment (should fallback to console)
- Check for `[EMAIL]` prefix in console logs

### Issue: Can't see pending organizations

**Check**:
- Logged in as correct platform admin
- Organization was created for the same platform
- Organization status is "pending"
- Check browser console for API errors

### Issue: Approval fails

**Check**:
- Organization hasn't been approved/rejected already
- User has platform_admin role
- Organization belongs to admin's platform
- Check server logs for detailed error

### Issue: User can't login after approval

**Check**:
- Organization was actually approved (check database)
- User status changed to "active"
- Using correct email/password
- Check auth middleware logs

---

## 📊 Verification Checklist

After testing, verify these items:

- [ ] Public registration form is accessible without login
- [ ] Organization created with "pending" status
- [ ] User created with "pending" status
- [ ] Confirmation email logged to console (or sent if SMTP configured)
- [ ] Platform admin notification logged/sent
- [ ] Platform admin can see pending organization
- [ ] Approval changes status to "approved"
- [ ] Approval activates user account
- [ ] Approval email sent to user
- [ ] User can login after approval
- [ ] Rejection requires reason (min 10 chars)
- [ ] Rejection email sent with reason
- [ ] Status filtering works correctly
- [ ] Concurrency control prevents double approval
- [ ] Duplicate validations work

---

## 🚀 Next Steps

After successful testing:

1. **Configure Real Email** (Optional):
   - Set up SMTP credentials in `.env`
   - Test with real email delivery

2. **Customize Email Templates**:
   - Edit `server/utils/email.ts`
   - Update branding, colors, content

3. **Production Deployment**:
   - Set production environment variables
   - Configure production SMTP service
   - Test complete flow in production

4. **User Training**:
   - Train platform admins on approval process
   - Provide registration link to potential organizations
   - Set up monitoring for pending approvals

---

## 📧 Email Configuration (Optional)

To enable real email sending instead of console logs:

1. **Update `.env` file**:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   EMAIL_FROM=noreply@yourdomain.com
   NUXT_PUBLIC_BASE_URL=https://yourdomain.com
   ```

2. **For Gmail**:
   - Enable 2-factor authentication
   - Generate App Password
   - Use App Password as SMTP_PASS

3. **Restart server** to pick up new environment variables

4. **Test**: New registrations should send real emails

---

## 📝 Notes

- All actions are logged in the database with timestamps and user IDs
- Rejection reasons are stored for audit trail
- Concurrency control prevents race conditions
- Email failures don't block approval/rejection
- Public registration page has no authentication requirement
- Platform admins can only manage organizations in their platform
