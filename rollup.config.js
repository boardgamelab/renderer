import html from 'rollup-plugin-html-entry';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import svelte from 'rollup-plugin-svelte';
import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';

const pkg = require('./package.json');

export default [
  {
    input: 'dev.html',

    output: [{ file: pkg.main, format: 'es', sourcemap: true }],

    external: [],

    watch: {
      include: 'src/**',
    },

    plugins: [
      html({ exports: false }),

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
    ],
  },
];
