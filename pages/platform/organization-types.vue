<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

interface OrgType {
  _id: string;
  code: string;
  name: string;
  category: string;
  icon: string;
  description: string;
}

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const platformCategory = ref('other');
const useAutoFilter = ref(true);
const selectedTypeIds = ref<string[]>([]);
const allGlobalTypes = ref<OrgType[]>([]);
const platformTypes = ref<OrgType[]>([]);

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
    console.log('[Organization Types] Fetching settings...');
    const response: any = await $fetch('/api/platform/settings/organization-types', {
      credentials: 'include'
    });

    console.log('[Organization Types] Response:', response);

    if (response.success) {
      platformCategory.value = response.data.platform.category;
      useAutoFilter.value = response.data.isUsingAutoFilter;
      allGlobalTypes.value = response.data.allGlobalTypes;
      platformTypes.value = response.data.platformTypes;
      
      if (!useAutoFilter.value) {
        selectedTypeIds.value = response.data.platform.allowedOrganizationTypes.map((t: any) => t._id);
      }
      console.log('[Organization Types] Settings loaded successfully');
    }
  } catch (e: any) {
    console.error('[Organization Types] Error:', e);
    error.value = e.data?.message || e.statusMessage || e.message || 'Failed to fetch organization types settings';
  } finally {
    loading.value = false;
  }
}

async function saveSettings() {
  console.log('[Platform Org Types] ====== SAVE BUTTON CLICKED ======');
  saving.value = true;
  error.value = '';
  success.value = '';
  
  try {
    console.log('[Platform Org Types] Saving settings:', {
      useAutoFilter: useAutoFilter.value,
      organizationTypeIds: useAutoFilter.value ? [] : selectedTypeIds.value
    });
    
    const response: any = await $fetch('/api/platform/settings/organization-types', {
      method: 'POST',
      credentials: 'include',
      body: {
        useAutoFilter: useAutoFilter.value,
        organizationTypeIds: useAutoFilter.value ? [] : selectedTypeIds.value
      }
    });
    
    console.log('[Platform Org Types] Save response:', response);
    
    if (response.success) {
      success.value = response.message;
      console.log('[Platform Org Types] Settings saved successfully, redirecting in 2s...');
      // Redirect to platform dashboard after showing success message
      setTimeout(() => {
        navigateTo('/platform');
      }, 2000);
    } else {
      error.value = 'Failed to save settings: No success flag in response';
    }
  } catch (e: any) {
    console.error('[Platform Org Types] Save error:', e);
    error.value = e.data?.message || e.statusMessage || e.message || 'Failed to save settings.';
  } finally {
    saving.value = false;
  }
}

onMounted(loadSettings);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <h1 class="text-2xl font-bold mb-2">Organization Types Settings</h1>
    <p class="text-gray-600 mb-6">Configure which organization types are available for registration on your platform</p>

    <div v-if="loading" class="text-gray-500">Loading settings...</div>

    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
      ✅ {{ success }}
    </div>
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
      ❌ {{ error }}
    </div>

    <div v-if="!loading" class="space-y-6">
      <!-- Current Platform Category -->
      <div class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-3">Current Platform Category</h3>
        <div class="flex items-center gap-3">
          <span :class="['px-4 py-2 rounded-lg border font-medium', categoryColors[platformCategory]]">
            {{ platformCategory.charAt(0).toUpperCase() + platformCategory.slice(1) }}
          </span>
          <span class="text-sm text-gray-500">
            (Change this in <NuxtLink to="/platform/settings" class="text-blue-600 hover:underline">Platform Settings</NuxtLink>)
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
            <div>
              <div class="font-medium text-gray-900">🤖 Automatic (Recommended)</div>
              <div class="text-sm text-gray-600 mt-1">
                Automatically show organization types matching your platform category ({{ platformCategory }})
              </div>
              <div v-if="platformCategory !== 'other'" class="text-xs text-blue-600 mt-2">
                Will show: {{ groupedTypes[platformCategory]?.map(t => t.name).join(', ') || 'None' }}
              </div>
              <div v-else class="text-xs text-amber-600 mt-2">
                Category is "other" - will show all global organization types
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

      <!-- Manual Type Selection -->
      <div v-if="!useAutoFilter" class="bg-white p-6 rounded-lg border border-gray-200">
        <h3 class="text-lg font-semibold mb-4">
          Select Organization Types
          <span class="text-sm font-normal text-gray-500">({{ selectedTypeIds.length }} selected)</span>
        </h3>

        <div class="space-y-6">
          <div v-for="(types, category) in groupedTypes" :key="category" class="border border-gray-200 rounded-lg p-4">
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
        <h3 class="text-lg font-semibold mb-3">Platform-Specific Types</h3>
        <p class="text-sm text-gray-600 mb-4">These custom types are always available for your platform</p>
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
        <button @click="loadSettings" type="button"
          class="px-6 py-2 border border-gray-300 rounded hover:bg-gray-50">
          Cancel
        </button>
        <button @click="saveSettings" :disabled="saving"
          class="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ saving ? 'Saving...' : 'Save Settings' }}
        </button>
      </div>
    </div>
  </div>
</template>
