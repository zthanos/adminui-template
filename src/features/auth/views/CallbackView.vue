<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <div v-if="isProcessing">
          <span class="loading loading-spinner loading-lg"></span>
          <p class="mt-4">Completing sign in...</p>
        </div>

        <div v-else-if="error" class="text-error">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 class="text-xl font-bold mb-2">Authentication Failed</h3>
          <p class="mb-4">{{ error }}</p>
          <button class="btn btn-primary" @click="goToLogin">
            Return to Login
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isProcessing = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  const code = route.query.code as string
  const errorParam = route.query.error as string

  if (errorParam) {
    error.value = `OAuth error: ${errorParam}`
    isProcessing.value = false
    return
  }

  if (!code) {
    error.value = 'No authorization code received'
    isProcessing.value = false
    return
  }

  try {
    await authStore.handleCallback(code)
    
    // Get redirect path from session storage or default to dashboard
    const redirectPath = sessionStorage.getItem('redirect_after_login') || '/dashboard'
    sessionStorage.removeItem('redirect_after_login')
    
    router.push(redirectPath)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Authentication failed'
    isProcessing.value = false
  }
})

function goToLogin() {
  router.push('/login')
}
</script>
