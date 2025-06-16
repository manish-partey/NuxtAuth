<template>
  <section class="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
      Create User
    </h1>

    <UserForm
      :availableRoles="availableRoles"
      :organizations="organizations"
      :platforms="platforms"
      @user-created="handleCreated"
    />

    <p
      v-if="message"
      :class="messageClass"
      role="alert"
      class="mt-6 max-w-md rounded-md px-4 py-3 font-medium border"
    >
      {{ message }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import UserForm from '~/components/Admin/UserForm.vue';

interface Organization {
  id: string;
  name: string;
}

interface Platform {
  id: string;
  name: string;
}

const message = ref('');
const isSuccess = ref(false);

const authStore = useAuthStore();

// Load roles dynamically from store or fallback
const availableRoles = ref<string[]>(authStore.roles.length > 0 ? authStore.roles : ['user', 'admin']);

const organizations = ref<Organization[]>([]);
const platforms = ref<Platform[]>([]);

const messageClass = computed(() =>
  isSuccess.value
    ? 'text-green-700 bg-green-100 border-green-300'
    : 'text-red-700 bg-red-100 border-red-300'
);

const handleCreated = (payload: { success: boolean; message: string }) => {
  message.value = payload.message;
  isSuccess.value = payload.success;
};

async function fetchOrganizations() {
  try {
    const data = await $fetch<Organization[]>('/api/organization/list.get');
    organizations.value = data || [];
  } catch (error) {
    console.error('Failed to fetch organizations:', error);
    organizations.value = [];
  }
}

async function fetchPlatforms() {
  try {
    const data = await $fetch<Platform[]>('/api/platform/listAdmins.get');
    platforms.value = data || [];
  } catch (error) {
    console.error('Failed to fetch platforms:', error);
    platforms.value = [];
  }
}

onMounted(() => {
  fetchOrganizations();
  fetchPlatforms();
});

// Protect this page: user must be logged in AND have allowed admin roles
definePageMeta({
  middleware: ['auth', 'role'],
  roles: ['super_admin', 'platform_admin']
});
</script>
