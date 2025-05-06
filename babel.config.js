module.exports = {
    presets: [
      '@babel/preset-env', // Transpile ES6+ to backwards compatible JavaScript
      '@babel/preset-react' // Add support for JSX
    ],
    plugins: [
      '@babel/plugin-transform-runtime', // Reduces the size of the output by deduplicating helper functions
      '@babel/plugin-syntax-dynamic-import', // Enables the parsing of dynamic imports
      ['@babel/plugin-proposal-class-properties', { "loose": true }], // Support for class properties
      '@babel/plugin-transform-modules-commonjs' // Transforms ES modules to CommonJS
    ]
  };