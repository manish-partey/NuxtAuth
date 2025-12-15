<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';

interface Activity {
  _id: string;
  action: string;
  targetType: string;
  userId: {
    name: string;
    email: string;
    role: string;
  };
  organizationId?: {
    name: string;
  };
  description?: string;
  ipAddress?: string;
  createdAt: string;
}

interface Props {
  limit?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showFilters?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  limit: 20,
  autoRefresh: false,
  refreshInterval: 30000, // 30 seconds
  showFilters: true
});

const activities = ref<Activity[]>([]);
const loading = ref(true);
const error = ref('');
const selectedFilter = ref('all');
let refreshTimer: NodeJS.Timeout | null = null;

// Deduplicate activities to prevent showing duplicates
const uniqueActivities = computed(() => {
  const seen = new Map<string, Activity>();
  
  for (const activity of activities.value) {
    // Create a unique key based on critical fields
    const key = `${activity.action}_${activity.userId?._id || activity.userId}_${activity.createdAt}_${activity.organizationId?._id || ''}`;
    
    // Only add if not seen before (keeps first occurrence)
    if (!seen.has(key)) {
      seen.set(key, activity);
    }
  }
  
  return Array.from(seen.values());
});

const actionFilters = [
  { value: 'all', label: 'All Activity' },
  { value: 'user_created', label: 'User Created' },
  { value: 'user_updated', label: 'User Updated' },
  { value: 'organization_updated', label: 'Organization Updated' },
  { value: 'role_changed', label: 'Role Changed' },
  { value: 'user_invited', label: 'User Invited' },
];

// Icon mapping for different actions
const getActionIcon = (action: string): string => {
  const iconMap: Record<string, string> = {
    user_created: '👤',
    user_updated: '✏️',
    user_removed: '🗑️',
    role_changed: '🔄',
    password_reset_sent: '🔑',
    user_suspended: '⏸️',
    user_activated: '✅',
    organization_updated: '🏢',
    settings_updated: '⚙️',
    user_invited: '📧',
    CREATE_ORG_TYPE: '➕',
    UPDATE_ORG_TYPE: '📝',
    DELETE_ORG_TYPE: '❌',
    APPROVE_ORG_TYPE: '✅',
    REJECT_ORG_TYPE: '⛔',
    PROMOTE_ORG_TYPE: '⬆️',
    CONFIG_UPDATE: '🔧',
    UPDATE_PLATFORM_ORG_TYPES: '🏗️',
  };
  return iconMap[action] || '📋';
};

// Color coding for different actions
const getActionColor = (action: string): string => {
  if (action.includes('created') || action.includes('APPROVE')) return 'text-green-600 bg-green-50';
  if (action.includes('removed') || action.includes('DELETE') || action.includes('REJECT')) return 'text-red-600 bg-red-50';
  if (action.includes('updated') || action.includes('UPDATE')) return 'text-blue-600 bg-blue-50';
  if (action.includes('invited') || action.includes('password')) return 'text-purple-600 bg-purple-50';
  if (action.includes('suspended')) return 'text-orange-600 bg-orange-50';
  return 'text-gray-600 bg-gray-50';
};

// Format activity message
const formatMessage = (activity: Activity): string => {
  const userName = activity.userId?.name || 'Unknown User';
  const orgName = activity.organizationId?.name ? ` in ${activity.organizationId.name}` : '';
  
  const messages: Record<string, string> = {
    user_created: `${userName} created a new user${orgName}`,
    user_updated: `${userName} updated user details${orgName}`,
    user_removed: `${userName} removed a user${orgName}`,
    role_changed: `${userName} changed user role${orgName}`,
    password_reset_sent: `Password reset email sent to user`,
    user_suspended: `${userName} suspended a user${orgName}`,
    user_activated: `${userName} activated a user${orgName}`,
    organization_updated: `${userName} updated organization settings`,
    settings_updated: `${userName} updated system settings`,
    user_invited: `${userName} invited a new user${orgName}`,
    CREATE_ORG_TYPE: `${userName} created new organization type`,
    UPDATE_ORG_TYPE: `${userName} updated organization type`,
    DELETE_ORG_TYPE: `${userName} deleted organization type`,
    APPROVE_ORG_TYPE: `${userName} approved organization type`,
    REJECT_ORG_TYPE: `${userName} rejected organization type`,
    PROMOTE_ORG_TYPE: `${userName} promoted organization type to global`,
    CONFIG_UPDATE: `${userName} updated system configuration`,
    UPDATE_PLATFORM_ORG_TYPES: `${userName} updated platform organization types`,
  };
  
  return messages[activity.action] || `${userName} performed ${activity.action}`;
};

