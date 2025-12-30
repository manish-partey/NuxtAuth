<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';

definePageMeta({
  name: 'superadmin-platforms-id-organization-types',
  middleware: ['auth-guard'],
  roles: ['super_admin']
});

interface OrgType {
  _id: string;
  code: string;
  name: string;
  category: string;
  icon: string;
  description: string;
}

interface PlatformInfo {
  _id: string;
  name: string;
  category: string;
  allowedOrganizationTypes: any[];
}

const route = useRoute();
const router = useRouter();
// Get platform ID from route params
const platformId = route.params.id as string;

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const platformInfo = ref<PlatformInfo | null>(null);
const platformCategory = ref('other');
const useAutoFilter = ref(true);
const selectedTypeIds = ref<string[]>([]);
const allGlobalTypes = ref<OrgType[]>([]);
const platformTypes = ref<OrgType[]>([]);
const searchQuery = ref('');
const showPlatformTypeHelp = ref(false);

const categoryColors: Record<string, string> = {
  healthcare: 'bg-blue-100 text-blue-800 border-blue-200',
  hospitality: 'bg-purple-100 text-purple-800 border-purple-200',
  education: 'bg-green-100 text-green-800 border-green-200',
  logistics: 'bg-orange-100 text-orange-800 border-orange-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

const groupedTypes = computed(() => {
  const groups: Record<string, OrgType[]> = {};
  allGlobalTypes.value.forEach(type => {
    if (!groups[type.category]) {
      groups[type.category] = [];
    }
    groups[type.category].push(type);
  });
  return groups;
});

const filteredGroupedTypes = computed(() => {
  if (!searchQuery.value) return groupedTypes.value;
  
  const query = searchQuery.value.toLowerCase();
  const filtered: Record<string, OrgType[]> = {};
  
  Object.entries(groupedTypes.value).forEach(([category, types]) => {
    const matchingTypes = types.filter(t => 
      t.name.toLowerCase().includes(query) || 
      t.description.toLowerCase().includes(query) ||
      t.code.toLowerCase().includes(query)
    );
    if (matchingTypes.length > 0) {
      filtered[category] = matchingTypes;
    }
  });
  
  return filtered;
});

const previewTypes = computed(() => {
  if (useAutoFilter.value) {
    // Show category-matched types
    if (platformCategory.value !== 'other') {
      return groupedTypes.value[platformCategory.value] || [];
    } else {
      // 'other' category shows all global types
      return allGlobalTypes.value;
    }
  } else {
    // Show manually selected types
    return allGlobalTypes.value.filter(t => selectedTypeIds.value.includes(t._id));
  }
});

const isTypeSelected = (typeId: string) => {
  return selectedTypeIds.value.includes(typeId);
};

const toggleType = (typeId: string) => {
  const index = selectedTypeIds.value.indexOf(typeId);
  if (index > -1) {
    selectedTypeIds.value.splice(index, 1);
  } else {
    selectedTypeIds.value.push(typeId);
  }
};

const selectAllInCategory = (category: string) => {
  const typesInCategory = groupedTypes.value[category] || [];
  typesInCategory.forEach(type => {
    if (!selectedTypeIds.value.includes(type._id)) {
      selectedTypeIds.value.push(type._id);
    }
  });
};

const deselectAllInCategory = (category: string) => {
  const typesInCategory = groupedTypes.value[category] || [];
  const idsToRemove = typesInCategory.map(t => t._id);
  selectedTypeIds.value = selectedTypeIds.value.filter(id => !idsToRemove.includes(id));
};

async function loadSettings() {
  loading.value = true;
  error.value = '';
  try {
    const apiUrl = `/api/superadmin/platforms/${platformId}/organization-types`;
    console.log('[Organization Types] Loading from:', apiUrl);
    
    const response: any = await $fetch(apiUrl, {
      credentials: 'include'
    });

    console.log('[Organization Types] Response received:', response);

    if (response.success) {
      platformInfo.value = response.data.platform;
      platformCategory.value = response.data.platform.category;
      useAutoFilter.value = response.data.isUsingAutoFilter;
      allGlobalTypes.value = response.data.allGlobalTypes;
      platformTypes.value = response.data.platformTypes;
      
      console.log('[Organization Types] Settings loaded successfully');
      
      if (!useAutoFilter.value) {
        selectedTypeIds.value = response.data.platform.allowedOrganizationTypes.map((t: any) => t._id);
      }
    }
  } catch (e: any) {
    console.error('[Organization Types] Error details:', {
      status: e.status,
      statusCode: e.statusCode,
      statusMessage: e.statusMessage,
      data: e.data,
      message: e.message
    });
    error.value = e.data?.message || e.statusMessage || e.message || 'Failed to fetch organization types settings';
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  console.log('[Organization Types] ====== SAVE BUTTON CLICKED ======');
  
  // Validation: Prevent saving with empty selection in manual mode
  if (!useAutoFilter.value && selectedTypeIds.value.length === 0) {
    error.value = 'Please select at least one organization type, or switch to Automatic mode';
    return;
  }
  
  saving.value = true;
  error.value = '';
  success.value = '';
  
  try {
    console.log('[Organization Types] Saving settings:', {
      useAutoFilter: useAutoFilter.value,
      organizationTypeIds: useAutoFilter.value ? [] : selectedTypeIds.value
    });
    
    const response: any = await $fetch(`/api/superadmin/platforms/${platformId}/organization-types`, {
      method: 'POST',
      credentials: 'include',
      body: {
        useAutoFilter: useAutoFilter.value,
        organizationTypeIds: useAutoFilter.value ? [] : selectedTypeIds.value
      }
    });
    
    console.log('[Organization Types] Save response:', response);
    
    if (response.success) {
      success.value = response.message;
      console.log('[Organization Types] Settings saved successfully, redirecting in 2s...');
      // Redirect to platform details page after showing success message
      setTimeout(() => {
        router.push(`/superadmin/platforms/${platformId}`);
      }, 2000);
    } else {
      error.value = 'Failed to save settings: No success flag in response';
    }
  } catch (e: any) {
    console.error('[Organization Types] Save error:', e);
    error.value = e.data?.message || e.statusMessage || e.message || 'Failed to save settings.';
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  console.log('[Organization Types] Page mounted, platformId:', platformId);
  loadSettings();
});
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <!-- Breadcrumb -->
    <nav class="mb-6 flex items-center text-sm text-gray-600">
      <NuxtLink to="/superadmin" class="hover:text-blue-600">Super Admin</NuxtLink>
      <span class="mx-2">›</span>
      <NuxtLink to="/superadmin/platforms" class="hover:text-blue-600">Platforms</NuxtLink>
      <span class="mx-2">›</span>
      <NuxtLink :to="`/superadmin/platforms/${platformId}`" class="hover:text-blue-600">
        {{ platformInfo?.name || 'Platform Details' }}
      </NuxtLink>
      <span class="mx-2">›</span>
      <span class="text-gray-900 font-medium">Organization Types</span>
    </nav>

    <!-- DEBUG: Always visible banner -->
    <div class="mb-6 p-4 bg-red-50 border-2 border-red-500 rounded text-red-900">
      🔴 DEBUG: Organization Types Page Loaded - Platform ID: {{ platformId }}
    </div>

    <h1 class="text-2xl font-bold mb-2 text-red-600">Organization Types Settings</h1>
    <p class="text-gray-600 mb-6">
      Configure which organization types are available for <span class="font-semibold">{{ platformInfo?.name }}</span>
    </p>

    <div v-if="loading" class="text-gray-500">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      Loading settings for platform {{ platformId }}...
    </div>

    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
      ✅ {{ success }}
    </div>
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
      ❌ {{ error }}
    </div>

    <div v-if="!loading" class="space-y-6">
      <!-- Helper: Create New Organization Types -->
      <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div class="flex items-start justify-between gap-4">
          <div class="flex items-start gap-3">
            <span class="text-2xl">💡</span>
            <div>
              <h3 class="font-semibold text-amber-900">Need to create a new organization type?</h3>
              <p class="text-sm text-amber-700 mt-1">
                If the organization type you need doesn't exist yet (like Airline, Airport, etc.), 
                create it first in the Organization Types Manager, then return here to enable it for this platform.
              </p>
            </div>
          </div>
          <NuxtLink to="/superadmin/organization-types" 
            class="flex-shrink-0 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-medium whitespace-nowrap transition">
            Manage Org Types →
          </NuxtLink>
        </div>
      </div>

      <!-- Current Platform Category -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-3">Current Platform Category</h3>
        <div class="flex items-center gap-3">
          <span :class="['px-4 py-2 rounded-lg border font-medium', categoryColors[platformCategory]]">
            {{ platformCategory.charAt(0).toUpperCase() + platformCategory.slice(1) }}
          </span>
          <span class="text-sm text-gray-500">
            (Change this in <NuxtLink :to="`/superadmin/platforms/${platformId}/edit`" class="text-blue-600 hover:underline">Platform Settings</NuxtLink>)
          </span>
        </div>
      </div>

      <!-- Filter Mode Selection -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-4">Filtering Mode</h3>
        
        <div class="space-y-3">
          <label class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
            :class="useAutoFilter ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
            <input type="radio" :value="true" v-model="useAutoFilter" class="mt-1" />
            <div class="flex-1">
              <div class="font-medium text-gray-900">🤖 Automatic (Category-Based)</div>
              <div class="text-sm text-gray-600 mt-1">
                Automatically include all organization types that match your platform's category
              </div>
              <div v-if="platformCategory !== 'other'" class="text-xs text-blue-600 mt-2">
                Will show: {{ groupedTypes[platformCategory]?.map(t => t.name).join(', ') || 'None' }}
              </div>
              <div v-else class="text-xs text-amber-600 mt-2">
                Category is "other" - will show all global organization types
              </div>
              <div v-if="platformCategory === 'healthcare'" class="text-xs bg-blue-100 text-blue-700 p-2 rounded mt-2">
                💡 Example: Healthcare platforms automatically get Hospital, Clinic, Pharmacy, Laboratory, Diagnostic Center
              </div>
            </div>
          </label>

          <label class="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50"
            :class="!useAutoFilter ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
            <input type="radio" :value="false" v-model="useAutoFilter" class="mt-1" />
            <div>
              <div class="font-medium text-gray-900">⚙️ Manual Selection</div>
              <div class="text-sm text-gray-600 mt-1">
                Manually choose specific organization types (ignores category)
              </div>
            </div>
          </label>
        </div>
      </div>

      <!-- Live Preview Section -->
      <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 class="font-semibold text-gray-900 mb-2">📋 Preview: Available Organization Types</h3>
        <p class="text-sm text-gray-600 mb-3">
          Organizations registering on this platform will see <span class="font-semibold">{{ previewTypes.length }}</span> type(s):
        </p>
        <div v-if="previewTypes.length > 0" class="flex flex-wrap gap-2">
          <span v-for="type in previewTypes" :key="type._id"
            class="px-3 py-1 bg-white border border-blue-300 rounded-lg text-sm flex items-center gap-1">
            {{ type.icon }} {{ type.name }}
          </span>
        </div>
        <div v-else class="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded p-2">
          ⚠️ No organization types will be available. Please select at least one type or switch to Automatic mode.
        </div>
      </div>

      <!-- Manual Type Selection -->
      <div v-if="!useAutoFilter" class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-4">
          Select Organization Types
          <span class="text-sm font-normal text-gray-500">({{ selectedTypeIds.length }} selected)</span>
        </h3>

        <!-- Search Box -->
        <div class="mb-4">
          <input v-model="searchQuery" type="text" 
            placeholder="🔍 Search organization types by name, code, or description..."
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>

        <div class="space-y-6">
          <div v-for="(types, category) in filteredGroupedTypes" :key="category" class="border border-gray-200 rounded-lg p-4">
            <div class="flex items-center justify-between mb-3">
              <h4 :class="['text-md font-semibold px-3 py-1 rounded border inline-block', categoryColors[category]]">
                {{ category.charAt(0).toUpperCase() + category.slice(1) }}
              </h4>
              <div class="flex gap-2">
                <button @click="selectAllInCategory(category)" type="button"
                  class="text-sm text-blue-600 hover:underline">
                  Select All
                </button>
                <span class="text-gray-400">|</span>
                <button @click="deselectAllInCategory(category)" type="button"
                  class="text-sm text-blue-600 hover:underline">
                  Deselect All
                </button>
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <label v-for="type in types" :key="type._id"
                class="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                :class="isTypeSelected(type._id) ? 'border-blue-500 bg-blue-50' : 'border-gray-200'">
                <input type="checkbox" 
                  :checked="isTypeSelected(type._id)"
                  @change="toggleType(type._id)"
                  class="mt-1" />
                <div class="flex-1">
                  <div class="font-medium text-gray-900">
                    {{ type.icon }} {{ type.name }}
                  </div>
                  <div class="text-sm text-gray-600">{{ type.description }}</div>
                </div>
              </label>
            </div>
          </div>
        </div>
      </div>

      <!-- Platform-Specific Types -->
      <div v-if="platformTypes.length > 0" class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-3 flex items-center gap-2">
          Platform-Specific Types
          <button type="button" @click="showPlatformTypeHelp = !showPlatformTypeHelp"
            class="text-blue-600 hover:text-blue-700 transition">
            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </button>
        </h3>
        <div v-if="showPlatformTypeHelp" class="text-sm bg-blue-50 border border-blue-200 p-3 rounded mb-4">
          💡 These are custom organization types created specifically for THIS platform only. 
          They won't appear in other platforms. Use when you need industry-specific types 
          not covered by global categories.
        </div>
        <p class="text-sm text-gray-600 mb-4">These custom types are always available for this platform</p>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div v-for="type in platformTypes" :key="type._id"
            class="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg">
            <span class="text-xl">{{ type.icon }}</span>
            <div>
              <div class="font-medium text-gray-900">{{ type.name }}</div>
              <div class="text-sm text-gray-600">{{ type.description }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Save Button -->
      <div class="flex justify-end gap-3">
        <button @click="router.back()" type="button"
          class="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button @click="saveSettings" :disabled="saving" type="button"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          <span v-if="saving" class="flex items-center gap-2">
            <svg class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Saving...
          </span>
          <span v-else>Save Settings</span>
        </button>
      </div>
    </div>
  </div>
</template>
