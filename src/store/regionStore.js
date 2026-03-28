// src/store/regionStore.js
import { defineStore } from 'pinia'

export const useRegionStore = defineStore('region', {
  state: () => ({
    selectedRegionId: null,
    selectedRegion: null,
  }),
  actions: {
    setRegion(region) {
      this.selectedRegionId = region?.id ?? null
      this.selectedRegion = region ?? null
    },
    clearRegion() {
      this.selectedRegionId = null
      this.selectedRegion = null
    }
  }
})
