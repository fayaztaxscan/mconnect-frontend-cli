<template>
  <div id="app">
    <!-- Primary layout container -->
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'App',
};
</script>

/* vue.config.js */
const path = require('path');

module.exports = {
  transpileDependencies: true,
  devServer: {
    port: 8080,
  },
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  }
};