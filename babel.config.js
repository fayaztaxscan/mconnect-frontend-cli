// babel.config.js
module.exports = {
  presets: [
    // Ensure polyfills for older browsers and proper parsing of modern syntax
    ['@vue/cli-plugin-babel/preset', { useBuiltIns: 'usage', corejs: 3 }],
  ],
  plugins: [
    // Extra safety for modern operators used inside some node_modules (e.g., birpc)
    '@babel/plugin-proposal-optional-chaining',
    '@babel/plugin-proposal-nullish-coalescing-operator',
  ],
};
