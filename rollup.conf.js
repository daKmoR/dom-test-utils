// rollup.config.js
import typescript from 'rollup-plugin-typescript2';

export default {
  entry: './src/dom-test-utils.ts',
  output: {
    file: 'dom-test-utils.js',
    format: 'esm'
  },

  plugins: [
    typescript()
  ]
}