<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

interface Organization {
  name: string;
  description?: string;
  platformId?: {
    _id: string;
    name: string;
  };
  type?: {
    name: string;
  };
  typeString?: string;
}

const router = useRouter();
const route = useRoute();
const id = route.params.id as string;

const name = ref('');
const description = ref('');
const platform = ref('');
const type = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const org = await $fetch<Organization>(`/api/organization/${id}`);
    name.value = org.name;
    description.value = org.description || '';
    platform.value = org.platformId?.name || 'N/A';
    type.value = org.type?.name || org.typeString || 'N/A';
  } catch (err) {
    error.value = 'Failed to load organization.';
  } finally {
    loading.value = false;
  }
});

async function updateOrganization() {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await $fetch(`/api/organization/${id}`, {
      method: 'PUT',
      body: {
        name: name.value,
        description: description.value,
      },
      credentials: 'include',
    });
    success.value = 'Organization updated successfully!';
  } catch (err) {
    error.value = 'Failed to update organization.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Edit Organization</h1>

    <!-- Success Message -->
    <div v-if="success" class="mb-4 p-3 bg-green-100 text-green-700 rounded">
      {{ success }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="mb-4 p-3 bg-red-100 text-red-700 rounded">
      {{ error }}
    </div>

    <form @submit.prevent="updateOrganization" class="space-y-4">
      <div>
        <label class="block font-semibold mb-1">Platform</label>
        <input
          v-model="platform"
          type="text"
          class="w-full border px-3 py-2 rounded bg-gray-100"
          disabled
          readonly
        />
      </div>

      <div>
        <label class="block font-semibold mb-1">Organization Type</label>
        <input
          v-model="type"
          type="text"
          class="w-full border px-3 py-2 rounded bg-gray-100"
          disabled
          readonly
        />
      </div>

      <div>
        <label class="block font-semibold mb-1">Organization Name</label>
        <input
          v-model="name"
          type="text"
          class="w-full border px-3 py-2 rounded"
          disabled
          readonly
        />
      </div>

      <div>
        <label class="block font-semibold mb-1">Description</label>
        <textarea
          v-model="description"
          class="w-full border px-3 py-2 rounded"
          rows="3"
        ></textarea>
      </div>

      <button
        type="submit"
        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        :disabled="loading"
      >
        Update Organization
      </button>
    </form>
  </div>
</template>