<template>
  <div class="p-6 bg-white rounded-lg shadow">
    <h2 class="text-2xl font-bold mb-4">Feature Flags Example</h2>
    
    <!-- Loading State -->
    <div v-if="loading" class="text-gray-500">
      Loading features...
    </div>

    <!-- Feature Status -->
    <div v-else class="space-y-4">
      <div class="border-b pb-4">
        <h3 class="text-lg font-semibold mb-2">Current Role: {{ userRole || 'Not logged in' }}</h3>
      </div>

      <!-- Organization Admin Features -->
      <div v-if="userRole === 'organization_admin'" class="space-y-2">
        <h4 class="font-semibold text-gray-700">Organization Admin Features:</h4>
        
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('auditLogs') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('auditLogs') ? '✓' : '✗' }}
            </span>
            <span>Audit Logs</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('passwordResetTrigger') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('passwordResetTrigger') ? '✓' : '✗' }}
            </span>
            <span>Password Reset Trigger</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('organizationDetails') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('organizationDetails') ? '✓' : '✗' }}
            </span>
            <span>Organization Details</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('editOrganization') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('editOrganization') ? '✓' : '✗' }}
            </span>
            <span>Edit Organization</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('userManagement') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('userManagement') ? '✓' : '✗' }}
            </span>
            <span>User Management</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('documentManagement') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('documentManagement') ? '✓' : '✗' }}
            </span>
            <span>Document Management</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('inviteUsers') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('inviteUsers') ? '✓' : '✗' }}
            </span>
            <span>Invite Users</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('settings.profile') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('settings.profile') ? '✓' : '✗' }}
            </span>
            <span>Profile Settings</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('settings.password') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('settings.password') ? '✓' : '✗' }}
            </span>
            <span>Password Settings</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('settings.organizationSettings') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('settings.organizationSettings') ? '✓' : '✗' }}
            </span>
            <span>Organization Settings</span>
          </div>
        </div>
      </div>

      <!-- General Features -->
      <div class="space-y-2 pt-4 border-t">
        <h4 class="font-semibold text-gray-700">General Features:</h4>
        
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('general.emailVerification') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('general.emailVerification') ? '✓' : '✗' }}
            </span>
            <span>Email Verification</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('general.twoFactorAuth') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('general.twoFactorAuth') ? '✓' : '✗' }}
            </span>
            <span>Two-Factor Auth</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('general.subscriptionManagement') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('general.subscriptionManagement') ? '✓' : '✗' }}
            </span>
            <span>Subscriptions</span>
          </div>

          <div class="flex items-center space-x-2">
            <span :class="isFeatureEnabled('general.notifications') ? 'text-green-600' : 'text-red-600'">
              {{ isFeatureEnabled('general.notifications') ? '✓' : '✗' }}
            </span>
            <span>Notifications</span>
          </div>
        </div>
      </div>

      <!-- Example Action Buttons -->
      <div class="pt-4 border-t space-y-2">
        <h4 class="font-semibold text-gray-700">Example Actions:</h4>
        
        <button
          v-if="isFeatureEnabled('passwordResetTrigger')"
          @click="triggerPasswordReset"
          class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Send Password Reset (Feature Enabled)
        </button>

        <button
          v-if="isFeatureEnabled('auditLogs')"
          @click="viewAuditLogs"
          class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 ml-2"
        >
          View Audit Logs (Feature Enabled)
        </button>

        <p v-if="!isFeatureEnabled('passwordResetTrigger') && !isFeatureEnabled('auditLogs')" class="text-gray-500 italic">
          No features enabled for this demo
        </p>
      </div>

      <!-- Raw Features JSON (for debugging) -->
      <details class="pt-4 border-t">
        <summary class="cursor-pointer font-semibold text-gray-700">Show Raw Features JSON</summary>
        <pre class="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto">{{ JSON.stringify(getRawFeatures, null, 2) }}</pre>
      </details>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useFeatures } from '~/composables/useFeatures';

const { isFeatureEnabled, getRawFeatures, userRole, loading } = useFeatures();

const triggerPasswordReset = () => {
  alert('Password reset would be triggered here');
};

const viewAuditLogs = () => {
  alert('Audit logs would be displayed here');
};
</script>
