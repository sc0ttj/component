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
import tweenState from './tweenState.js'
import emitter from './emitter.js'
import html from './html.js'
import htmel from './htmel.js'
import storage from './storage.js'
import syncTabs from './syncTabs.js'

export { Component, tweenState, emitter, html, htmel, storage, syncTabs }
