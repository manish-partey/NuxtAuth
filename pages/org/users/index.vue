<template>
  <div class="p-6">
    <!-- Header Section -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-6">
      <div>
  <h1 class="text-2xl font-bold">Organization Users</h1>
        <p class="text-gray-600">Manage users and roles in your organization</p>
      </div>
  <div class="flex space-x-3 shrink-0">
        <button @click="showInviteModal = true"
          class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
          </svg>
          Add Users
        </button>
        <button v-if="selectedUsers.length > 0" @click="showBulkModal = true"
          class="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700">
          Bulk Actions ({{ selectedUsers.length }})
        </button>
      </div>
    </div>

    <!-- Filters Section -->
    <div class="bg-white rounded-lg shadow mb-6 p-4">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Search</label>
          <input v-model="searchQuery" type="text" placeholder="Search by name or email..."
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Role</label>
          <select v-model="filterRole" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Roles</option>
            <option value="organization_admin">Organization Admin</option>
            <option value="manager">Manager</option>
            <option value="employee">Employee</option>
            <option value="guest">Guest</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select v-model="filterStatus" 
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none">
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="invitation_sent">Invitation Sent</option>
            <option value="suspended">Suspended</option>
          </select>
        </div>
        <div class="flex items-end">
          <button @click="resetFilters" 
            class="px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50">
            Reset
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="text-center py-12">
      <svg class="animate-spin h-8 w-8 text-blue-600 mx-auto mb-4" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      <p class="text-gray-500">Loading users...</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
      <div class="flex">
        <svg class="h-5 w-5 text-red-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
        </svg>
        <p class="text-red-700">{{ error }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <div v-if="!loading && users.length > 0" class="bg-white shadow rounded-lg overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left">
              <input type="checkbox" @change="toggleSelectAll" :checked="isAllSelected"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="userOrg in users" :key="userOrg._id" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">
              <input type="checkbox" :value="userOrg._id" v-model="selectedUsers"
                class="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="flex items-center">
                <div class="h-10 w-10 flex-shrink-0">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                    <span class="text-sm font-medium text-gray-700">
                      {{ getUserInitials(userOrg.user) }}
                    </span>
                  </div>
                </div>
                <div class="ml-4">
                  <div class="text-sm font-medium text-gray-900">
                    {{ userOrg.user?.name || 'Pending User' }}
                  </div>
                  <div class="text-sm text-gray-500">{{ userOrg.user?.email || userOrg.invitedEmail }}</div>
                </div>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <RoleBadge :role="userOrg.role" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <StatusBadge :status="userOrg.status" />
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              {{ userOrg.joinedAt ? formatDate(userOrg.joinedAt) : 'Not joined' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
              <div class="flex space-x-2">
                <button v-if="!['organization_admin', 'platform_admin', 'super_admin'].includes(userOrg.role)" 
                  @click="openRoleModal(userOrg)"
                  class="text-blue-600 hover:text-blue-900">
                  Edit Role
                </button>
                <button v-if="userOrg.status === 'active' && !['organization_admin', 'platform_admin', 'super_admin'].includes(userOrg.role)" 
                  @click="suspendUser(userOrg)"
                  class="text-yellow-600 hover:text-yellow-900">
                  Pause
                </button>
                <button v-if="userOrg.status === 'suspended' && !['organization_admin', 'platform_admin', 'super_admin'].includes(userOrg.role)" 
                  @click="activateUser(userOrg)"
                  class="text-green-600 hover:text-green-900">
                  Resume
                </button>
                <button v-if="!['organization_admin', 'platform_admin', 'super_admin'].includes(userOrg.role)" 
                  @click="removeUser(userOrg)"
                  class="text-red-600 hover:text-red-900">
                  Remove
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    

    <!-- Pagination -->
    <div v-if="pagination && pagination.pages > 1" class="mt-6 flex justify-between items-center">
      <div class="text-sm text-gray-700">
        Showing {{ users.length }} of {{ pagination.total }} users
      </div>
      <div class="flex space-x-2">
        <button v-if="pagination.hasPrev" @click="loadPage(pagination.current - 1)"
          class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Previous
        </button>
        <span class="px-3 py-2 border border-gray-300 rounded-md bg-blue-50 text-blue-600">
          {{ pagination.current }} of {{ pagination.pages }}
        </span>
        <button v-if="pagination.hasNext" @click="loadPage(pagination.current + 1)"
          class="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
          Next
        </button>
      </div>
    </div>

    <!-- Invite Modal -->
    <InviteUserModal 
      v-if="showInviteModal" 
      @close="showInviteModal = false"
      @success="handleInviteSuccess" 
    />

    <!-- Role Edit Modal -->
    <UserRoleModal 
      v-if="showRoleModal && selectedUserForRole" 
      :user="selectedUserForRole"
      @close="closeRoleModal"
      @success="handleRoleUpdateSuccess" 
    />

    <!-- Bulk Actions Modal -->
    <BulkActionModal 
      v-if="showBulkModal" 
      :selected-users="selectedUsers"
      @close="showBulkModal = false"
      @success="handleBulkActionSuccess" 
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Simple debounce function
const debounce = (func, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func.apply(null, args), delay)
  }
}

// Components
import InviteUserModal from '~/components/org/UserManagement/InviteUserModal.vue'
import UserRoleModal from '~/components/org/UserManagement/UserRoleModal.vue'
import BulkActionModal from '~/components/org/UserManagement/BulkActionModal.vue'
import RoleBadge from '~/components/org/shared/RoleBadge.vue'
import StatusBadge from '~/components/org/shared/StatusBadge.vue'

// Define page meta
definePageMeta({
  middleware: ['auth-guard'],
  roles: ['organization_admin']
})

// Reactive data
const users = ref([])
const loading = ref(false)
const error = ref('')
const pagination = ref(null)

// Filters
const searchQuery = ref('')
const filterRole = ref('')
const filterStatus = ref('')
const currentPage = ref(1)

// Selection
const selectedUsers = ref([])

// Modals
const showInviteModal = ref(false)
const showRoleModal = ref(false)
const showBulkModal = ref(false)
const selectedUserForRole = ref(null)

// Computed
const isAllSelected = computed(() => {
  return users.value.length > 0 && selectedUsers.value.length === users.value.length
})

// Debounced search
const debouncedSearch = debounce(() => {
  currentPage.value = 1
  loadUsers()
}, 300)

// Watch for filter changes
watch([searchQuery, filterRole, filterStatus], () => {
  debouncedSearch()
})

// Methods
const loadUsers = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const params = new URLSearchParams({
      page: currentPage.value.toString(),
      limit: '10'
    })
    
    if (searchQuery.value) params.append('search', searchQuery.value)
    if (filterRole.value) params.append('role', filterRole.value)
    if (filterStatus.value) params.append('status', filterStatus.value)
    
    console.log('[loadUsers] Fetching users with params:', params.toString())
    
    const response = await $fetch(`/api/org/users/list?${params}`, {
      credentials: 'include'
    })
    
    console.log('[loadUsers] API Response:', response)
    
    if (response.success) {
      users.value = response.users
      pagination.value = response.pagination
      console.log('[loadUsers] Loaded users:', users.value.length, 'Pagination:', pagination.value)
    } else {
      throw new Error(response.message || 'Failed to load users')
    }
  } catch (err) {
    console.error('[loadUsers] Error:', err)
    error.value = err.data?.message || err.message || 'Failed to load users'
    users.value = []
  } finally {
    loading.value = false
  }
}

