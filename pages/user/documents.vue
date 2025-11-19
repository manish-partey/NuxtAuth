<template>
  <div class="min-h-screen bg-gray-50">
    <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div class="md:flex md:items-center md:justify-between mb-6">
        <div class="flex-1 min-w-0">
          <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            My Document Requirements
          </h2>
          <p class="mt-1 text-sm text-gray-500">
            Step 4: View all document requirements that apply to you
          </p>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg mb-6">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">My Organization</h3>
          <p class="mt-1 text-sm text-gray-500">{{ userOrganization?.name || 'No organization assigned' }}</p>
        </div>
        
        <div v-if="userOrganization" class="p-6">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="flex items-center">
                <h4 class="text-lg font-medium text-gray-900">{{ userOrganization.name }}</h4>
                <span class="ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
                <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  {{ userOrganization.platformName }}
                </span>
              </div>
              <p class="mt-1 text-sm text-gray-600">{{ userOrganization.description }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white shadow rounded-lg">
        <div class="px-6 py-4 border-b border-gray-200">
          <h3 class="text-lg font-medium text-gray-900">Document Requirements</h3>
          <p class="mt-1 text-sm text-gray-500">
            All document requirements inherited from platform and organization
          </p>
        </div>

        <div class="p-6">
          <div class="mb-8">
            <h3 class="text-lg font-medium text-purple-900 mb-4">Platform Requirements ({{ userOrganization?.platformName }})</h3>
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
                    <div class="flex items-center justify-between mt-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                        Platform Required
                      </span>
                      <span v-if="doc.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium text-purple-500 mb-3">Platform Optional Documents</h4>
                <div v-if="platformOptionalDocs.length === 0" class="text-center text-gray-500 py-6 border-2 border-dashed border-purple-200 rounded-lg">
                  <p class="text-sm">No platform optional documents</p>
                </div>
                <div v-else class="space-y-2">
                  <div v-for="doc in platformOptionalDocs" :key="doc._id" class="border border-purple-200 rounded-lg p-3 bg-purple-25">
                    <h5 class="text-sm font-medium text-gray-900">{{ doc.name }}</h5>
                    <p class="text-xs text-gray-600">{{ doc.description }}</p>
                    <div class="flex items-center justify-between mt-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-50 text-purple-600">
                        Platform Optional
                      </span>
                      <span v-if="doc.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="mb-8">
            <h3 class="text-lg font-medium text-orange-900 mb-4">Organization Requirements ({{ userOrganization?.name }})</h3>
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
                    <div class="flex items-center justify-between mt-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                        Organization Required
                      </span>
                      <span v-if="doc.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
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
                    <div class="flex items-center justify-between mt-2">
                      <span class="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Organization Optional
                      </span>
                      <span v-if="doc.maxSize" class="text-xs text-gray-500">Max: {{ formatFileSize(doc.maxSize) }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-4">Summary</h3>
            <div class="bg-gray-50 rounded-lg p-4">
              <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
                <div>
                  <div class="text-2xl font-bold text-purple-600">{{ platformRequiredDocs.length }}</div>
                  <div class="text-xs text-gray-500">Platform Required</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-purple-400">{{ platformOptionalDocs.length }}</div>
                  <div class="text-xs text-gray-500">Platform Optional</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-red-600">{{ orgRequiredDocs.length }}</div>
                  <div class="text-xs text-gray-500">Org Required</div>
                </div>
                <div>
                  <div class="text-2xl font-bold text-blue-600">{{ orgOptionalDocs.length }}</div>
                  <div class="text-xs text-gray-500">Org Optional</div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-gray-200 text-center">
                <div class="text-2xl font-bold text-gray-900">{{ totalRequiredDocs }}</div>
                <div class="text-sm text-gray-500">Total Required Documents</div>
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

const userOrganization = ref(null)
const userDocuments = ref([])

const platformRequiredDocs = computed(() => 
  userDocuments.value.filter(doc => doc.layer === 'platform' && doc.required)
)

const platformOptionalDocs = computed(() => 
  userDocuments.value.filter(doc => doc.layer === 'platform' && !doc.required)
)

const orgRequiredDocs = computed(() => 
  userDocuments.value.filter(doc => doc.layer === 'organization' && doc.required)
)

const orgOptionalDocs = computed(() => 
  userDocuments.value.filter(doc => doc.layer === 'organization' && !doc.required)
)

const totalRequiredDocs = computed(() => 
  platformRequiredDocs.value.length + orgRequiredDocs.value.length
)

const loadUserDocuments = async () => {
  try {
    console.log('Loading user document requirements...')
    const result = await $fetch('/api/user/document-requirements')
    userOrganization.value = result.data.organization
    userDocuments.value = result.data.documents || []
    console.log('Loaded user documents:', userDocuments.value.length)
  } catch (error) {
    console.error('Error loading user documents:', error)
  }
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

onMounted(() => {
  loadUserDocuments()
})
</script>

<style scoped>
.bg-purple-25 {
  background-color: #faf5ff;
}
</style>