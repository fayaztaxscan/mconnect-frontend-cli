// src/components/forms/SalesForm.vue
<template>
  <div class="p-4 max-w-md mx-auto">
    <h2 class="text-2xl font-semibold mb-4">New Sales Entry</h2>
    <form @submit.prevent="onSubmit" class="flex flex-col gap-4">
      <input
        v-model.number="sale.userId"
        type="number"
        placeholder="User ID"
        class="border border-gray-300 rounded p-2"
        required
      />
      <input
        v-model.number="sale.productId"
        type="number"
        placeholder="Product ID"
        class="border border-gray-300 rounded p-2"
        required
      />
      <input
        v-model.number="sale.quantity"
        type="number"
        placeholder="Quantity"
        class="border border-gray-300 rounded p-2"
        required
      />
      <input
        v-model.number="sale.amount"
        type="number"
        step="0.01"
        placeholder="Amount"
        class="border border-gray-300 rounded p-2"
        required
      />
      <input
        v-model="sale.soldAt"
        type="datetime-local"
        class="border border-gray-300 rounded p-2"
        required
      />
      <button type="submit" class="px-4 py-2 bg-green-600 text-white rounded">
        Save
      </button>
    </form>
  </div>
</template>

<script setup>
import { reactive } from 'vue';
import axios from 'axios';

const sale = reactive({
  userId: null,
  productId: null,
  quantity: null,
  amount: null,
  soldAt: ''
});

async function onSubmit() {
  await axios.post('/api/sales-entries', sale);
  alert('Sales entry created.');
  // reset form
  sale.userId = null;
  sale.productId = null;
  sale.quantity = null;
  sale.amount = null;
  sale.soldAt = '';
}
</script>

<style scoped></style>