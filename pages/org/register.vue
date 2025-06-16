<!-- pages/org/register.vue -->
<template>
  <div class="max-w-xl mx-auto py-10">
    <h1 class="text-2xl font-bold mb-6">Register Your Organization</h1>
    <form @submit.prevent="registerOrg" class="space-y-4">
      <input
        v-model="form.name"
        type="text"
        placeholder="Organization Name"
        class="input input-bordered w-full"
        required
      />
      <input
        v-model="form.email"
        type="email"
        placeholder="Admin Email"
        class="input input-bordered w-full"
        required
      />
      <input
        v-model="form.password"
        type="password"
        placeholder="Password"
        class="input input-bordered w-full"
        required
      />
      <button type="submit" class="btn btn-primary w-full">Register</button>
    </form>
    <p v-if="error" class="text-red-500 mt-4">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
const form = reactive({
  name: '',
  email: '',
  password: ''
})

const error = ref('')
const router = useRouter()

async function registerOrg() {
  try {
    error.value = ''
    const response = await $fetch('/api/org/register', {
      method: 'POST',
      body: form
    })
    router.push('/verify-email')
  } catch (err: any) {
    error.value = err.data?.message || 'Registration failed'
  }
}
</script>
