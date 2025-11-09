<script setup lang="ts">
import { ref, watch } from 'vue'

interface Emits {
  (e: 'search', query: string): void
  (e: 'clear'): void
}

const emit = defineEmits<Emits>()

const searchQuery = ref('')
const searchTimeout = ref<number | null>(null)

// Debounced search
watch(searchQuery, (newValue) => {
  if (searchTimeout.value) {
    clearTimeout(searchTimeout.value)
  }

  searchTimeout.value = window.setTimeout(() => {
    if (newValue.trim()) {
      emit('search', newValue.trim())
    } else {
      emit('clear')
    }
  }, 300)
})

const handleClear = () => {
  searchQuery.value = ''
  emit('clear')
}
</script>

<template>
  <div class="flex flex-col sm:flex-row gap-4 mb-6">
    <div class="form-control flex-1">
      <div class="input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search by name or email..."
          class="input input-bordered w-full"
        />
        <button
          v-if="searchQuery"
          class="btn btn-square"
          @click="handleClear"
          aria-label="Clear search"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <button v-else class="btn btn-square" disabled aria-label="Search">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>
