<!--
  StatsCard Component
  Displays a statistic with title, value, and optional icon using DaisyUI card
-->
<template>
  <div class="card bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h2 class="card-title text-sm font-medium text-base-content/70">
            {{ title }}
          </h2>
          <div v-if="loading" class="mt-2">
            <span class="loading loading-spinner loading-md"></span>
          </div>
          <p v-else class="text-3xl font-bold text-base-content mt-2">
            {{ value }}
          </p>
          <p v-if="description" class="text-sm text-base-content/60 mt-1">
            {{ description }}
          </p>
        </div>
        <div v-if="icon" class="text-4xl opacity-20">
          {{ icon }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  description?: string
  icon?: string
  loading?: boolean
}>()
</script>
