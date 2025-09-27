<template>
  <div id="app">
    <router-view />
    <ToastHost />
  </div>
</template>

<script>
import ToastHost from '@/components/ui/ToastHost.vue'

export default {
  name: 'App',
  components: { ToastHost }
}
</script>
