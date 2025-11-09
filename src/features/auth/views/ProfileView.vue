<template>
  <AppLayout>
    <div class="container mx-auto max-w-4xl">
    <h1 class="text-3xl font-bold mb-6">User Profile</h1>

    <!-- Profile Information Card -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title mb-4">Profile Information</h2>
        
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          <div>
            <label class="label">
              <span class="label-text font-semibold">Name</span>
            </label>
            <p class="text-lg break-words">{{ authStore.user?.name || 'N/A' }}</p>
          </div>

          <div>
            <label class="label">
              <span class="label-text font-semibold">Email</span>
            </label>
            <p class="text-lg break-words">{{ authStore.user?.email || 'N/A' }}</p>
          </div>

          <div class="sm:col-span-2">
            <label class="label">
              <span class="label-text font-semibold">Roles</span>
            </label>
            <div class="flex flex-wrap gap-2">
              <span
                v-for="role in authStore.userRoles"
                :key="role"
                class="badge badge-primary"
              >
                {{ role }}
              </span>
              <span v-if="authStore.userRoles.length === 0" class="text-base-content/60">
                No roles assigned
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Update Profile Card -->
    <div class="card bg-base-100 shadow-xl mb-6">
      <div class="card-body">
        <h2 class="card-title mb-4">Update Profile</h2>
        
        <form @submit.prevent="handleSubmit">
          <div class="form-control mb-4">
            <label class="label">
              <span class="label-text">Display Name</span>
            </label>
            <input
              v-model="displayName"
              type="text"
              placeholder="Enter your display name"
              class="input input-bordered w-full"
              :disabled="isSubmitting"
            />
          </div>

          <div class="form-control mb-6">
            <label class="label">
              <span class="label-text">Theme Preference</span>
            </label>
            <select
              v-model="selectedTheme"
              class="select select-bordered w-full"
              :disabled="isSubmitting"
              @change="handleThemeChange"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="corporate">Corporate</option>
            </select>
          </div>

          <div class="card-actions justify-end">
            <button
              type="submit"
              class="btn btn-primary"
              :disabled="isSubmitting || !hasChanges"
            >
              <span v-if="isSubmitting" class="loading loading-spinner loading-sm"></span>
              {{ isSubmitting ? 'Saving...' : 'Save Changes' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Password Management Card -->
    <div class="card bg-base-100 shadow-xl">
      <div class="card-body">
        <h2 class="card-title mb-4">Password Management</h2>
        <p class="mb-4">
          Password management is handled by your OAuth provider (Entra ID).
        </p>
        <div class="card-actions">
          <a
            :href="passwordManagementUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="btn btn-outline"
          >
            Manage Password
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 ml-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
        </div>
      </div>
    </div>
    </div>
  </AppLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { useTheme } from '@/shared/composables/useTheme'
import { useNotification } from '@/shared/composables/useNotification'
import AppLayout from '@/layouts/AppLayout.vue'

const authStore = useAuthStore()
const { currentTheme, setTheme } = useTheme()
const { success, error } = useNotification()

// Form state
const displayName = ref('')
const selectedTheme = ref<'light' | 'dark' | 'corporate'>('light')
const isSubmitting = ref(false)

// Password management URL (Entra ID self-service password reset)
const passwordManagementUrl = 'https://account.activedirectory.windowsazure.com/ChangePassword.aspx'

// Check if form has changes
const hasChanges = computed(() => {
  return displayName.value !== (authStore.user?.name || '')
})

// Initialize form with current user data
onMounted(() => {
  if (authStore.user) {
    displayName.value = authStore.user.name
  }
  selectedTheme.value = currentTheme.value
})

// Handle theme change
const handleThemeChange = () => {
  setTheme(selectedTheme.value)
}

// Handle form submission
const handleSubmit = async () => {
  if (!hasChanges.value) {
    return
  }

  isSubmitting.value = true

  try {
    await authStore.updateUserProfile({
      displayName: displayName.value,
    })

    success('Profile updated successfully')
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Failed to update profile'
    error(errorMessage)
  } finally {
    isSubmitting.value = false
  }
}
</script>
