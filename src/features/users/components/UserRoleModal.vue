<script setup lang="ts">
import { ref, watch } from 'vue'
import type { User } from '@/shared/types/user.types'

interface Props {
  user: User | null
  open: boolean
}

interface Emits {
  (e: 'close'): void
  (e: 'save', userId: string, roles: string[]): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Available roles in the system
const availableRoles = [
  { id: 'admin', name: 'Admin', description: 'Full system access' },
  { id: 'user_manager', name: 'User Manager', description: 'Can manage users and roles' },
  { id: 'auditor', name: 'Auditor', description: 'Can view audit logs' },
  { id: 'user', name: 'User', description: 'Basic user access' },
]

const selectedRoles = ref<string[]>([])

watch(
  () => props.user,
  (newUser) => {
    if (newUser) {
      selectedRoles.value = [...newUser.roles]
    } else {
      selectedRoles.value = []
    }
  },
  { immediate: true }
)

const toggleRole = (roleId: string) => {
  const index = selectedRoles.value.indexOf(roleId)
  if (index > -1) {
    selectedRoles.value.splice(index, 1)
  } else {
    selectedRoles.value.push(roleId)
  }
}

const isRoleSelected = (roleId: string): boolean => {
  return selectedRoles.value.includes(roleId)
}

const handleSave = () => {
  if (props.user) {
    emit('save', props.user.id, selectedRoles.value)
  }
}

const handleClose = () => {
  emit('close')
}
</script>

<template>
  <dialog class="modal" :class="{ 'modal-open': open }">
    <div class="modal-box">
      <h3 class="font-bold text-lg mb-4">Edit User Roles</h3>
      
      <div v-if="user" class="mb-6">
        <div class="text-sm text-base-content/70 mb-1">User</div>
        <div class="font-medium">{{ user.name }}</div>
        <div class="text-sm text-base-content/60">{{ user.email }}</div>
      </div>

      <div class="space-y-3">
        <div class="text-sm font-medium mb-2">Assign Roles</div>
        <div
          v-for="role in availableRoles"
          :key="role.id"
          class="form-control"
        >
          <label class="label cursor-pointer justify-start gap-3">
            <input
              type="checkbox"
              :checked="isRoleSelected(role.id)"
              @change="toggleRole(role.id)"
              class="checkbox checkbox-primary"
            />
            <div class="flex-1">
              <div class="font-medium">{{ role.name }}</div>
              <div class="text-sm text-base-content/60">{{ role.description }}</div>
            </div>
          </label>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-ghost" @click="handleClose">
          Cancel
        </button>
        <button
          class="btn btn-primary"
          @click="handleSave"
          :disabled="!user"
        >
          Save Changes
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @submit.prevent="handleClose">
      <button type="submit">close</button>
    </form>
  </dialog>
</template>
