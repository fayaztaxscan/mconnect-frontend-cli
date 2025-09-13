<template>
  <div class="p-6 max-w-3xl">
    <h2 class="text-xl font-semibold mb-4">
      {{ isEdit ? 'Edit Dealer' : 'Add Dealer' }}
    </h2>

    <form @submit.prevent="handleSubmit" class="space-y-4">
      <div class="grid sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm mb-1">Dealer Name</label>
          <input v-model="form.name" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Dealer Code</label>
          <input v-model="form.dealer_code" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Email</label>
          <input v-model="form.email" type="email" class="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label class="block text-sm mb-1">Phone</label>
          <input v-model="form.primary_contact_phone" class="w-full border rounded px-3 py-2" />
        </div>
      </div>

      <div>
        <label class="block text-sm mb-1">Address</label>
        <textarea v-model="form.address" rows="3" class="w-full border rounded px-3 py-2"></textarea>
      </div>

      <div class="flex gap-3">
        <button type="submit" class="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">
          {{ isEdit ? 'Update' : 'Create' }}
        </button>
        <router-link :to="{ name: 'DealersList' }" class="px-4 py-2 border rounded">Cancel</router-link>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getDealer, createDealer, updateDealer } from '@/services/dealers'

const route = useRoute()
const router = useRouter()

const isEdit = computed(() => Boolean(route.params.id))

// ✅ single source of truth for v-model
const form = reactive({
  name: '',
  dealer_code: '',
  email: '',
  primary_contact_phone: '',
  address: ''
})

async function load(id) {
  if (!id) return
  const data = await getDealer(id)
  // ✅ ensure fields exist before assign; fallback empty
  form.name = data.name ?? ''
  form.dealer_code = data.dealer_code ?? ''
  form.email = data.email ?? ''
  form.primary_contact_phone = data.primary_contact_phone ?? ''
  form.address = data.address ?? ''
}

onMounted(() => load(route.params.id))

// ✅ if you navigate from /dealers/1/edit → /dealers/2/edit reusing same component
watch(() => route.params.id, (id) => load(id))

async function handleSubmit() {
  if (isEdit.value) {
    await updateDealer(route.params.id, { ...form })
  } else {
    await createDealer({ ...form })
  }
  router.push({ name: 'DealersList' })
}
</script>
