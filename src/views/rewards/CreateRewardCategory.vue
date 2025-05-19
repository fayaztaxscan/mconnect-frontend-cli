<!-- src/views/rewards/CreateRewardCategory.vue -->
<template>
  <div class="p-4 max-w-lg">
    <h1 class="text-2xl font-semibold mb-4">
      {{ isEdit ? 'Edit' : 'New' }} Reward Category
    </h1>
    <form @submit.prevent="submit">
      <div class="mb-4">
        <label class="block mb-1">Name</label>
        <input v-model="form.name" required class="w-full border px-3 py-2" />
      </div>
      <div class="mb-4">
        <label class="block mb-1">Description</label>
        <textarea v-model="form.description" class="w-full border px-3 py-2"></textarea>
      </div>
      <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded">
        {{ isEdit ? 'Update' : 'Create' }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  createRewardCategory,
  updateRewardCategory,
  getRewardCategories
} from '@/services/rewardCategories';

const route  = useRoute();
const router = useRouter();
const id     = route.params.id;
const isEdit = Boolean(id);

const form = ref({ name: '', description: '' });

onMounted(async () => {
  if (isEdit) {
    // fetch single category
    const all = (await getRewardCategories()).data;
    const cat = all.find(c => c.id === +id);
    if (cat) form.value = { name: cat.name, description: cat.description };
  }
});

async function submit() {
  if (isEdit) {
    await updateRewardCategory(id, form.value);
  } else {
    await createRewardCategory(form.value);
  }
  router.push({ name: 'ManageRewardCategories' });
}
</script>
