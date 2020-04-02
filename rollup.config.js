import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import sourceMaps from 'rollup-plugin-sourcemaps';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';

const pkg = require('./package.json');

export default {
  input: 'index.ts',
  output: [{ file: pkg.main, name: 'sandbox', format: 'umd', sourcemap: true }],
  external: [],
  watch: {
    include: 'src/**',
  },
  plugins: [json(), typescript(), commonjs(), resolve(), sourceMaps()],
};
