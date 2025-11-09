import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './style.css'
import { vPermission } from './shared/directives'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Register custom directives
app.directive('permission', vPermission)

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('[Vue Error Handler]', {
    error: err,
    component: instance?.$options.name || 'Unknown',
    info,
    timestamp: new Date().toISOString()
  })

  // Log to external service in production
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service (e.g., Sentry)
  }
}

// Global warning handler (development only)
if (import.meta.env.DEV) {
  app.config.warnHandler = (msg, instance, trace) => {
    console.warn('[Vue Warning]', {
      message: msg,
      component: instance?.$options.name || 'Unknown',
      trace
    })
  }
}

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Unhandled Promise Rejection]', {
    reason: event.reason,
    promise: event.promise,
    timestamp: new Date().toISOString()
  })

  // Prevent default browser error handling
  event.preventDefault()

  // Log to external service in production
  if (import.meta.env.PROD) {
    // TODO: Send to error tracking service
  }
})

app.mount('#app')
