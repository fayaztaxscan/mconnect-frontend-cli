<!-- src/components/ui/ToastHost.vue -->
<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <div
      v-for="t in toasts"
      :key="t.id"
      class="w-80 rounded-lg shadow-lg px-4 py-3 text-white"
      :class="{
        'bg-green-600': t.type === 'success',
        'bg-red-600':   t.type === 'error',
        'bg-slate-700': t.type !== 'success' && t.type !== 'error'
      }"
      role="status" aria-live="polite"
    >
      <div class="flex items-start justify-between gap-3">
        <div class="flex-1">
          <p v-if="t.title" class="font-semibold">{{ t.title }}</p>
          <p class="text-sm">{{ t.message }}</p>
        </div>
        <button class="opacity-80 hover:opacity-100" @click="remove(t.id)" aria-label="Dismiss">✕</button>
      </div>
      <button
        v-if="t.actionLabel && t.onAction"
        class="mt-2 text-xs underline"
        @click="() => { try { t.onAction() } finally { remove(t.id) } }"
      >
        {{ t.actionLabel }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { useToast } from '@/composables/useToast'
const { toasts, remove } = useToast()
</script>