// Format time ago
const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
};

const fetchActivities = async () => {
  try {
    loading.value = true;
    error.value = '';
    
    const queryParams = new URLSearchParams({
      limit: props.limit.toString(),
    });
    
    if (selectedFilter.value !== 'all') {
      queryParams.append('action', selectedFilter.value);
    }
    
    const response: any = await $fetch(`/api/activity/feed?${queryParams.toString()}`);
    
    if (response.success) {
      activities.value = response.activities;
    }
  } catch (err: any) {
    console.error('Failed to fetch activities:', err);
    error.value = 'Failed to load activity feed';
  } finally {
    loading.value = false;
  }
};

const setupAutoRefresh = () => {
  if (props.autoRefresh) {
    refreshTimer = setInterval(() => {
      fetchActivities();
    }, props.refreshInterval);
  }
};

onMounted(() => {
  fetchActivities();
  setupAutoRefresh();
});

onUnmounted(() => {
  if (refreshTimer) {
    clearInterval(refreshTimer);
  }
});
</script>

<template>
  <div class="activity-feed">
    <!-- Header -->
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <span class="text-2xl">🔔</span>
        Activity Feed
      </h3>
      
      <!-- Filter -->
      <select 
        v-if="showFilters"
        v-model="selectedFilter" 
        @change="fetchActivities"
        class="text-sm border border-gray-300 rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <option v-for="filter in actionFilters" :key="filter.value" :value="filter.value">
          {{ filter.label }}
        </option>
      </select>
    </div>

    <!-- Loading State -->
    <div v-if="loading && activities.length === 0" class="text-center py-8">
      <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p class="mt-2 text-sm text-gray-600">Loading activities...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="uniqueActivities.length === 0" class="text-center py-12 bg-gray-50 rounded-lg">
      <span class="text-5xl mb-3 block">📭</span>
      <p class="text-gray-600">No activity to display</p>
      <p class="text-sm text-gray-500 mt-1">Activity will appear here as actions are performed</p>
    </div>

    <!-- Activity List -->
    <div v-else class="space-y-3">
      <div
        v-for="activity in uniqueActivities"
        :key="activity._id"
        class="flex items-start gap-3 p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
      >
        <!-- Icon -->
        <div 
          class="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl"
          :class="getActionColor(activity.action)"
        >
          {{ getActionIcon(activity.action) }}
        </div>

        <!-- Content -->
        <div class="flex-1 min-w-0">
          <p class="text-sm text-gray-900 font-medium">
            {{ formatMessage(activity) }}
          </p>
          
          <!-- Metadata -->
          <div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span class="flex items-center gap-1">
              ⏰ {{ timeAgo(activity.createdAt) }}
            </span>
            <span v-if="activity.userId?.role" class="flex items-center gap-1">
              👤 {{ activity.userId.role.replace('_', ' ') }}
            </span>
            <span v-if="activity.ipAddress" class="flex items-center gap-1">
              🌐 {{ activity.ipAddress }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Auto-refresh indicator -->
    <div v-if="autoRefresh" class="mt-4 text-center">
      <p class="text-xs text-gray-500 flex items-center justify-center gap-1">
        <span class="inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
        Auto-refreshing every {{ Math.floor(refreshInterval / 1000) }} seconds
      </p>
    </div>
  </div>
</template>

<style scoped>
.activity-feed {
  max-width: 100%;
}
</style>
