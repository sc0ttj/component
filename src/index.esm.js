/*
 * This file is the entry point when using ES6 modules,
 * as defined in package.json, in the "module" field.
 *
 * Get the UMD build of each module, using import, so
 * rollup will bundle in the imported modules.
 *
 * We get the modules from src/, cos they've been written
 * using ES modules exports, and we wanna support "tree-
 * shaking" when imported into users projects.
 *
 * Rollup will build this file to dist/index.esm.js
 *
 */
import Component from './component.js'
import render from './render.js'
import tweenState from './tweenState.js'
import springTo from './springTo.js'
import emitter from './emitter.js'
import html from './html.js'
import htmel from './htmel.js'
import ctx from './ctx.js'
import storage from './storage.js'
import syncTabs from './syncTabs.js'
import useAudio from './useAudio.js'
import onScroll from './onScroll.js'
import onLoop from './onLoop.js'
// react-like hooks
import { hooks } from "./hooks.js"

export { Component, render, tweenState, springTo, emitter, html, htmel, ctx, storage, syncTabs, useAudio, onScroll, onLoop, hooks }