const loadPage = (page) => {
  currentPage.value = page
  loadUsers()
}

const resetFilters = () => {
  searchQuery.value = ''
  filterRole.value = ''
  filterStatus.value = ''
  selectedUsers.value = []
  currentPage.value = 1
}

const toggleSelectAll = () => {
  if (isAllSelected.value) {
    selectedUsers.value = []
  } else {
    selectedUsers.value = users.value.map(user => user._id)
  }
}

const getUserInitials = (user) => {
  if (!user?.name) return '?'
  return user.name.split(' ').map(n => n[0]).join('').toUpperCase()
}

const formatDate = (date) => {
  return new Date(date).toLocaleDateString()
}

// Role management
const openRoleModal = (userOrg) => {
  selectedUserForRole.value = userOrg
  showRoleModal.value = true
}

const closeRoleModal = () => {
  selectedUserForRole.value = null
  showRoleModal.value = false
}

const handleRoleUpdateSuccess = () => {
  closeRoleModal()
  loadUsers()
  selectedUsers.value = []
}

// User actions
const suspendUser = async (userOrg) => {
  if (!confirm(`Are you sure you want to pause ${userOrg.user?.name || 'this user'}? They will not be able to access the system until resumed.`)) return
  
  try {
    const response = await $fetch(`/api/org/users/${userOrg.user?._id}/toggle-status`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.success) {
      alert(response.message || 'User paused successfully!')
      loadUsers()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to pause user'
  }
}

const activateUser = async (userOrg) => {
  try {
    const response = await $fetch(`/api/org/users/${userOrg.user?._id}/toggle-status`, {
      method: 'POST',
      credentials: 'include'
    })
    
    if (response.success) {
      alert(response.message || 'User resumed successfully!')
      loadUsers()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to resume user'
  }
}

const removeUser = async (userOrg) => {
  if (!confirm(`Are you sure you want to remove ${userOrg.user?.name || 'this user'} from the organization?`)) return
  
  try {
    const response = await $fetch(`/api/org/users/${userOrg.user?._id}/remove`, {
      method: 'DELETE',
      credentials: 'include'
    })
    
    if (response.success) {
      loadUsers()
      selectedUsers.value = selectedUsers.value.filter(id => id !== userOrg._id)
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.data?.message || err.message || 'Failed to remove user'
  }
}

// Event handlers
const handleInviteSuccess = () => {
  showInviteModal.value = false
  loadUsers()
}

const handleBulkActionSuccess = () => {
  showBulkModal.value = false
  selectedUsers.value = []
  loadUsers()
}

// Initialize
onMounted(() => {
  loadUsers()
})
</script>