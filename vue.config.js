// vue.config.js
const path = require('path');

module.exports = {
  transpileDependencies: [],

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src')
      }
    }
  },

  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',  // your backend server
        changeOrigin: true,
        logLevel: 'debug',               // optional: shows proxy logs in console
        pathRewrite: { '^/api': '/api' } // not strictly necessary here, but explicit
      }
    }
  }
};
