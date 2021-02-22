import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default [
  {
    input: "src/component.js",
    output: {
      file: "dist/component.min.js",
      name: "Component",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/tweenState.js",
    output: {
      file: "dist/tweenState.min.js",
      name: "tweenState",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/emitter.js",
    output: {
      file: "dist/emitter.min.js",
      name: "emitter",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/htmel.js",
    output: {
      file: "dist/htmel.min.js",
      name: "htmel",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/html.js",
    output: {
      file: "dist/html.min.js",
      name: "html",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/storage.js",
    output: {
      file: "dist/storage.min.js",
      name: "storage",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/syncTabs.js",
    output: {
      file: "dist/syncTabs.min.js",
      name: "syncTabs",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/devtools.js",
    output: {
      file: "dist/devtools.min.js",
      name: "devtools",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  },
  {
    input: "src/index.js",
    output: {
      file: "dist/index.min.js",
      name: "Component",
      format: "umd"
    },
    plugins: [resolve(), commonjs(), terser()]
  }
]
