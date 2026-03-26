const resolve = require('@rollup/plugin-node-resolve').default || require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const babel = require('@rollup/plugin-babel').default;
const dts = require('rollup-plugin-dts').default;
const postcss = require('rollup-plugin-postcss');
const peerDepsExternal = require('rollup-plugin-peer-deps-external');
const terser = require('@rollup/plugin-terser').default;

const packageJson = require('./package.json');

module.exports = [
  // ESM 构建 - 保留目录结构
  {
    input: 'src/lib/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].mjs'
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      postcss({
        extract: 'index.css',
        modules: false,
        minimize: true
      })
    ],
    external: ['react', 'react-dom']
  },
  // CJS 构建 - 保留目录结构
  {
    input: 'src/lib/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      sourcemap: true,
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].js',
      exports: 'named'
    },
    plugins: [
      peerDepsExternal(),
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      postcss({
        extract: 'index.css',
        modules: false,
        minimize: true
      })
    ],
    external: ['react', 'react-dom']
  },
  // UMD 构建 - 单个文件，供浏览器直接引用
  {
    input: 'src/lib/index.ts',
    output: {
      file: 'dist/umd/zjpcy-workflow.min.js',
      format: 'umd',
      name: 'ZjpcyWorkflow',
      sourcemap: true,
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    },
    plugins: [
      resolve({
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      commonjs(),
      babel({
        babelHelpers: 'bundled',
        exclude: 'node_modules/**',
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }),
      postcss({
        extract: 'zjpcy-workflow.min.css',
        modules: false,
        minimize: true
      }),
      terser()
    ],
    external: ['react', 'react-dom']
  },
  // TypeScript 声明文件构建 - ESM
  {
    input: 'src/lib/index.ts',
    output: {
      dir: 'dist/esm',
      format: 'esm',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].d.ts'
    },
    plugins: [dts()],
    external: [/\.css$/]
  },
  // TypeScript 声明文件构建 - CJS
  {
    input: 'src/lib/index.ts',
    output: {
      dir: 'dist/cjs',
      format: 'cjs',
      preserveModules: true,
      preserveModulesRoot: 'src',
      entryFileNames: '[name].d.ts'
    },
    plugins: [dts()],
    external: [/\.css$/]
  }
];
