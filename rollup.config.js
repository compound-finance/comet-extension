// Rollup builds only the browser version using the Node.js build.

const resolve = require('@rollup/plugin-node-resolve').nodeResolve;
const commonjs = require('rollup-plugin-commonjs');
const { terser } = require('rollup-plugin-terser');

const BrowserBuildPath = './dist/index.browser.js';
const BrowserMinifiedBuildPath = './dist/index.browser.min.js';

module.exports = [{
  input: './dist/index.js',
  output: [{
      name: 'CometExtension',
      file: BrowserBuildPath,
      format: 'iife',
      sourcemap: true,
    },
    {
      name: 'CometExtension',
      file: BrowserMinifiedBuildPath,
      format: 'iife',
      sourcemap: false,
      plugins: [terser()],
    }
  ],
  plugins: [
    resolve({
      browser: true,
    }),
    commonjs({}),
  ],
}];