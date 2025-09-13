<template>
  <div class="space-y-2">
    <div class="flex gap-2">
      <button type="button"
              class="px-3 py-1 rounded border"
              :class="mode==='upload' ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-300'"
              @click="mode='upload'">Upload</button>
      <button type="button"
              class="px-3 py-1 rounded border"
              :class="mode==='url' ? 'bg-indigo-50 border-indigo-300' : 'bg-white border-gray-300'"
              @click="mode='url'">Use URL</button>
    </div>

    <div v-if="mode==='upload'" class="space-y-2">
      <input type="file" accept="image/*" @change="onFile" />
      <div v-if="preview" class="mt-2">
        <img :src="preview" alt="Preview" class="h-24 rounded border" />
      </div>
    </div>

    <div v-else class="space-y-2">
      <input v-model="url" type="text" placeholder="https://…"
             class="w-full px-3 py-2 border rounded" />
      <div v-if="url" class="mt-2">
        <img :src="url" alt="Preview" class="h-24 rounded border" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const emit = defineEmits(['uploaded', 'update:url'])
const props = defineProps({ modelValue: String })

const mode = ref('upload')
const preview = ref(null)
const url = ref(props.modelValue || '')

watch(() => props.modelValue, v => { url.value = v || '' })

function onFile(e) {
  const [file] = e.target.files || []
  if (!file) return
  preview.value = URL.createObjectURL(file)
  emit('uploaded', file) // parent will call API and then set image_url
}

watch(url, v => emit('update:url', v))
</script>
