<template>
  <!-- Overlay -->
  <div
    class="fixed inset-0 z-[9999] bg-black/30 overflow-y-auto"
    @click.self="$emit('close')"
  >
    <div class="min-h-screen flex items-start justify-center p-4 sm:p-6">
      <!-- Modal -->
      <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden max-h-[90vh] flex flex-col">
        <!-- Header -->
        <div class="px-4 sm:px-6 py-4 border-b flex items-center justify-between shrink-0">
          <h3 class="text-lg font-semibold">
            {{ isEdit ? 'Edit Category' : 'New Category' }}
          </h3>
          <button @click="$emit('close')" class="text-slate-500 hover:text-slate-700">✕</button>
        </div>

        <form @submit.prevent="onSubmit" class="flex flex-col min-h-0">
          <!-- Body (scrollable) -->
          <div class="p-4 sm:p-6 space-y-4 overflow-y-auto min-h-0">
            <!-- Division -->
            <div>
              <label class="block text-sm font-medium mb-1">
                Division <span class="text-red-600">*</span>
              </label>
              <select
                v-model.number="form.division_id"
                :disabled="form.parent_id !== null"
                @change="loadParentChoices"
                class="w-full border rounded px-3 py-2"
                required
              >
                <option v-for="d in divisions" :key="d.id" :value="d.id">
                  {{ d.name || d.division_name || ('#' + d.id) }}
                </option>
              </select>
            </div>

            <!-- Parent -->
            <div>
              <label class="block text-sm font-medium mb-1">Parent</label>
              <select v-model="form.parent_id" @change="onParentChange" class="w-full border rounded px-3 py-2">
                <option :value="null">— None (Root) —</option>
                <option v-for="c in effectiveParentChoices" :key="c.id" :value="c.id">
                  {{ c.name }}
                </option>
              </select>
              <p class="text-xs text-slate-500 mt-1">
                Only root categories (no parent) in the selected division are listed.
              </p>
            </div>

            <!-- Name -->
            <div>
              <label class="block text-sm font-medium mb-1">
                Name <span class="text-red-600">*</span>
              </label>

              <input
                ref="nameInput"
                v-model.trim="form.name"
                class="w-full border rounded px-3 py-2"
                required
                maxlength="150"
              />

              <p class="text-xs text-slate-500 mt-1">
                Category name must be unique within the selected division.
              </p>
            </div>

            <!-- Description -->
            <div>
              <label class="block text-sm font-medium mb-1">Description</label>
              <textarea v-model.trim="form.description" class="w-full border rounded px-3 py-2" rows="3" />
            </div>

            <!-- Image URL -->
            <div>
              <label class="block text-sm font-medium mb-1">Image URL</label>
              <input v-model.trim="form.image_url" class="w-full border rounded px-3 py-2" />
            </div>

            <!-- Active -->
            <div class="flex items-center gap-2">
              <input id="active" type="checkbox" v-model="form.active" />
              <label for="active" class="text-sm">Active</label>
            </div>

            <!-- ✅ Custom Fields Editor -->
            <CategoryAttributeDefsEditor v-model="attributeDefs" />

            <div v-if="defsLoadError" class="text-sm text-red-600">{{ defsLoadError }}</div>
            <div v-if="defsSaveError" class="text-sm text-red-600">{{ defsSaveError }}</div>

            <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
          </div>

          <!-- Footer -->
          <div class="px-4 sm:px-6 py-4 border-t bg-white shrink-0 flex items-center justify-end gap-2">
            <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">
              Cancel
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-4 py-2 bg-indigo-600 text-white rounded disabled:opacity-60"
            >
              {{ saving ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save Changes' : 'Create') }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch, nextTick } from 'vue'
import api from '@/services/api'
import { useCategoriesStore } from '@/stores/categories'
import { listCategories, getCategory } from '@/services/categories'
import CategoryAttributeDefsEditor from './CategoryAttributeDefsEditor.vue'

const props = defineProps({
  initial: { type: Object, default: null },
  divisions: { type: Array, default: () => [] },
  parentOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'saved'])

const store = useCategoriesStore()

const error = ref(null)
const saving = ref(false)
const nameInput = ref(null)

const defsLoadError = ref('')
const defsSaveError = ref('')

// ✅ IMPORTANT: writable ref for v-model so "Add Field" works
const attributeDefs = ref([])

const isEdit = computed(() => !!props.initial?.id)

const form = reactive({
  id: props.initial?.id ?? null,
  division_id: Number(props.initial?.division_id ?? (props.divisions?.[0]?.id ?? '')),
  parent_id: props.initial?.parent_id ?? null,
  name: props.initial?.name ?? '',
  description: props.initial?.description ?? '',
  image_url: props.initial?.image_url ?? '',
  active: props.initial?.active ?? true,
})

// Root-only parent choices for the selected division
const parentChoices = ref([])

const effectiveParentChoices = computed(() => {
  const excludeId = form.id
  const list = parentChoices.value?.length ? parentChoices.value : props.parentOptions
  return (list || []).filter(c => String(c.id) !== String(excludeId))
})

async function onParentChange() {
  const pid = form.parent_id
  if (pid == null || pid === '') return

  const local = effectiveParentChoices.value.find(p => String(p.id) === String(pid))
  let parentDivisionId = local?.division_id

  if (parentDivisionId == null) {
    try {
      const res = await getCategory(pid)
      const row = res?.data || res
      parentDivisionId = row?.division_id
    } catch (e) {
      console.warn('[form] fetch parent for division failed', e?.response?.data || e)
      return
    }
  }

  if (parentDivisionId && Number(parentDivisionId) !== Number(form.division_id)) {
    form.division_id = Number(parentDivisionId)
    await loadParentChoices()
  }
}

async function loadParentChoices() {
  error.value = null
  parentChoices.value = []
  const divisionId = Number(form.division_id)
  if (!divisionId) return

  try {
    const res = await listCategories({
      division_id: divisionId,
      parent_id: 'null',
      includeDeleted: false,
      active: 'true',
      limit: 1000,
      page: 1,
    })

    const rows =
      Array.isArray(res?.data) ? res.data :
      Array.isArray(res?.items) ? res.items :
      Array.isArray(res?.rows) ? res.rows :
      Array.isArray(res) ? res : []

    parentChoices.value = rows.map(r => ({ id: r.id, name: r.name, division_id: r.division_id }))
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Failed to load parent choices'
  }
}

// ---- Custom fields: load + save -------------------------------------------

function normalizeDefsForApi(defs) {
  // editor emits rows that may contain __options_text; backend expects `options` array
  return (defs || []).map((d, i) => {
    const t = String(d.data_type || 'text')
    const options =
      Array.isArray(d.options) ? d.options :
      (typeof d.__options_text === 'string'
        ? d.__options_text.split('\n').map(x => x.trim()).filter(Boolean)
        : [])

    return {
      attr_key: String(d.attr_key || '').trim(),
      label: String(d.label || '').trim(),
      data_type: t,
      required: !!d.required,
      unit: d.unit ? String(d.unit).trim() : null,
      options: (t === 'select' || t === 'multiselect') ? options : [],
      sort_order: Number.isFinite(+d.sort_order) ? +d.sort_order : i,
      active: d.active !== false
    }
  })
}

async function loadAttributeDefs(categoryId) {
  defsLoadError.value = ''
  try {
    const res = await api.get(`/categories/${categoryId}/attribute-defs`)
    // support common response shapes
    const payload = res?.data?.data ?? res?.data
    attributeDefs.value = Array.isArray(payload) ? payload : []
  } catch (e) {
    defsLoadError.value = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to load custom fields'
    attributeDefs.value = []
  }
}

async function saveAttributeDefs(categoryId) {
  defsSaveError.value = ''

  const payload = normalizeDefsForApi(attributeDefs.value)

  // If no defs, still push empty list (so backend can clear old ones)
  try {
    await api.put(`/categories/${categoryId}/attribute-defs`, payload)
  } catch (e) {
    defsSaveError.value = e?.response?.data?.message || e?.response?.data?.error || e?.message || 'Failed to save custom fields'
    // IMPORTANT: do not block category save completely; but show error
    throw e
  }
}

// ---- Submit ---------------------------------------------------------------

async function onSubmit() {
  if (saving.value) return
  error.value = null
  defsSaveError.value = ''

  try {
    const payload = {
      division_id: Number(form.division_id),
      parent_id: form.parent_id ?? null,
      name: (form.name || '').trim(),
      description: form.description || null,
      image_url: form.image_url || null,
      active: !!form.active,
    }

    if (!payload.division_id) {
      error.value = 'Division is required'
      return
    }
    if (!payload.name) {
      error.value = 'Name is required'
      await nextTick()
      nameInput.value?.focus?.()
      return
    }

    saving.value = true

    if (isEdit.value) {
      // 1) save category
      await store.update(form.id, payload)
      // 2) save custom fields (bulk replace)
      await saveAttributeDefs(form.id)
    } else {
      // 1) create category
      const created = await store.create(payload)
      const newId = created?.id || created?.data?.id || created?.insertId
      if (!newId) {
        // fallback: if your store doesn't return created row
        throw new Error('Category created but could not determine new id (update store.create to return created row).')
      }
      form.id = Number(newId)

      // 2) save custom fields for the new category
      await saveAttributeDefs(form.id)
    }

    emit('saved')
  } catch (e) {
    const status = e?.response?.status
    const msg = e?.response?.data?.error || e?.response?.data?.message || e?.message || 'Save failed'

    // Duplicate category name in division
    if (status === 409) {
      error.value = msg || 'Category name already exists in this division.'
      await nextTick()
      nameInput.value?.focus?.()
      return
    }

    // If custom fields save failed, show that; otherwise show generic
    error.value = defsSaveError.value || msg
  } finally {
    saving.value = false
  }
}

// ---- lifecycle ------------------------------------------------------------

onMounted(async () => {
  await loadParentChoices()
  await nextTick()
  nameInput.value?.focus?.()

  // Edit mode: load existing custom fields
  if (isEdit.value && form.id) {
    await loadAttributeDefs(form.id)
  } else {
    attributeDefs.value = [] // create mode starts empty
  }
})

watch(
  () => form.division_id,
  () => {
    form.parent_id = null
    loadParentChoices()
  }
)
</script>
