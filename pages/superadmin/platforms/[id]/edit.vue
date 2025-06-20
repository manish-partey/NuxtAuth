<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const route = useRoute();
const router = useRouter();
const id = route.params.id as string;

const name = ref('');
const description = ref('');
const error = ref('');
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  try {
    const platform = await $fetch(`/api/platform/${id}`);
    name.value = platform.name;
    description.value = platform.description || '';
  } catch (err) {
    error.value = 'Failed to load platform.';
  } finally {
    loading.value = false;
  }
});

async function updatePlatform() {
  loading.value = true;
  error.value = '';
  try {
    await $fetch(`/api/platform/${id}`, {
      method: 'PUT',
      body: {
        name: name.value,
        description: description.value,
      },
      credentials: 'include',
    });
    router.push('/superadmin/platforms');
  } catch (err) {
    error.value = 'Failed to update platform.';
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="p-6 max-w-xl mx-auto">
    <h1 class="text-2xl font-bold mb-4">Edit Platform</h1>

    <form @submit.prevent="updatePlatform" class="space-y-4">
      <div>
        <label class="block font-semibold mb-1">Platform Name</label>
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
        Update Platform
      </button>
    </form>
  </div>
</template>
