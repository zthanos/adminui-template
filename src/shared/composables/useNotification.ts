import { ref } from 'vue'

export type NotificationType = 'success' | 'error' | 'warning' | 'info'

export interface Notification {
  id: string
  type: NotificationType
  message: string
  duration: number
  dismissible: boolean
}

const notifications = ref<Notification[]>([])
let notificationIdCounter = 0

export function useNotification() {
  const show = (
    message: string,
    type: NotificationType = 'info',
    duration: number = 5000,
    dismissible: boolean = true
  ) => {
    const id = `notification-${++notificationIdCounter}`
    const notification: Notification = {
      id,
      type,
      message,
      duration,
      dismissible
    }

    notifications.value.push(notification)

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id)
      }, duration)
    }

    return id
  }

  const dismiss = (id: string) => {
    const index = notifications.value.findIndex((n) => n.id === id)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  const success = (message: string, duration?: number) => {
    return show(message, 'success', duration)
  }

  const error = (message: string, duration?: number) => {
    return show(message, 'error', duration)
  }

  const warning = (message: string, duration?: number) => {
    return show(message, 'warning', duration)
  }

  const info = (message: string, duration?: number) => {
    return show(message, 'info', duration)
  }

  const clear = () => {
    notifications.value = []
  }

  return {
    notifications,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
    clear
  }
}
