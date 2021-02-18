import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';
import copy from 'rollup-plugin-copy';
import css from 'rollup-plugin-css-only';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import sveltePreprocess from 'svelte-preprocess';

const pkg = require('./package.json');
const production = !process.env.ROLLUP_WATCH;

export default [
  {
    input: 'dev/index.ts',

    output: [{ file: pkg.main, format: 'umd', sourcemap: true }],

    external: [],

    watch: {
      include: 'src/**',
    },

    plugins: [
      copy({
        targets: [{ src: 'dev/index.html', dest: 'dist' }],
      }),

      css(),

      json(),

      svelte({
        compilerOptions: {
          dev: !production,
          hydratable: true,
        },

        preprocess: [
          sveltePreprocess({
            postcss: {
              plugins: [require('tailwindcss'), require('autoprefixer')],
            },
            typescript: { tsconfigFile: './tsconfig.json' },
          }),
        ],
      }),

      resolve(),
      commonjs(),
      typescript(),

      serve({ contentBase: 'dist', port: 5000 }),
      livereload(),
    ],
  },
];
