# Activity Feed Feature Documentation

## 🎯 Overview
Real-time activity feed that shows all actions happening across the platform with role-based filtering and auto-refresh capabilities.

## ✨ Features Implemented

### 1. **Backend API** (`server/api/activity/feed.get.ts`)
- ✅ Role-based filtering (super admin sees all, platform admin sees their platform, org admin sees their org)
- ✅ Pagination support (limit, skip)
- ✅ Action filtering by type
- ✅ User and organization population
- ✅ Total count for pagination

### 2. **Reusable Component** (`components/ActivityFeed.vue`)
- ✅ Beautiful card-based UI with icons
- ✅ Color-coded actions (green=create, red=delete, blue=update, etc.)
- ✅ Time-ago formatting ("2 minutes ago", "3 hours ago")
- ✅ Auto-refresh with visual indicator
- ✅ Filter dropdown for action types
- ✅ Empty and loading states
- ✅ Metadata display (role, IP address, time)

### 3. **Dashboard Integration**
- ✅ Super Admin Dashboard (`/superadmin`)
- ✅ Platform Admin Dashboard (`/platform`)
- ✅ Organization Admin Dashboard (`/org/dashboard`)

## 📊 Usage

### Basic Usage
```vue
<ActivityFeed :limit="20" />
```

### With Auto-Refresh
```vue
<ActivityFeed 
  :limit="20" 
  :auto-refresh="true" 
  :refresh-interval="30000" 
/>
```

### Without Filters
```vue
<ActivityFeed 
  :limit="20" 
  :show-filters="false" 
/>
```

## 🎨 Activity Icons & Colors

| Action | Icon | Color |
|--------|------|-------|
| User Created | 👤 | Green |
| User Updated | ✏️ | Blue |
| User Removed | 🗑️ | Red |
| Role Changed | 🔄 | Blue |
| Password Reset | 🔑 | Purple |
| User Suspended | ⏸️ | Orange |
| User Activated | ✅ | Green |
| Organization Updated | 🏢 | Blue |
| Settings Updated | ⚙️ | Gray |
| User Invited | 📧 | Purple |
| Org Type Approved | ✅ | Green |
| Org Type Rejected | ⛔ | Red |

## 🔐 Security

### Role-Based Filtering
- **Super Admin**: Sees all activity across all platforms
- **Platform Admin**: Sees activity for their platform only
- **Organization Admin**: Sees activity for their organization only
- **Regular Users**: See only their own activity

### API Authentication
- Requires authenticated user
- Uses `getUserFromEvent` middleware
- Returns 401 for unauthenticated requests

## 📡 API Endpoints

### GET `/api/activity/feed`

**Query Parameters:**
- `limit` (number, default: 50) - Number of activities to return
- `skip` (number, default: 0) - Number of activities to skip
- `action` (string, optional) - Filter by specific action type

**Response:**
```json
{
  "success": true,
  "activities": [
    {
      "_id": "...",
      "action": "user_created",
      "targetType": "user",
      "userId": {
        "name": "John Doe",
        "email": "john@example.com",
        "role": "super_admin"
      },
      "organizationId": {
        "name": "Marriott Hotels"
      },
      "description": "Created new user",
      "ipAddress": "192.168.1.1",
      "createdAt": "2025-12-12T10:30:00Z"
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

## 🚀 Performance

### Auto-Refresh
- Default: 30 seconds
- Configurable via `refreshInterval` prop
- Automatically cleans up on component unmount
- Visual indicator shows when auto-refresh is active

### Pagination
- Limit controls number of items loaded
- Skip enables "Load More" functionality
- Total count returned for pagination UI

## 🎯 Future Enhancements

### Phase 2 (Optional)
1. **Real-time WebSocket/SSE** - Push updates instead of polling
2. **Activity Details Modal** - Click activity to see full details
3. **Export to CSV** - Download activity logs
4. **Advanced Filters** - Date range, user filter, organization filter
5. **Activity Analytics** - Charts showing activity trends
6. **Email Digests** - Daily/weekly email summaries
7. **Custom Alerts** - Notify on specific activity types
8. **Activity Search** - Full-text search through activities

### Phase 3 (Enterprise)
1. **Retention Policies** - Auto-archive old activities
2. **Compliance Reports** - Generate audit reports for compliance
3. **Role-based Subscriptions** - Subscribe to specific activity types
4. **Slack/Teams Integration** - Post activities to channels
5. **Activity Playback** - Replay user actions for debugging

## 🐛 Troubleshooting

### Activity Feed Not Loading
1. Check user authentication (must be logged in)
2. Verify audit logs exist in database
3. Check browser console for errors
4. Verify API endpoint is accessible

### Auto-Refresh Not Working
1. Ensure `autoRefresh` prop is `true`
2. Check `refreshInterval` value (must be > 0)
3. Verify component is not unmounted prematurely
4. Check network tab for polling requests

### Wrong Activities Showing
1. Verify user role is correct
2. Check `platformId` and `organizationId` on user
3. Review audit log filter logic in API
4. Confirm audit logs have correct metadata

## 📈 Impact

### User Experience
- ✅ Admins see real-time platform activity
- ✅ Feels like "live" system instead of static forms
- ✅ Proactive issue detection ("Oh, someone just got suspended")
- ✅ Increased engagement (check dashboard daily)

### Sales & Demos
- ✅ Shows sophistication during demos
- ✅ Differentiates from competitors
- ✅ Enables upsell (premium = longer retention, exports, alerts)
- ✅ Builds trust ("I can see everything happening")

### Operations
- ✅ Easier debugging (see exactly what happened)
- ✅ Audit trail for compliance
- ✅ User behavior insights
- ✅ Support team can verify user claims

## 🎊 Success!

The Activity Feed is now live on all three dashboards:
- `/superadmin` - Super Admin Dashboard
- `/platform` - Platform Admin Dashboard  
- `/org/dashboard` - Organization Admin Dashboard

**Auto-refreshes every 30 seconds** with a visual indicator showing it's live! 🚀
