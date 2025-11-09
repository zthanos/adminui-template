<!--
  TableSkeleton Component
  Displays a skeleton loader for table data
-->
<template>
  <div class="animate-pulse">
    <!-- Table header skeleton -->
    <div class="flex gap-4 mb-4 pb-4 border-b border-base-300">
      <div v-for="i in columns" :key="i" class="flex-1">
        <div class="h-4 bg-base-300 rounded w-3/4"></div>
      </div>
    </div>

    <!-- Table rows skeleton -->
    <div v-for="row in rows" :key="row" class="flex gap-4 mb-4">
      <div v-for="col in columns" :key="col" class="flex-1">
        <div class="h-4 bg-base-300 rounded" :class="getWidthClass(col)"></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rows?: number
  columns?: number
}

withDefaults(defineProps<Props>(), {
  rows: 5,
  columns: 4
})

const getWidthClass = (col: number) => {
  // Vary the width for more realistic skeleton
  const widths = ['w-full', 'w-5/6', 'w-4/5', 'w-3/4']
  return widths[col % widths.length]
}
</script>
