<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <div>
      <label for="name" class="block font-medium text-gray-700">Name</label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        required
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      />
    </div>

    <div>
      <label for="email" class="block font-medium text-gray-700">Email</label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        required
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      />
    </div>

    <div>
      <label for="role" class="block font-medium text-gray-700">Role</label>
      <select
        id="role"
        v-model="form.role"
        required
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      >
        <option disabled value="">Select Role</option>
        <option v-for="role in availableRoles" :key="role" :value="role">
          {{ role }}
        </option>
      </select>
    </div>

    <!-- Only show org/platform selectors to super_admins -->
    <div v-if="isSuperAdmin">
      <label for="organization" class="block font-medium text-gray-700">
        Organization
      </label>
      <select
        id="organization"
        v-model="form.organizationId"
        :disabled="organizations.length === 0"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      >
        <option value="">-- Select Organization --</option>
        <option
          v-for="org in organizations"
          :key="org.id"
          :value="org.id"
        >
          {{ org.name }}
        </option>
      </select>
    </div>

    <div v-if="isSuperAdmin">
      <label for="platform" class="block font-medium text-gray-700">Platform</label>
      <select
        id="platform"
        v-model="form.platformId"
        :disabled="platforms.length === 0"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      >
        <option value="">-- Select Platform --</option>
        <option
          v-for="platform in platforms"
          :key="platform.id"
          :value="platform.id"
        >
          {{ platform.name }}
        </option>
      </select>
    </div>

    <div>
      <label for="password" class="block font-medium text-gray-700">Password</label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        required
        minlength="6"
        class="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
      />
    </div>

    <button
      type="submit"
      :disabled="loading"
      class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
    >
      {{ loading ? 'Creating...' : 'Create User' }}
    </button>
  </form>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

interface Organization {
  id: string;
  name: string;
}

interface Platform {
  id: string;
  name: string;
}

const props = defineProps<{
  availableRoles: string[];
  organizations: Organization[];
  platforms: Platform[];
}>();

const emit = defineEmits<{
  (e: 'user-created', payload: { success: boolean; message: string }): void;
}>();

const form = ref({
  name: '',
  email: '',
  role: '',
  organizationId: '',
  platformId: '',
  password: '',
});

const loading = ref(false);

const auth = useAuthStore();
const isSuperAdmin = computed(() => auth.user?.role === 'super_admin');

const resetForm = () => {
  form.value = {
    name: '',
    email: '',
    role: '',
    organizationId: '',
    platformId: '',
    password: '',
  };
};

const submitForm = async () => {
  loading.value = true;
  try {
    const payload: any = {
      name: form.value.name,
      email: form.value.email,
      role: form.value.role,
      password: form.value.password,
    };

    if (isSuperAdmin.value) {
      payload.organizationId = form.value.organizationId || null;
      payload.platformId = form.value.platformId || null;
    }

    const response = await $fetch('/api/user/create', {
      method: 'POST',
      body: payload,
    });

    emit('user-created', { success: true, message: 'User created successfully.' });
    resetForm();
  } catch (error: any) {
    const msg = error?.data?.message || 'Failed to create user.';
    emit('user-created', { success: false, message: msg });
  } finally {
    loading.value = false;
  }
};
</script>
