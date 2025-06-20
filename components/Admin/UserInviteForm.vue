<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth'; // Your Pinia store or auth composable
import { getAllowedRolesForUserRole } from '~/composables/useRoles';

const authStore = useAuthStore();
const currentUserRole = authStore.user?.role || '';

const allowedRoles = computed(() => getAllowedRolesForUserRole(currentUserRole));

const form = ref({
  email: '',
  name: '',
  role: '',
  organizationId: '',
  platformId: '',
});

// Automatically attach org/platform context based on current user
const currentUser = authStore.user;
if (currentUser) {
  if (currentUser.role === 'platform-admin') {
    form.value.platformId = currentUser.platformId;
  }
  if (currentUser.role === 'organization-admin') {
    form.value.organizationId = currentUser.organizationId;
  }
  // super_admin may choose explicitly, so leave empty or bind from UI
}

function submitInvite() {
  // Validate form here or use a validation library
  if (!form.value.email || !form.value.role) {
    alert('Please fill email and role');
    return;
  }
  // Call your API
  $fetch('/api/user/invite', {
    method: 'POST',
    body: form.value,
  })
    .then((res) => {
      if (res.success) {
        alert('User invited successfully');
        // reset form if needed
      } else {
        alert('Error: ' + res.message);
      }
    })
    .catch(() => alert('Invite request failed'));
}
</script>

<template>
  <form @submit.prevent="submitInvite">
    <label>
      Email
      <input v-model="form.email" type="email" required />
    </label>

    <label>
      Name
      <input v-model="form.name" type="text" />
    </label>

    <label>
      Role
      <select v-model="form.role" required>
        <option value="" disabled>Select role</option>
        <option v-for="role in allowedRoles" :key="role" :value="role">
          {{ role }}
        </option>
      </select>
    </label>

    <!-- Conditionally render org/platform fields if super_admin -->
    <div v-if="currentUserRole === 'super_admin'">
      <label>
        Platform ID
        <input v-model="form.platformId" type="text" />
      </label>
      <label>
        Organization ID
        <input v-model="form.organizationId" type="text" />
      </label>
    </div>

    <button type="submit">Invite User</button>
  </form>
</template>
