// src/components/ui/RewardDashboard.vue
<template>
  <div class="p-4 max-w-xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Reward Dashboard</h2>
    <div
      v-for="batch in batches"
      :key="batch.batchId"
      class="mb-4 p-4 border rounded shadow-sm"
    >
      <div class="flex justify-between">
        <div>
          <p><strong>Points:</strong> {{ batch.points }}</p>
          <p><strong>Awarded At:</strong> {{ formatDate(batch.awardedAt) }}</p>
        </div>
        <div class="text-right">
          <p><strong>Expiry:</strong> {{ formatDate(batch.expiryDate) }}</p>
          <button
            @click="promptOverride(batch.batchId)"
            class="mt-2 px-2 py-1 bg-yellow-500 text-white rounded text-sm"
          >
            Override
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

const userId = ref(null);
const batches = ref([]);

onMounted(async () => {
  // assume useAuth or another global gives current user
  const me = await axios.get('/api/users/me');
  userId.value = me.data.id;
  await fetchRewards();
});

async function fetchRewards() {
  const { data } = await axios.get(`/api/users/${userId.value}/rewards`);
  batches.value = data.batches;
}

function promptOverride(batchId) {
  const days = parseInt(prompt('Enter new expiry days:', '90'), 10);
  if (!days) return;
  axios
    .put(`/api/reward-batches/${batchId}/expiry-override`, { overrideDays: days })
    .then(fetchRewards);
}

function formatDate(dt) {
  return new Date(dt).toLocaleString();
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>