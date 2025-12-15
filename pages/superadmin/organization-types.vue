<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';

definePageMeta({
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
  isGlobal: boolean;
}

const loading = ref(false);
const saving = ref(false);
const error = ref('');
const success = ref('');

const showAddModal = ref(false);
const editingType = ref<OrgType | null>(null);

const newType = ref({
  code: '',
  name: '',
  category: 'other',
  icon: '🏢',
  description: '',
  isGlobal: true
});

const orgTypes = ref<OrgType[]>([]);

const categoryColors: Record<string, string> = {
  healthcare: 'bg-blue-100 text-blue-800 border-blue-200',
  hospitality: 'bg-purple-100 text-purple-800 border-purple-200',
  education: 'bg-green-100 text-green-800 border-green-200',
  logistics: 'bg-orange-100 text-orange-800 border-orange-200',
  other: 'bg-gray-100 text-gray-800 border-gray-200'
};

const groupedTypes = computed(() => {
  const groups: Record<string, OrgType[]> = {};
  orgTypes.value.forEach(type => {
    if (!groups[type.category]) {
      groups[type.category] = [];
    }
    groups[type.category].push(type);
  });
  return groups;
});

async function loadOrgTypes() {
  loading.value = true;
  error.value = '';
  try {
    const response: any = await $fetch('/api/superadmin/organization-types', {
      credentials: 'include'
    });

    if (response.success) {
      orgTypes.value = response.types;
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to fetch organization types';
  } finally {
    loading.value = false;
  }
}

function openAddModal() {
  editingType.value = null;
  newType.value = {
    code: '',
    name: '',
    category: 'other',
    icon: '🏢',
    description: '',
    isGlobal: true
  };
  showAddModal.value = true;
}

function openEditModal(type: OrgType) {
  editingType.value = type;
  newType.value = {
    code: type.code,
    name: type.name,
    category: type.category,
    icon: type.icon,
    description: type.description,
    isGlobal: type.isGlobal
  };
  showAddModal.value = true;
}

function closeModal() {
  showAddModal.value = false;
  editingType.value = null;
}

async function saveOrgType() {
  saving.value = true;
  error.value = '';
  success.value = '';
  
  try {
    const endpoint = editingType.value 
      ? `/api/superadmin/organization-types/${editingType.value._id}`
      : '/api/superadmin/organization-types';
    
    const response: any = await $fetch(endpoint, {
      method: editingType.value ? 'PUT' : 'POST',
      credentials: 'include',
      body: newType.value
    });
    
    if (response.success) {
      success.value = editingType.value ? 'Organization type updated' : 'Organization type created';
      closeModal();
      await loadOrgTypes();
      setTimeout(() => success.value = '', 3000);
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to save organization type';
  } finally {
    saving.value = false;
  }
}

async function deleteOrgType(typeId: string) {
  if (!confirm('Are you sure you want to delete this organization type?')) return;
  
  try {
    const response: any = await $fetch(`/api/superadmin/organization-types/${typeId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    
    if (response.success) {
      success.value = 'Organization type deleted';
      await loadOrgTypes();
      setTimeout(() => success.value = '', 3000);
    }
  } catch (e: any) {
    error.value = e.data?.message || 'Failed to delete organization type';
  }
}

onMounted(loadOrgTypes);
</script>

<template>
  <div class="p-6 max-w-6xl mx-auto">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-2xl font-bold">Global Organization Types</h1>
        <p class="text-gray-600">Manage organization types available across all platforms</p>
      </div>
      <button @click="openAddModal" 
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
        + Add Organization Type
      </button>
    </div>

    <div v-if="loading" class="text-gray-500">Loading organization types...</div>

    <div v-if="success" class="mb-6 p-4 bg-green-50 border border-green-200 rounded text-green-700">
      ✅ {{ success }}
    </div>
    <div v-if="error" class="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-700">
      ❌ {{ error }}
    </div>

    <div v-if="!loading" class="space-y-6">
      <div v-for="(types, category) in groupedTypes" :key="category" class="bg-white rounded-lg border border-gray-200 p-6">
        <h3 :class="['text-lg font-semibold mb-4 px-3 py-1 rounded border inline-block', categoryColors[category]]">
          {{ category.charAt(0).toUpperCase() + category.slice(1) }}
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div v-for="type in types" :key="type._id"
            class="flex items-start justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
            <div class="flex items-start gap-3 flex-1">
              <span class="text-2xl">{{ type.icon }}</span>
              <div class="flex-1">
                <div class="font-medium text-gray-900">{{ type.name }}</div>
                <div class="text-sm text-gray-600">{{ type.description }}</div>
                <div class="text-xs text-gray-500 mt-1">Code: {{ type.code }}</div>
                <span v-if="type.isGlobal" class="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-800 text-xs rounded">
                  Global
                </span>
              </div>
            </div>
            <div class="flex gap-2">
              <button @click="openEditModal(type)"
                class="text-blue-600 hover:text-blue-800 text-sm">
                Edit
              </button>
              <button @click="deleteOrgType(type._id)"
                class="text-red-600 hover:text-red-800 text-sm">
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal" 
      class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      @click="closeModal">
      <div class="relative top-20 mx-auto p-5 border max-w-lg shadow-lg rounded-md bg-white" @click.stop>
        <h3 class="text-lg font-medium text-gray-900 mb-4">
          {{ editingType ? 'Edit Organization Type' : 'Add Organization Type' }}
        </h3>
        
        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Code</label>
            <input v-model="newType.code" type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2" 
              placeholder="e.g., hospital" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input v-model="newType.name" type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2" 
              placeholder="e.g., Hospital" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select v-model="newType.category" 
              class="w-full border border-gray-300 rounded px-3 py-2">
              <option value="healthcare">Healthcare</option>
              <option value="hospitality">Hospitality</option>
              <option value="education">Education</option>
              <option value="logistics">Logistics</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Icon (Emoji)</label>
            <input v-model="newType.icon" type="text" 
              class="w-full border border-gray-300 rounded px-3 py-2" 
              placeholder="🏥" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea v-model="newType.description" 
              class="w-full border border-gray-300 rounded px-3 py-2" 
              rows="3"
              placeholder="Brief description..."></textarea>
          </div>

          <div class="flex items-center gap-2">
            <input v-model="newType.isGlobal" type="checkbox" id="isGlobal" />
            <label for="isGlobal" class="text-sm text-gray-700">Global (available to all platforms)</label>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-6">
          <button @click="closeModal" type="button"
            class="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
            Cancel
          </button>
          <button @click="saveOrgType" :disabled="saving"
            class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50">
            {{ saving ? 'Saving...' : (editingType ? 'Update' : 'Create') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
