<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
      <!-- Header -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-semibold text-blue-700 mb-2">Accept Invitation</h1>
        <p class="text-gray-600">Join your organization</p>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="text-center py-8">
        <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-gray-500">Loading invitation details...</p>
      </div>

      <!-- Success State -->
      <div v-if="success" class="text-center py-8">
        <svg class="w-16 h-16 text-green-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Welcome to the team!</h2>
        <p class="text-gray-600 mb-6">{{ message }}</p>
        <NuxtLink to="/login" class="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
          Continue to Login
        </NuxtLink>
      </div>

      <!-- Error State -->
      <div v-if="error && !loading" class="text-center py-8">
        <svg class="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
        </svg>
        <h2 class="text-xl font-semibold text-gray-900 mb-2">Invalid Invitation</h2>
        <p class="text-gray-600 mb-6">{{ error }}</p>
        <div class="space-y-3">
          <NuxtLink to="/login" class="block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center">
            Go to Login
          </NuxtLink>
          <NuxtLink to="/register" class="block text-blue-600 hover:text-blue-800 text-center">
            Create New Account
          </NuxtLink>
        </div>
      </div>

      <!-- Invitation Form -->
      <div v-if="!loading && !success && !error && inviteDetails">
        <!-- Invitation Details -->
        <div class="bg-blue-50 rounded-lg p-4 mb-6">
          <div class="flex items-center space-x-3">
            <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"/>
              </svg>
            </div>
            <div>
              <h3 class="font-medium text-gray-900">
                {{ inviteDetails.organizationName || inviteDetails.platformName || 'Organization' }}
              </h3>
              <p class="text-sm text-gray-600">
                You're invited to join as {{ formatRole(inviteDetails.role) }}
              </p>
              <p class="text-xs text-gray-500">Email: {{ inviteDetails.email }}</p>
            </div>
          </div>
        </div>

        <!-- Accept Form -->
        <form @submit.prevent="submit" class="space-y-4">
          <!-- Name Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Your Name *
            </label>
            <input v-model="name" type="text" placeholder="Enter your full name"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required />
          </div>

          <!-- Password Input -->
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              Create Password *
            </label>
            <input v-model="password" type="password" placeholder="Enter your password" minlength="8"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              required />
            <p v-if="password.length > 0 && password.length < 8" class="text-xs text-red-500 mt-1">
              Password must be at least 8 characters long
            </p>
          </div>

          <!-- Error Display -->
          <div v-if="message && !success" class="bg-red-50 border border-red-200 rounded-lg p-3">
            <div class="flex">
              <svg class="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
              <p class="text-red-700 text-sm">{{ message }}</p>
            </div>
          </div>

          <!-- Form Actions -->
          <div class="flex space-x-3">
            <NuxtLink to="/" 
              class="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 text-center font-medium py-2 px-4 rounded-lg transition">
              Decline
            </NuxtLink>
            <button type="submit" :disabled="loading || password.length < 8"
              class="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-lg transition flex items-center justify-center">
              <span v-if="loading" class="mr-2">
                <svg class="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </span>
              {{ loading ? 'Accepting...' : 'Accept Invitation' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Define page meta
definePageMeta({
  layout: false // No auth required for this page
})

// Define types for API responses
interface InvitationDetails {
  email?: string;
  role?: string;
  organizationName?: string;
  platformName?: string;
}

interface InviteResponse {
  success?: boolean;
  user?: {
    email?: string;
    role?: string;
    organization?: string;
  };
  invitation?: InvitationDetails;
  message?: string;
}

const route = useRoute();
const router = useRouter();
const token = route.query.token as string;

const name = ref('');
const password = ref('');
const message = ref('');
const success = ref(false);
const loading = ref(false);
const error = ref('');
const inviteDetails = ref<{
  email: string;
  role: string;
  organizationName?: string;
  platformName?: string;
} | null>(null);

const formatRole = (role: string) => {
  const labels: Record<string, string> = {
    organization_admin: 'Organization Admin',
    manager: 'Manager',
    employee: 'Employee',
  };
  return labels[role] || role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const submit = async () => {
  if (!token) {
    message.value = 'Invalid invitation token.';
    return;
  }

  loading.value = true;
  success.value = false;
  message.value = '';

  try {
    console.log('Accepting invite with token:', token.substring(0, 10) + '...');

    // Try new organization invitation system first
    const res = await $fetch<InviteResponse>('/api/org/users/accept-invite', {
      method: 'POST',
      body: {
        token,
        name: name.value.trim(),
        password: password.value.trim(),
      },
    });

    console.log('Accept invite response:', res);

    success.value = res.success || false;
    message.value = res.message || 'Invitation accepted successfully!';

    if (res.success) {
      // Redirect after 3 seconds
      setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  } catch (err: any) {
    console.error('Submit error:', err);
    success.value = false;

    // Get specific error message
    const errorMessage = err?.data?.message || err?.statusMessage || err?.message;

    if (err?.statusCode === 400) {
      if (errorMessage?.includes('expired')) {
        message.value = 'This invitation has expired. Please request a new invitation.';
      } else if (errorMessage?.includes('already been accepted')) {
        message.value = 'This invitation has already been used. You can log in directly.';
      } else if (errorMessage?.includes('Password')) {
        message.value = errorMessage;
      } else {
        message.value = errorMessage || 'Invalid invitation data.';
      }
    } else if (err?.statusCode === 404) {
      message.value = 'Invitation not found. Please check the invitation link.';
    } else {
      message.value = errorMessage || 'Something went wrong. Please try again.';
    }
  } finally {
    loading.value = false;
  }
};

const fetchInviteDetails = async () => {
  if (!token) {
    error.value = 'Invalid or missing invitation token.';
    return;
  }

  loading.value = true;
  error.value = '';
  
  try {
    console.log('Fetching invite details for token:', token.substring(0, 10) + '...')
    
    // Try new organization invitation system first
    const res = await $fetch<InviteResponse>('/api/org/users/verify-invite', {
      method: 'GET',
      query: { token }
    });

    console.log('Invite details response:', res);

    if (res.success && res.invitation) {
      inviteDetails.value = {
        email: res.invitation.email || '',
        role: res.invitation.role || '',
        organizationName: res.invitation.organizationName,
        platformName: res.invitation.platformName
      };
    } else {
      error.value = res.message || 'Unable to retrieve invitation details.';
    }
  } catch (err: any) {
    console.error('Fetch invite details error:', err);
    
    const errorMessage = err?.data?.message || err?.statusMessage || err?.message;
    
    if (err?.statusCode === 400) {
      if (errorMessage?.includes('expired')) {
        error.value = 'This invitation has expired. Please request a new invitation.';
      } else if (errorMessage?.includes('already been accepted')) {
        error.value = 'This invitation has already been used. You can log in directly.';
      } else {
        error.value = errorMessage || 'Invalid invitation.';
      }
    } else if (err?.statusCode === 404) {
      error.value = 'Invitation not found. Please check the invitation link.';
    } else {
      error.value = errorMessage || 'Unable to load invitation details.';
    }
  } finally {
    loading.value = false;
  }
};

onMounted(fetchInviteDetails);
</script>
