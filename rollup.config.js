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
    input: "src/chart.js",
    output: {
      file: "dist/chart.min.js",
      sourcemap: true,
      name: "Chart",
      format: "umd"
    },
    plugins: [resolve({ modulesOnly: true }), commonjs(), terser(), sourcemaps()]
  },
]
