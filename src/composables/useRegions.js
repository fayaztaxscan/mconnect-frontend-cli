// src/composables/useRegions.js
import { ref } from 'vue'
import api from '@/services/api'

// Cache regions so we only fetch once per session
let _regions = null

export function useRegions() {
  const regions = ref([])
  const loading = ref(false)

  async function fetchRegions() {
    if (_regions) {
      regions.value = _regions
      return
    }
    loading.value = true
    try {
      const res = await api.get('/regions')
      const data = res.data?.data ?? res.data
      _regions = Array.isArray(data) ? data : []
      regions.value = _regions
    } catch (e) {
      console.error('Failed to load regions', e)
    } finally {
      loading.value = false
    }
  }

  // formatPrice(1250, 'AED', 'AED') → 'AED 1,250.00'
  function formatPrice(amount, currencyCode, symbol) {
    if (amount == null) return 'N/A'
    const num = Number(amount).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
    return symbol ? `${symbol} ${num}`
         : currencyCode ? `${currencyCode} ${num}`
         : num
  }

  return { regions, loading, fetchRegions, formatPrice }
}
