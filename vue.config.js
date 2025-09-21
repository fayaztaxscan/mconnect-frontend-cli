// vue.config.js
const path = require('path');

module.exports = {
  // Force Babel transpilation for modern ESM packages pulled in by Pinia/devtools
  transpileDependencies: [
    'pinia',
    '@vue/devtools-api',
    '@vue/devtools-kit',
    'birpc',
  ],

  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
      },
      // allow resolving .mjs modules cleanly
      extensions: ['.mjs', '.js', '.vue', '.json'],
    },

    module: {
      rules: [
        // Ensure optional-chaining/nullish-coalescing inside these node_modules are transpiled
        {
          test: /\.m?js$/,
          include: [
            /node_modules[\\/]pinia/,
            /node_modules[\\/]@vue[\\/]devtools-api/,
            /node_modules[\\/]@vue[\\/]devtools-kit/,
            /node_modules[\\/]birpc/,
          ],
          use: {
            loader: 'babel-loader',
            options: {
              // Vue CLI preset already included by default; keep it explicit
              presets: [['@vue/cli-plugin-babel/preset', { useBuiltIns: 'usage', corejs: 3 }]],
              // Plugins to be extra-safe on older CLI setups
              plugins: [
                '@babel/plugin-proposal-optional-chaining',
                '@babel/plugin-proposal-nullish-coalescing-operator',
              ],
              cacheDirectory: true,
            },
          },
        },
      ],
    },
  },

  devServer: {
    proxy: {
      '^/api': {
        target: 'http://localhost:3000',   // your backend server
        changeOrigin: true,
        logLevel: 'debug',
        pathRewrite: { '^/api': '/api' },
      },
    },
  },

  // nice to have
  productionSourceMap: false,
};
