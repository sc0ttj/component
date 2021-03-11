import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import sourcemaps from 'rollup-plugin-sourcemaps'
import { terser } from "rollup-plugin-terser"

// README:
// - compiles everything matching src/*.js
// - compiles minified versions to dist/*.min.js
// - adds source maps to dist/
// - index.esm.js contains all modules in one file, tree-shakable

// NOTE: You can remove "terser()" to build non-minified files

export default [
  {
    input: "src/component.js",
    output: {
      file: "dist/component.min.js",
      sourcemap: true,
      name: "Component",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/tweenState.js",
    output: {
      file: "dist/tweenState.min.js",
      sourcemap: true,
      name: "tweenState",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/springTo.js",
    output: {
      file: "dist/springTo.min.js",
      sourcemap: true,
      name: "springTo",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/emitter.js",
    output: {
      file: "dist/emitter.min.js",
      sourcemap: true,
      name: "emitter",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/htmel.js",
    output: {
      file: "dist/htmel.min.js",
      sourcemap: true,
      name: "htmel",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/html.js",
    output: {
      file: "dist/html.min.js",
      sourcemap: true,
      name: "html",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/storage.js",
    output: {
      file: "dist/storage.min.js",
      sourcemap: true,
      name: "storage",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/syncTabs.js",
    output: {
      file: "dist/syncTabs.min.js",
      sourcemap: true,
      name: "syncTabs",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/render.js",
    output: {
      file: "dist/render.min.js",
      sourcemap: true,
      name: "render",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/hooks.js",
    output: {
      file: "dist/hooks.min.js",
      sourcemap: true,
      name: "hooks",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/devtools.js",
    output: {
      file: "dist/devtools.min.js",
      sourcemap: true,
      name: "devtools",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/index.min.js",
      sourcemap: true,
      name: "Component",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
  {
    input: 'src/index.esm.js',
    output: {
      file: "dist/index.esm.js",
      sourcemap: true,
      name: "index",
      format: "esm"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  }
]
