<template>
  <section class="max-w-3xl mx-auto p-8 bg-white rounded-lg shadow-md">
    <h1 class="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">
      Invite User to Organization
    </h1>

    <UserForm
      :availableRoles="availableRoles"
      :organizations="[currentOrg]"
      :platforms="[]"
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
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '~/stores/auth';
import UserForm from '~/components/Admin/UserForm.vue';

const message = ref('');
const isSuccess = ref(false);
const authStore = useAuthStore();

const currentOrg = authStore.organization!;
const availableRoles = ref(['user']); // Limit roles if needed

const messageClass = computed(() =>
  isSuccess.value
    ? 'text-green-700 bg-green-100 border-green-300'
    : 'text-red-700 bg-red-100 border-red-300'
);

const handleCreated = ({
  success,
  message: msg,
}: {
  success: boolean;
  message: string;
}) => {
  message.value = msg;
  isSuccess.value = success;
};

definePageMeta({
  middleware: ['auth', 'org-admin'], // Add your own middleware if needed
});
</script>
