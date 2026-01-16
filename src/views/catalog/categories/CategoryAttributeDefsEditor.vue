<template>
  <div class="border rounded-lg overflow-hidden bg-white">
    <!-- Header -->
    <div class="p-4 border-b">
      <div class="flex items-start justify-between gap-3">
        <div>
          <h4 class="font-semibold">Custom Fields</h4>
          <p class="text-xs text-slate-500">
            These fields will appear when creating a product in this category.
          </p>
        </div>

        <!-- Keep header button on wide screens (optional) -->
        <button type="button" @click="addRow" class="px-3 py-1.5 border rounded hidden sm:inline-flex">
          + Add Field
        </button>
      </div>
    </div>

    <!-- Body: scrollable list -->
    <div class="p-4">
      <div v-if="!modelValue?.length" class="text-sm text-slate-500 py-2">
        No custom fields yet.
      </div>

      <!-- Scroll container so header+footer stay visible -->
      <div
        v-if="modelValue?.length"
        class="space-y-3 max-h-[52vh] overflow-y-auto pr-1"
      >
        <div
          v-for="(row, idx) in modelValue"
          :key="row.__tmp_id"
          class="border rounded-lg p-3"
          :ref="el => setRowRef(el, row.__tmp_id)"
        >
          <div class="flex items-start justify-between gap-2">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1">
              <!-- Label -->
              <div>
                <label class="block text-xs font-medium mb-1">
                  Label <span class="text-red-600">*</span>
                </label>
                <input
                  :ref="el => setLabelRef(el, row.__tmp_id)"
                  v-model.trim="row.label"
                  @blur="autoKey(row)"
                  class="w-full border rounded px-3 py-2"
                  placeholder="e.g. Door Weight (kg)"
                />
              </div>

              <!-- Key -->
              <div>
                <label class="block text-xs font-medium mb-1">
                  Key <span class="text-red-600">*</span>
                  <span class="text-slate-400">(a_z, 0_9, _)</span>
                </label>
                <input
                  v-model.trim="row.attr_key"
                  class="w-full border rounded px-3 py-2 font-mono text-sm"
                  placeholder="e.g. door_weight_kg"
                />
                <p v-if="keyErrors[idx]" class="text-xs text-red-600 mt-1">
                  {{ keyErrors[idx] }}
                </p>
              </div>

              <!-- Type -->
              <div>
                <label class="block text-xs font-medium mb-1">
                  Type <span class="text-red-600">*</span>
                </label>
                <select v-model="row.data_type" class="w-full border rounded px-3 py-2">
                  <option value="text">Text</option>
                  <option value="number">Number</option>
                  <option value="bool">Yes/No</option>
                  <option value="date">Date</option>
                  <option value="select">Select (single)</option>
                  <option value="multiselect">Select (multiple)</option>
                </select>
              </div>

              <!-- Unit -->
              <div>
                <label class="block text-xs font-medium mb-1">Unit</label>
                <input
                  v-model.trim="row.unit"
                  class="w-full border rounded px-3 py-2"
                  placeholder="kg, mm, years…"
                />
              </div>

              <!-- Sort order -->
              <div>
                <label class="block text-xs font-medium mb-1">Sort Order</label>
                <input
                  v-model.number="row.sort_order"
                  type="number"
                  min="0"
                  class="w-full border rounded px-3 py-2"
                />
              </div>

              <!-- Flags -->
              <div class="flex items-center gap-4 pt-6">
                <label class="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="row.required" />
                  Required
                </label>

                <label class="inline-flex items-center gap-2 text-sm">
                  <input type="checkbox" v-model="row.active" />
                  Active
                </label>
              </div>
            </div>

            <button
              type="button"
              @click="removeRow(idx)"
              class="px-3 py-1.5 border rounded text-red-600"
            >
              Remove
            </button>
          </div>

          <!-- Options (only for select/multiselect) -->
          <div
            v-if="row.data_type === 'select' || row.data_type === 'multiselect'"
            class="mt-3"
          >
            <label class="block text-xs font-medium mb-1">
              Options <span class="text-red-600">*</span>
              <span class="text-slate-400">(one per line)</span>
            </label>
            <textarea
              v-model="row.__options_text"
              class="w-full border rounded px-3 py-2"
              rows="4"
              placeholder="Satin Silver&#10;Black&#10;Gold"
            />
            <p class="text-xs text-slate-500 mt-1">
              These will appear in the dropdown when creating/editing products.
            </p>
          </div>
        </div>
      </div>

      <p v-if="formError" class="text-sm text-red-600 mt-3">{{ formError }}</p>
    </div>

    <!-- Sticky Footer: always visible Add Field -->
    <div class="sticky bottom-0 bg-white border-t p-3 flex items-center justify-between">
      <p class="text-xs text-slate-500">
        Tip: Add as many fields as needed. Button stays here.
      </p>

      <button type="button" @click="addRow" class="px-4 py-2 border rounded bg-white">
        + Add Field
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, nextTick } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
})
const emit = defineEmits(['update:modelValue'])

