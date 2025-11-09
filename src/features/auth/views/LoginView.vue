<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200">
    <div class="card w-96 bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <h2 class="card-title text-2xl mb-4">Admin Portal</h2>
        <p class="mb-6">Sign in with your organization account</p>
        
        <button 
          class="btn btn-primary w-full"
          @click="handleLogin"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading loading-spinner"></span>
          <span v-else>Sign In with Microsoft</span>
        </button>

        <p v-if="error" class="text-error text-sm mt-4">
          {{ error }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const isLoading = ref(false)
const error = ref<string | null>(null)

async function handleLogin() {
  isLoading.value = true
  error.value = null
  
  try {
    await authStore.initiateLogin()
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Login failed'
    isLoading.value = false
  }
}
</script>
