<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';

const emit = defineEmits<{
  (e: 'update:role', value: string): void
}>();

// Access logged in user role from auth store
const auth = useAuthStore();
const currentRole = computed(() => auth.userRole);

// Define allowed roles for each inviter role (same as backend)
const allowedRolesMap: Record<string, string[]> = {
  'super_admin': ['super_admin', 'platform-admin', 'organization-admin', 'admin', 'user'],
  'platform-admin': ['organization-admin', 'admin', 'user'],
  'organization-admin': ['admin', 'user'],
};

// Compute allowed roles for dropdown based on current user role
const allowedRoles = computed(() => {
  if (!currentRole.value) return [];
  return allowedRolesMap[currentRole.value] || [];
});

// Selected role in dropdown
const selectedRole = ref('');

// Emit selected role when changed
function onChange() {
  emit('update:role', selectedRole.value);
}
</script>

<template>
  <label for="role-select" class="block mb-1 font-semibold">Select Role</label>
  <select
    id="role-select"
    v-model="selectedRole"
    @change="onChange"
    class="border rounded px-3 py-2 w-full"
  >
    <option disabled value="">-- Select a Role --</option>
    <option v-for="role in allowedRoles" :key="role" :value="role">
      {{ role.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) }}
    </option>
  </select>
</template>
