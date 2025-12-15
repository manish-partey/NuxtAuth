<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const name = ref('');
const description = ref('');
const platform = ref('');
const type = ref('');
const error = ref('');
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const org = await $fetch(`/api/organization/${id}`);
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
  try {
    await $fetch(`/api/organization/${id}`, {
      method: 'PUT',
      body: {
        name: name.value,
        description: description.value,
      },
      credentials: 'include',
    });
    router.push('/superadmin/organizations');
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
          required
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

      <div v-if="error" class="text-red-600">{{ error }}</div>

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