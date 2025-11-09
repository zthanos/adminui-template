<!--
  ErrorView Component
  Displays user-friendly error page when an unhandled error occurs
-->
<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md bg-base-100 shadow-xl">
      <div class="card-body items-center text-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-16 w-16 text-error mb-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        
        <h2 class="card-title text-2xl mb-2">Something went wrong</h2>
        
        <p class="text-base-content/70 mb-6">
          {{ errorMessage || 'An unexpected error occurred. Please try again.' }}
        </p>

        <div v-if="showDetails && errorDetails" class="w-full mb-4">
          <div class="collapse collapse-arrow bg-base-200">
            <input type="checkbox" />
            <div class="collapse-title text-sm font-medium">
              Error Details
            </div>
            <div class="collapse-content">
              <pre class="text-xs text-left overflow-auto max-h-40">{{ errorDetails }}</pre>
            </div>
          </div>
        </div>
        
        <div class="card-actions flex-col sm:flex-row gap-2 w-full">
          <button class="btn btn-primary flex-1" @click="handleReload">
            Reload Page
          </button>
          <button class="btn btn-ghost flex-1" @click="handleGoHome">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  errorMessage?: string
  errorDetails?: string
  showDetails?: boolean
}

withDefaults(defineProps<Props>(), {
  errorMessage: '',
  errorDetails: '',
  showDetails: false
})

const router = useRouter()

const handleReload = () => {
  window.location.reload()
}

const handleGoHome = () => {
  router.push('/dashboard')
}
</script>
