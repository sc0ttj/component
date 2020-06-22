import resolve from "@rollup/plugin-node-resolve"
import commonjs from "@rollup/plugin-commonjs"
import { terser } from "rollup-plugin-terser"

export default [
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
    input: "src/component.js",
    output: {
      file: "dist/component.min.js",
      name: "Component",
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
