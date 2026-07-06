# AGENTS.md — `@scottjarvis/component`

## Build

- `npm run build` — Rollup v2 bundles each `src/*.js` to `dist/*.min.js` (UMD) + `dist/index.esm.js` (ESM), then gzips each
- No linter, typechecker, or test framework configured (`npm test` is a no-op echo)
- CI (`.travis.yml`) runs `npm install && npm run build` on Node 10–12

## Entry points

| Use case | Entry | Output |
|---|---|---|
| Node `require()` | `src/index.js` re-exports `dist/*.min.js` (UMD) | `dist/index.min.js` (`"main"`) |
| ESM `import` | `src/index.esm.js` re-exports from `src/*.js` (tree-shakable) | `dist/index.esm.js` (`"module"`) |
| Browser `<script>` | `src/component.js` | `dist/component.min.js` (`"browser"`, `"unpkg"`) |

## Key source modules

All in `src/`. Each is individually built to `dist/*.min.js` and can be used standalone or as a Component plugin:

- `component.js` — Core Component constructor, inline DOM diffing, state management, CSS scoping, actions, time-travel
- `render.js` — Standalone `<830 B` debounced DOM diffing (no Component dependency)
- `html.js` / `htmel.js` — Template literal helpers (string / DOM node output)
- `tweenState.js`, `springTo.js`, `onScroll.js`, `onLoop.js`, `useAudio.js` — Animation and audio add-ons
- `storage.js`, `syncTabs.js` — Persistent state via localStorage / cross-tab sync
- `emitter.js` — Pub/sub event emitter
- `ctx.js` — Enhanced canvas 2d API
- `chart.js`, `geo.js` — Charting and map projections
- `hooks.js` — React-like hooks API
- `devtools.js` — Browser debug UI
- `easings.js` — Easing functions for tweens
- `raf.js` — requestAnimationFrame polyfill

## Plugin pattern

Attach modules to `Component` before creating instances:

```js
Component.emitter = emitter    // enables .on() / .off() / .once() on components
Component.storage = storage    // enables .store / persistent state
Component.tweenState = tweenState  // enables .tweenState()
Component.Ctx = Ctx            // enables enhanced canvas ctx
```

## Notable quirks

- `src/index.js` requires `dist/*.min.js` (prebuilt UMD) — if you modify a `src/*.js`, rebuild first before Node testing
- `src/index.esm.js` imports from `src/*.js` directly (ESM, tree-shakeable) — no prebuild needed for bundler consumers
- `scratch/` in `.gitignore` — used by `node-localstorage` polyfill in examples
- `dist/` is committed (pregenerated builds for CDN/unpkg)
- CSS scoping auto-prefixes selectors with the container's id/class; disabled in Node (`toString()`)
- No tests exist — `npm test` is a placeholder
- Minimum Node >=10, npm >=6