<template>
  <div class="p-4">
    <h1 class="text-xl font-bold mb-4">Fulfill Reward Claims</h1>

    <!-- Filter -->
    <div class="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
      <label class="font-medium">Filter by Status:</label>
      <select v-model="filterStatus" class="border rounded px-3 py-2">
        <option value="">All</option>
        <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
      </select>
    </div>

    <!-- Fulfillment Cards -->
    <div v-if="filteredFulfillments.length === 0" class="text-gray-500">No claims found.</div>
    <div class="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
      <div v-for="f in filteredFulfillments" :key="f.id" class="bg-white p-4 shadow rounded-lg">
        <h3 class="font-semibold text-lg mb-1">Claim #{{ f.reward_claim_id }}</h3>
        <p>Status: <span class="font-medium capitalize">{{ f.status }}</span></p>
        <p v-if="f.assigned_to">Assigned To: {{ f.assignedToName || 'Unknown' }}</p>

        <div class="mt-3 space-y-2">
          <button v-if="!f.assigned_to" @click="assignToMe(f)" class="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-500 w-full">Assign to Me</button>
          <button @click="openEditModal(f)" class="bg-gray-100 border px-3 py-1 rounded w-full">Update Status</button>
        </div>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal.open" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 class="text-lg font-bold mb-4">Update Fulfillment #{{ modal.data.reward_claim_id }}</h2>

        <label class="block text-sm font-medium mb-1">Status</label>
        <select v-model="modal.status" class="w-full mb-3 border px-3 py-2 rounded">
          <option v-for="s in statuses" :key="s" :value="s">{{ s }}</option>
        </select>

        <label class="block text-sm font-medium mb-1">Shipping Provider</label>
        <input v-model="modal.shipping_provider" class="w-full mb-3 border px-3 py-2 rounded" />

        <label class="block text-sm font-medium mb-1">Tracking Number</label>
        <input v-model="modal.tracking_number" class="w-full mb-3 border px-3 py-2 rounded" />

        <label class="block text-sm font-medium mb-1">Remarks</label>
        <textarea v-model="modal.remarks" rows="3" class="w-full mb-4 border px-3 py-2 rounded"></textarea>

        <div class="flex justify-between">
          <button @click="modal.open = false" class="text-gray-600 hover:underline">Cancel</button>
          <button @click="submitUpdate" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-500">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from '@/services/api';


export default {
  name: 'FulfillClaims',
  data() {
    return {
      fulfillments: [],
      statuses: ['pending', 'in_progress', 'shipped', 'delivered', 'rejected'],
      filterStatus: '',
      currentUserId: null,
      modal: {
        open: false,
        data: {},
        status: '',
        shipping_provider: '',
        tracking_number: '',
        remarks: ''
      }
    };
  },
  computed: {
    filteredFulfillments() {
      return this.fulfillments.filter(f => !this.filterStatus || f.status === this.filterStatus);
    }
  },
  async mounted() {
    await this.fetchCurrentUser();
    await this.fetchFulfillments();
  },
  methods: {
    async fetchCurrentUser() {
      const res = await axios.get('/auth/me');
      this.currentUserId = res.data.id;
    },
    async fetchFulfillments() {
      const res = await axios.get('/reward-fulfillments');
      this.fulfillments = res.data;
    },
    async assignToMe(f) {
      await axios.patch(`/reward-fulfillments/${f.reward_claim_id}`, {
        assignedTo: this.currentUserId,
        updatedBy: this.currentUserId,
        status: 'in_progress'
      });
      await this.fetchFulfillments();
    },
    openEditModal(f) {
      this.modal.open = true;
      this.modal.data = f;
      this.modal.status = f.status;
      this.modal.shipping_provider = f.shipping_provider || '';
      this.modal.tracking_number = f.tracking_number || '';
      this.modal.remarks = f.remarks || '';
    },
    async submitUpdate() {
      await axios.patch(`/reward-fulfillments/${this.modal.data.reward_claim_id}`, {
        status: this.modal.status,
        shippingProvider: this.modal.shipping_provider,
        trackingNumber: this.modal.tracking_number,
        remarks: this.modal.remarks,
        assignedTo: this.modal.data.assigned_to || this.currentUserId,
        updatedBy: this.currentUserId
      });
      this.modal.open = false;
      await this.fetchFulfillments();
    }
  }
};
</script>

<style scoped>
/* Optional styles for modal and responsiveness */
</style>
