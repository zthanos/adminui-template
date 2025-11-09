<template>
  <div class="breadcrumbs text-sm px-4 py-3 bg-base-100 border-b border-base-300">
    <ul>
      <li v-for="(crumb, index) in breadcrumbItems" :key="index">
        <a
          v-if="crumb.path && index < breadcrumbItems.length - 1"
          @click.prevent="navigateTo(crumb.path)"
          class="cursor-pointer hover:text-primary"
        >
          <component v-if="crumb.icon" :is="crumb.icon" class="w-4 h-4 mr-1" />
          {{ crumb.label }}
        </a>
        <span v-else class="flex items-center">
          <component v-if="crumb.icon" :is="crumb.icon" class="w-4 h-4 mr-1" />
          {{ crumb.label }}
        </span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, h } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface BreadcrumbItem {
  label: string
  path?: string
  icon?: () => any
}

const route = useRoute()
const router = useRouter()

const breadcrumbItems = computed<BreadcrumbItem[]>(() => {
  const items: BreadcrumbItem[] = []

  // Always add home/dashboard as first item
  items.push({
    label: 'Home',
    path: '/dashboard',
    icon: () =>
      h(
        'svg',
        {
          xmlns: 'http://www.w3.org/2000/svg',
          fill: 'none',
          viewBox: '0 0 24 24',
          'stroke-width': '1.5',
          stroke: 'currentColor'
        },
        [
          h('path', {
            'stroke-linecap': 'round',
            'stroke-linejoin': 'round',
            d: 'M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25'
          })
        ]
      )
  })

  // Don't add current page if it's dashboard
  if (route.path === '/dashboard' || route.path === '/') {
    return items
  }

  // Add current page from route metadata
  if (route.meta.breadcrumb) {
    items.push({
      label: route.meta.breadcrumb as string,
      path: route.path
    })
  } else {
    // Fallback: generate from path
    const pathSegments = route.path.split('/').filter(Boolean)
    pathSegments.forEach((segment, index) => {
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
      const path = '/' + pathSegments.slice(0, index + 1).join('/')
      items.push({ label, path })
    })
  }

  return items
})

const navigateTo = (path: string) => {
  router.push(path)
}
</script>
