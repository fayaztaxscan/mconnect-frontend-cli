// src/components/forms/UploadWizard.vue
<template>
  <div class="p-4 max-w-lg mx-auto">
    <h2 class="text-2xl font-semibold mb-4">Bulk Sales Upload</h2>
    <form @submit.prevent="submit" class="flex flex-col gap-4">
      <input
        type="file"
        @change="onFileChange"
        accept=".csv,.xlsx"
        class="block w-full text-sm text-gray-700 border border-gray-300 rounded p-2"
      />
      <button
        :disabled="!file"
        class="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
      >
        Upload
      </button>
    </form>

    <div v-if="job" class="mt-6 bg-gray-50 p-4 rounded shadow">
      <p class="font-medium">Status: <span>{{ job.status }}</span></p>
      <p v-if="job.totalRows !== null" class="mt-1 text-sm text-gray-600">
        Rows: {{ job.totalRows }}, Success: {{ job.successCount }}, Failures: {{ job.failureCount }}
      </p>

      <ul v-if="errors.length" class="mt-4 list-disc list-inside text-red-600">
        <li v-for="err in errors" :key="err.lineNumber">
          Row {{ err.lineNumber }}: {{ err.errorMessage }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const file = ref(null);
const job = ref(null);
const errors = ref([]);

function onFileChange(event) {
  file.value = event.target.files[0] || null;
}

async function submit() {
  const formData = new FormData();
  formData.append('file', file.value);
  const { data } = await axios.post('/api/upload-jobs', formData);
  job.value = data;
  pollStatus();
}

function pollStatus() {
  const interval = setInterval(async () => {
    const { data } = await axios.get(`/api/upload-jobs/${job.value.jobId}`);
    job.value = data;
    if (['COMPLETED', 'FAILED'].includes(data.status)) {
      clearInterval(interval);
      if (data.failureCount > 0) {
        const { data: errs } = await axios.get(`/api/upload-jobs/${job.value.jobId}/errors`);
        errors.value = errs;
      }
    }
  }, 2000);
}
</script>

<style scoped>
/* Add any component-specific styles here */
</style>