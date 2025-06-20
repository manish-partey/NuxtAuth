<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

interface Platform {
  _id: string;
  name: string;
}

const router = useRouter();
const name = ref('');
const platformId = ref('');
const type = ref('');
const error = ref('');
const loading = ref(false);

const platforms = ref<Platform[]>([]);
const organizationTypes = ['grocery_store', 'college_department', 'clinic', 'other'];

async function fetchPlatforms() {
  try {
    platforms.value = await $fetch('/api/platform/list', {
      credentials: 'include' // ✅ Ensures cookies are sent
    });
  } catch {
    platforms.value = [];
  }
}

onMounted(fetchPlatforms);

async function createOrganization() {
  error.value = '';
  if (!name.value.trim() || !platformId.value || !type.value) {
    error.value = 'Please fill all required fields.';
    return;
  }

  loading.value = true;
  try {
    await $fetch('/api/org/create.post', {
      method: 'POST',
      credentials: 'include', // ✅ Ensures cookies are sent
      body: {
        name: name.value.trim(),
        platformId: platformId.value,
        type: type.value,
      },
    });
    router.push('/superadmin/organizations');
  } catch {
    error.value = 'Failed to create organization.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-lg mx-auto">
    <h1 class="text-2xl font-bold mb-6">Create New Organization</h1>

    <form @submit.prevent="createOrganization" class="space-y-4">
      <div>
        <label for="name" class="block font-semibold mb-1">Organization Name</label>
        <input
          id="name"
          type="text"
          v-model="name"
          placeholder="e.g., Downtown Grocery Store"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label for="platform" class="block font-semibold mb-1">Parent Platform</label>
        <select
          id="platform"
          v-model="platformId"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="" disabled>Select Platform</option>
          <option v-for="p in platforms" :key="p._id" :value="p._id">{{ p.name }}</option>
        </select>
      </div>

      <div>
        <label for="type" class="block font-semibold mb-1">Organization Type</label>
        <select
          id="type"
          v-model="type"
          class="w-full border border-gray-300 rounded px-3 py-2"
          required
        >
          <option value="" disabled>Select Type</option>
          <option v-for="ot in organizationTypes" :key="ot" :value="ot">{{ ot.replace(/_/g, ' ') }}</option>
        </select>
      </div>

      <div v-if="error" class="text-red-600">{{ error }}</div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        :disabled="loading"
      >
        Create Organization
      </button>
    </form>
  </div>
</template>
