<template>
  <div class="fixed inset-0 bg-black/30 flex items-center justify-center z-40">
    <div class="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
      <div class="px-4 sm:px-6 py-4 border-b flex items-center justify-between">
        <h3 class="text-lg font-semibold">
          {{ isEdit ? 'Edit Category' : 'New Category' }}
        </h3>
        <button @click="$emit('close')" class="text-slate-500 hover:text-slate-700">✕</button>
      </div>

      <form @submit.prevent="onSubmit" class="p-4 sm:p-6 space-y-4">
        <!-- Division -->
        <div>
          <label class="block text-sm font-medium mb-1">Division <span class="text-red-600">*</span></label>
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

        <!-- Parent (root-only options) -->
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
          <label class="block text-sm font-medium mb-1">Name <span class="text-red-600">*</span></label>
          <input v-model.trim="form.name" class="w-full border rounded px-3 py-2" required maxlength="150" />
        </div>

        <!-- Description -->
        <div>
          <label class="block text-sm font-medium mb-1">Description</label>
          <textarea v-model.trim="form.description" class="w-full border rounded px-3 py-2" rows="3"></textarea>
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

        <div class="pt-2 flex items-center justify-end gap-2">
          <button type="button" @click="$emit('close')" class="px-4 py-2 border rounded">
            Cancel
          </button>
          <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded">
            {{ isEdit ? 'Save Changes' : 'Create' }}
          </button>
        </div>

        <p v-if="error" class="text-red-600 text-sm">{{ error }}</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref, computed, onMounted, watch } from 'vue'
import { useCategoriesStore } from '@/stores/categories'
import { listCategories, getCategory } from '@/services/categories'

const props = defineProps({
  initial: { type: Object, default: null },
  divisions: { type: Array, default: () => [] },
  // passed by the list page; we’ll use it only as fallback
  parentOptions: { type: Array, default: () => [] },
})
const emit = defineEmits(['close', 'saved'])

const store = useCategoriesStore()
const error = ref(null)

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
  // Exclude the current record while editing
  const excludeId = form.id
  const list = parentChoices.value?.length ? parentChoices.value : props.parentOptions
  return (list || []).filter(c => String(c.id) !== String(excludeId))
})

// Auto-sync division when a parent is selected
async function onParentChange () {
  const pid = form.parent_id
  if (pid == null || pid === '') return

  // Try to resolve parent’s division from the local options first
  const local = effectiveParentChoices.value.find(p => String(p.id) === String(pid))
  let parentDivisionId = local?.division_id

  // Fallback: fetch single category if local option has no division_id
  if (parentDivisionId == null) {
    try {
      const res = await getCategory(pid)   // backend returns { success, data: {...} }
      const row = res?.data || res
      parentDivisionId = row?.division_id
    } catch (e) {
      // if this fails, just bail; backend will still enforce the rule on submit
      console.warn('[form] fetch parent for division failed', e?.response?.data || e)
      return
    }
  }

  // If parent’s division differs, switch the form’s division and refresh root choices
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
    // Fetch ONLY root categories (parent_id IS NULL) within this division
    const res = await listCategories({
      division_id: divisionId,
      parent_id: 'null',       // controller interprets 'null' → IS NULL
      includeDeleted: false,
      active: 'true',
      limit: 1000,
      page: 1,
    })
    const rows =
      Array.isArray(res?.data)        ? res.data :
      Array.isArray(res?.items)       ? res.items :
      Array.isArray(res?.rows)        ? res.rows :
      Array.isArray(res)              ? res : []
    parentChoices.value = rows.map(r => ({ id: r.id, name: r.name, division_id: r.division_id }))
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Failed to load parent choices'
  }
}

async function onSubmit() {
  error.value = null
  try {
    const payload = {
      division_id: Number(form.division_id),
      parent_id: form.parent_id ?? null, // null means root
      name: form.name,
      description: form.description || null,
      image_url: form.image_url || null,
      active: !!form.active,
    }
    if (isEdit.value) {
      await store.update(form.id, payload)
    } else {
      await store.create(payload)
    }
    emit('saved')
  } catch (e) {
    error.value = e?.response?.data?.error || e.message || 'Save failed'
  }
}

onMounted(loadParentChoices)

// If division changes while the form is open, refresh root choices
watch(() => form.division_id, () => { form.parent_id = null; loadParentChoices() })
</script>
