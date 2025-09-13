<template>
  <div class="p-6 max-w-3xl">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEdit ? 'Edit Brand' : 'Create Brand' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-6">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Name</label>
          <input v-model="form.name" class="w-full border rounded px-3 py-2" />
        </div>
        <div class="sm:row-span-2">
          <label class="block text-sm mb-1">Logo</label>

          <!-- Dropzone / picker -->
          <div
            class="border border-dashed rounded p-4 text-center bg-white hover:bg-slate-50 cursor-pointer"
            @click="pickFile"
            @dragover.prevent
            @drop.prevent="onDrop"
          >
            <div v-if="previewUrl || form.image_url" class="flex items-center gap-4">
              <img :src="previewFull" alt="Logo preview" class="h-16 w-auto rounded object-contain border" />
              <div class="text-left">
                <div class="text-sm text-slate-700">Click to replace</div>
                <div class="text-xs text-slate-500">PNG/JPG up to 2 MB</div>
              </div>
            </div>
            <div v-else class="text-slate-600">
              <div class="font-medium">Drag an image here, or click to upload</div>
              <div class="text-xs text-slate-500 mt-1">PNG/JPG up to 2 MB</div>
            </div>
            <input
              ref="fileInput"
              type="file"
              class="hidden"
              accept="image/*"
              capture="environment"
              @change="onFileChange"
            />
          </div>

          <div class="mt-2 flex items-center gap-2 text-xs text-slate-500">
            <span>Or paste a link:</span>
            <input
              v-model="form.image_url"
              placeholder="https://example.com/logo.png"
              class="flex-1 border rounded px-2 py-1"
            />
          </div>

          <div v-if="uploading" class="text-xs text-slate-600 mt-1">Uploading…</div>
          <div v-if="error" class="text-xs text-red-600 mt-1">{{ error }}</div>
        </div>
      </div>

      <div>
        <label class="block text-sm mb-1">Description</label>
        <textarea v-model="form.description" rows="3" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div class="flex items-center gap-2">
        <input id="active" type="checkbox" v-model="form.active" />
        <label for="active">Active</label>
      </div>

      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-60">
          {{ saving ? (isEdit ? 'Updating…' : 'Creating…') : (isEdit ? 'Update' : 'Create') }}
        </button>
        <router-link :to="{ name: 'BrandsList' }" class="px-4 py-2 border rounded">Cancel</router-link>
        <span v-if="errorSubmit" class="text-red-600 text-sm">{{ errorSubmit }}</span>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, watch, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getBrand, createBrand, updateBrand } from '@/services/brandsApi'
import { uploadBrandLogo } from '@/services/uploads'
import { resolveImageUrl } from '@/utils/imageUrl'

const route = useRoute()
const router = useRouter()

const isEdit      = computed(() => Boolean(route.params.id))
const uploading   = ref(false)
const saving      = ref(false)
const error       = ref('')
const errorSubmit = ref('')
const fileInput   = ref(null)
const previewUrl  = ref('')

const form = reactive({
  name: '',
  description: '',
  image_url: '',
  active: true
})

const previewFull = computed(() => {
  return previewUrl.value
    ? previewUrl.value
    : (form.image_url ? resolveImageUrl(form.image_url) : '')
})

async function load(id) {
  if (!id) return
  try {
    const data = await getBrand(id)
    form.name        = data.name ?? ''
    form.description = data.description ?? ''
    form.image_url   = data.image_url ?? ''
    form.active      = data.active !== 0 && data.active !== false
  } catch (e) {
    error.value = e?.response?.data?.error || 'Failed to load brand.'
  }
}

onMounted(() => load(route.params.id))
watch(() => route.params.id, (id) => { previewUrl.value = ''; load(id) })

function pickFile() {
  fileInput.value?.click()
}

async function onFileChange(e) {
  const file = e.target.files?.[0]
  if (file) await handleUpload(file)
}

async function onDrop(e) {
  const file = e.dataTransfer?.files?.[0]
  if (file) await handleUpload(file)
}

async function handleUpload(file) {
  error.value = ''
  // Guard: type & size (<= 2MB, image only)
  if (!/^image\/(png|jpe?g)$/i.test(file.type) || file.size > 2 * 1024 * 1024) {
    error.value = 'Please upload a PNG/JPG up to 2 MB.'
    return
  }

  // instant local preview
  previewUrl.value = URL.createObjectURL(file)

  try {
    uploading.value = true
    const { url, key } = await uploadBrandLogo(file)
    // Save relative key in DB so it works across environments/CDN
    form.image_url = key                      // e.g. "brands/1694600000_logo.png"
    // Show absolute URL for preview
    previewUrl.value = url                    // e.g. "http://localhost:3000/uploads/brands/..."
  } catch (e) {
    error.value = e?.response?.data?.error || 'Upload failed. Try a smaller PNG/JPG (≤2 MB).'
    previewUrl.value = ''
  } finally {
    uploading.value = false
  }
}


async function handleSubmit() {
  try {
    saving.value = true
    errorSubmit.value = ''
    if (isEdit.value) {
      await updateBrand(route.params.id, { ...form })
    } else {
      await createBrand({ ...form })
    }
    router.push({ name: 'BrandsList' })
  } catch (e) {
    errorSubmit.value = e?.response?.data?.error || 'Failed to save brand.'
  } finally {
    saving.value = false
  }
}
</script>
