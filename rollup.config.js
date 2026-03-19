const resolve = require('@rollup/plugin-node-resolve').default || require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const typescript = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const terser = require('@rollup/plugin-terser').default;

const packageJson = require('./package.json');

module.exports = [
  // JavaScript 构建
  {
    input: 'src/lib/index.ts',
    output: [
      {
        file: packageJson.main,
        format: 'cjs',
        sourcemap: true
      },
      {
        file: packageJson.module,
        format: 'esm',
        sourcemap: true
      }
    ],
    plugins: [
      peerDepsExternal(),
      resolve(),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      postcss({
        extract: true,
        modules: false,
        minimize: true
      }),
      terser()
    ],
    external: ['react', 'react-dom']
  },
  // TypeScript 声明文件构建
  {
    input: 'src/lib/index.ts',
    output: {
      file: packageJson.types,
      format: 'esm'
    },
    plugins: [typescript()],
    external: [/\.css$/]
  }
];