const formError = ref(null)

// Refs to scroll/focus newly added row
const rowRefs = new Map()
const labelRefs = new Map()

function setRowRef(el, id) {
  if (el) rowRefs.set(id, el)
}
function setLabelRef(el, id) {
  if (el) labelRefs.set(id, el)
}

function tmpId() {
  return 'tmp_' + Math.random().toString(36).slice(2)
}

function toSnakeKey(label) {
  return String(label || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 60)
}

function normalizeOne(row) {
  const options = Array.isArray(row.options) ? row.options : []
  return {
    __tmp_id: row.__tmp_id || tmpId(),
    attr_key: row.attr_key || '',
    label: row.label || '',
    data_type: row.data_type || 'text',
    required: !!row.required,
    unit: row.unit || '',
    sort_order: Number.isFinite(+row.sort_order) ? +row.sort_order : 0,
    active: row.active !== false,
    options,
    __options_text: (options || []).join('\n'),
  }
}

// Avoid “self-trigger loop”: only emit if normalization actually changes something
watch(
  () => props.modelValue,
  (val) => {
    const next = (val || []).map(normalizeOne)
    const changed = JSON.stringify(next) !== JSON.stringify(val || [])
    if (changed) emit('update:modelValue', next)
  },
  { immediate: true, deep: true }
)

async function addRow() {
  const next = [...(props.modelValue || [])]
  const row = normalizeOne({
    attr_key: '',
    label: '',
    data_type: 'text',
    required: false,
    unit: '',
    sort_order: next.length,
    active: true,
    options: [],
  })
  next.push(row)
  emit('update:modelValue', next)

  // Scroll + focus new row
  await nextTick()
  const el = rowRefs.get(row.__tmp_id)
  el?.scrollIntoView?.({ behavior: 'smooth', block: 'start' })
  await nextTick()
  labelRefs.get(row.__tmp_id)?.focus?.()
}

function removeRow(idx) {
  const next = [...(props.modelValue || [])]
  next.splice(idx, 1)
  emit('update:modelValue', next)
}

function autoKey(row) {
  if (!row.attr_key && row.label) {
    row.attr_key = toSnakeKey(row.label)
  }
}

const keyErrors = computed(() => {
  const rows = props.modelValue || []
  const seen = new Map()
  const errs = rows.map(() => null)

  for (let i = 0; i < rows.length; i++) {
    const k = String(rows[i].attr_key || '').trim()
    if (!k) {
      errs[i] = 'Key is required'
      continue
    }
    if (!/^[a-z0-9_]+$/.test(k)) {
      errs[i] = 'Only a-z, 0-9 and underscore allowed'
      continue
    }
    if (k.length > 60) {
      errs[i] = 'Max length is 60'
      continue
    }

    const lk = k.toLowerCase()
    if (seen.has(lk)) {
      errs[i] = 'Duplicate key'
      errs[seen.get(lk)] = 'Duplicate key'
    } else {
      seen.set(lk, i)
    }

    const t = rows[i].data_type
    if (t === 'select' || t === 'multiselect') {
      const txt = String(rows[i].__options_text || '').trim()
      if (!txt) errs[i] = 'Options required for select/multiselect'
    }
  }

  return errs
})
</script>
