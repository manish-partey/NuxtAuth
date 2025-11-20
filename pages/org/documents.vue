<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Organization Admin Dashboard
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Step 3: Manage your organizations and their document requirements
          </p>
        </div>
      </div>

      <!-- My Organizations -->
      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">My Organizations</h3>
          <p class="mt-1 text-sm text-gray-500">
            Organizations you are an administrator for
          </p>
        </div>
        
        <div class="divide-y divide-gray-200">
          <div v-if="myOrganizations.length === 0" class="p-6 text-center text-gray-500">
            <h3 class="mt-2 text-sm font-medium text-gray-900">No organizations assigned</h3>
            <p class="mt-1 text-sm text-gray-500">Contact your platform admin to get organization access.</p>
          </div>
          
          <div v-for="org in myOrganizations" :key="org._id" class="p-6 hover:bg-gray-50 cursor-pointer" @click="viewOrganization(org)">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="flex items-center">
                  <h4 class="text-lg font-medium text-gray-900">{{ org.name }}</h4>
                  <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium" :class="org.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'">
                    {{ org.active ? 'Active' : 'Inactive' }}
                  </span>
                  <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    {{ org.platformName }}
                  </span>
                </div>
                <p class="mt-1 text-sm text-gray-600">{{ org.description }}</p>
                <div class="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                  <span>Users: {{ org.userCount || 0 }}</span>
                  <span>Required Docs: {{ org.requiredDocsCount || 0 }}</span>
                  <span>Optional Docs: {{ org.optionalDocsCount || 0 }}</span>
                  <span>Platform Required: {{ org.platformRequiredCount || 0 }}</span>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <button @click.stop="viewOrganizationDocuments(org)" class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  View Documents
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Organization Document Requirements Detail -->
      <div v-if="selectedOrganization" class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-lg font-medium text-gray-900">{{ selectedOrganization.name }} - Document Requirements</h3>
              <p class="mt-1 text-sm text-gray-500">
                Inherited from platform "{{ selectedOrganization.platformName }}" + organization-specific requirements
              </p>
            </div>
            <button @click="selectedOrganization = null" class="text-gray-400 hover:text-gray-600">Close</button>
          </div>
        </div>

        <div class="p-6">
          <!-- Platform Requirements -->
          <div class="mb-8">
            <h3 class="text-lg font-medium text-purple-900 mb-4">Inherited from Platform: {{ selectedOrganization.platformName }}</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-purple-600 mb-3">Platform Required Documents</h4>
                <div v-if="platformRequiredDocs.length === 0" class="text-center text-gray-500 py-6 border-2 border-dashed border-purple-200 rounded-lg">
                  <p class="text-sm">No platform required documents</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="doc in platformRequiredDocs" :key="doc._id" class="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-600">{{ doc.description }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800 mt-1">
                      Platform Required
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-purple-500 mb-3">Platform Optional Documents</h4>
                <div v-if="platformOptionalDocs.length === 0" class="text-center text-gray-500 py-6 border-2 border-dashed border-purple-200 rounded-lg">
                  <p class="text-sm">No platform optional documents</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="doc in platformOptionalDocs" :key="doc._id" class="border border-purple-200 rounded-lg p-3 bg-purple-50">
                    <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-600">{{ doc.description }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600 mt-1">
                      Platform Optional
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Organization-Specific Requirements -->
          <div>
            <h3 class="text-lg font-medium text-orange-900 mb-4">Organization-Specific Requirements</h3>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h4 class="text-sm font-medium text-red-600 mb-3">Organization Required Documents</h4>
                <div v-if="orgRequiredDocs.length === 0" class="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <p class="text-sm">No organization required documents</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="doc in orgRequiredDocs" :key="doc._id" class="border border-red-200 rounded-lg p-3 bg-red-50">
                    <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-600">{{ doc.description }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800 mt-1">
                      Organization Required
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-blue-600 mb-3">Organization Optional Documents</h4>
                <div v-if="orgOptionalDocs.length === 0" class="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg">
                  <p class="text-sm">No organization optional documents</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="doc in orgOptionalDocs" :key="doc._id" class="border border-blue-200 rounded-lg p-3 bg-blue-50">
                    <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-600">{{ doc.description }}</p>
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 mt-1">
                      Organization Optional
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth-guard']
})

const myOrganizations = ref([])
const selectedOrganization = ref(null)
const organizationDocuments = ref([])

const platformRequiredDocs = computed(() => 
  organizationDocuments.value.filter(doc => doc.layer === 'platform' && doc.required)
)

const platformOptionalDocs = computed(() => 
  organizationDocuments.value.filter(doc => doc.layer === 'platform' && !doc.required)
)

const orgRequiredDocs = computed(() => 
  organizationDocuments.value.filter(doc => doc.layer === 'organization' && doc.required)
)

const orgOptionalDocs = computed(() => 
  organizationDocuments.value.filter(doc => doc.layer === 'organization' && !doc.required)
)

const loadMyOrganizations = async () => {
  try {
    console.log('Loading my organizations...')
    const result = await $fetch('/api/org-admin/organizations')
    myOrganizations.value = result.data || []
    console.log('Loaded organizations:', myOrganizations.value.length)
  } catch (error) {
    console.error('Error loading organizations:', error)
  }
}

const viewOrganization = (org) => {
  console.log('Viewing organization:', org.name)
  viewOrganizationDocuments(org)
}

const viewOrganizationDocuments = async (org) => {
  selectedOrganization.value = org
    
  try {
    console.log('Loading documents for organization:', org.name)
    const result = await $fetch(`/api/org-admin/organizations/${org._id}/document-types`)
    organizationDocuments.value = result.data || []
    console.log('Loaded documents:', organizationDocuments.value.length)
  } catch (error) {
    console.error('Error loading organization documents:', error)
    organizationDocuments.value = []
  }
}

onMounted(() => {
  loadMyOrganizations()
})
</script>