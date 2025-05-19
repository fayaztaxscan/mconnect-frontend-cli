<template>
  <div class="flex min-h-screen">
    <SideMenu />
    <main class="flex-1 bg-gray-100">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import SideMenu from './SideMenu.vue';
</script>
