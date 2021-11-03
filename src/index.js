/*
 * This file is the entry point when using NodeJS,
  * as defined in package.json, in the "main" field.
 *
 * Get the UMD build of each module, using require, so
 * rollup will simply compress this file, instead of
 * bundling in the `required` modules.
 *
 * We don't get the modules from src/, cos they've been
 * written using ES modules exports, and we don't wanna
 * have to run our Node app with Babel, and we wanna
 * support Node 10.
 *
 * The modules in src/ are ES modules so they support
 * "tree-shaking" when imported into users projects
 * using `import`.
 *
 * Rollup will build this file to dist/index.min.js
 *
 */
var Component = require("./component.min.js")
var render = require("./render.min.js")
var tweenState = require("./tweenState.min.js")
var springTo = require("./springTo.min.js")
var emitter = require("./emitter.min.js")
var html = require("./html.min.js")
var htmel = require("./htmel.min.js")
var ctx = require("./ctx.min.js")
var storage = require("./storage.min.js")
var syncTabs = require("./syncTabs.min.js")
var useAudio = require("./useAudio.min.js")
var onScroll = require("./onScroll.min.js")
var onLoop = require("./onLoop.min.js")
var Geo = require("./geo.min.js")
// react-like hooks
var { hooks } = require("./hooks.min.js")

export { Component, render, tweenState, springTo, emitter, html, htmel, ctx, storage, syncTabs, useAudio, onScroll, onLoop, Geo, hooks }
