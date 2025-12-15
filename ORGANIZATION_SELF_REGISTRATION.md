# Organization Self-Registration with Approval Workflow

## Overview
This feature allows anyone to publicly register their organization under a platform. Registrations are created with "pending" status and require platform admin approval before becoming active.

## User Flow

### 1. Public Registration
- **URL**: `/organization-register` (publicly accessible, no login required)
- User fills in:
  - Personal information (name, email, password)
  - Organization details (name, type, description)
  - Platform selection

### 2. Pending Status
- Organization and user account are created with `pending` status
- User receives confirmation email
- Platform admins receive notification email

### 3. Platform Admin Review
- **URL**: `/platform/pending-organizations`
- Platform admins can:
  - View all pending organizations
  - See organization details and requester information
  - Approve or reject registrations
  - Filter by status (Pending/Approved/Rejected/All)

### 4. Approval/Rejection
- **Approval**:
  - Organization status → `approved`
  - User status → `active`
  - User becomes `organization_admin`
  - Approval email sent to user with login link
  
- **Rejection**:
  - Organization status → `rejected`
  - Requires reason (minimum 10 characters)
  - Rejection email sent to user with reason

## Database Schema

### Organization Model Additions
```typescript
{
  status: 'pending' | 'approved' | 'rejected',
  createdBy: ObjectId,        // User who created the organization
  approvedBy: ObjectId,        // Platform admin who approved
  approvedAt: Date,
  rejectedBy: ObjectId,        // Platform admin who rejected
  rejectedAt: Date,
  rejectionReason: String
}
```

### User Model
```typescript
{
  status: 'pending' | 'active' | 'inactive',
  role: 'organization_admin',  // Set during registration
  organizationId: ObjectId,
  platformId: ObjectId
}
```

## API Endpoints

### Public Endpoint
```
POST /api/public/register-organization
Body: {
  name: string,
  email: string,
  password: string,
  organizationName: string,
  organizationDescription?: string,
  organizationType: string,
  platformId: string
}
```

### Platform Admin Endpoints
```
GET /api/platform/pending-organizations?status=pending|approved|rejected|all

POST /api/platform/organizations/:orgId/approve
Response: {
  success: boolean,
  message: string,
  organization: {...}
}

POST /api/platform/organizations/:orgId/reject
Body: { reason: string }
Response: {
  success: boolean,
  message: string,
  organization: {...}
}
```

## Email Notifications

### Email Templates
1. **Registration Confirmation** → Sent to user after registration
2. **Pending Approval Notification** → Sent to all platform admins
3. **Organization Approved** → Sent to user when approved
4. **Organization Rejected** → Sent to user with rejection reason

### Email Configuration
Set these environment variables (optional - will log to console if not configured):
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
NUXT_PUBLIC_BASE_URL=https://yourdomain.com
```

### Email Fallback
If SMTP is not configured, emails are logged to the console for development/testing.

## Concurrency Control
The approval/rejection endpoints implement optimistic locking to prevent race conditions:
- Check if organization is already approved/rejected
- Return 409 Conflict if status has changed
- Show who performed the action and when

## Security Features
- Platform admin can only approve/reject organizations within their platform
- Rejection requires mandatory reason (audit trail)
- All actions are logged with user IDs and timestamps
- Duplicate organization names prevented per platform
- Email validation and duplicate email checks

## Testing

### Test Registration Flow
1. Navigate to `/organization-register` (no login required)
2. Fill in all required fields
3. Submit registration
4. Check console for email logs (if SMTP not configured)
5. Login as platform admin
6. Navigate to `/platform/pending-organizations`
7. Review and approve/reject the organization

### Test Concurrency
1. Create a pending organization
2. Open pending organizations page in two browser tabs (same platform admin)
3. Try to approve from both tabs simultaneously
4. Second approval should fail with 409 Conflict

## UI Components

### Pages
- `pages/organization-register.vue` - Public registration form
- `pages/platform/pending-organizations.vue` - Platform admin approval interface

### Features
- Status filter tabs (Pending/Approved/Rejected/All)
- Organization cards with full details
- Approve button with confirmation
- Reject button with modal (requires reason)
- Success/error message handling
- Loading states during processing

## Database Queries

### Find Pending Organizations
```javascript
await Organization.find({
  platformId: user.platformId,
  status: 'pending'
})
.populate('type', 'name code icon')
.populate('createdBy', 'name email')
.sort({ createdAt: -1 })
```

### Approve Organization
```javascript
const org = await Organization.findOneAndUpdate(
  { _id: orgId, status: 'pending' },
  { 
    status: 'approved',
    approvedBy: userId,
    approvedAt: new Date()
  },
  { new: true }
)
```

## Navigation Updates
- Platform admin navbar: Added "Approvals" link
- Platform dashboard: Added "Pending Approvals" card (orange theme)
- Dashboard shows count of pending organizations

## Future Enhancements
- Email verification for new users
- Configurable approval workflow (auto-approve, multi-step approval)
- Organization onboarding checklist
- Approval delegation
- Bulk approve/reject
- Email templates customization via admin UI
- SMS notifications
- Webhook notifications for integrations
