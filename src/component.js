// Begin example implementation

// Note:   This is just a demo/experiment
// Goals:  Super easy to setup, small code base, automatic re-renders on state update
//
// Component() features:
//  * a state managent thing
//  * a state history
//  * automatic re-rendering on state change (no diffing!)
//  * ability to "time travel" to prev/next states
//  * update states using simple "actions"

"use strict"

/**
 * A stateful component creator
 * @constructor
 * @param {object} state - The component state (model).
 */
function Component(state) {
  this.reactive = true // if true, re-render on every state change
  this.log = false //  if true, print state history to console on re-render

  this.isNode =
    typeof process !== "undefined" &&
    process !== null &&
    process.versions !== null &&
    process.versions.node !== null

  this.state = state || {} // the main state/model of the component

  this.state.uid = Math.random()
    .toString(36)
    .split(".")[1]

  if (!this.isNode) {
    // the <style> elem into which we put our component CSS
    this.styleEl = document.createElement("style")
    document.head.appendChild(this.styleEl)
  }

  // on init, add our initial state to the state history
  this.history = [{ id: 0, state: state, action: "init" }]

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  this.actions = actions => {
    // convert each key/value to set state function:
    Object.keys(actions).forEach(action => {
      if (typeof this[action] !== "undefined") {
        console.warn("Warning! Not replacing " + this[action])
        return false
      }
      this[action] = newState => {
        this.action = action
        return actions[action](newState)
      }
    })

    return this
  }

  this.deepFreeze = obj => {
    if (!Object.isFrozen(obj)) {
      // Recusively call until all child objects are frozen
      Object.keys(obj).forEach(name => this.deepFreeze(obj[name]))
      Object.freeze(obj)
    }
    return obj
  }

  this.deepEqual = (x, y) => {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every(key => this.deepEqual(x[key], y[key]))
      : String(x) === String(y)
  }

  /**
   * Set the component state
   * @param {object} newState - the new state to update to
   */
  this.setState = newState => {
    // update previous and current state
    this.previousState = this.state
    this.state = { ...this.state, ...newState }

    if (this.deepEqual(this.state, this.previousState)) {
      console.warn("No changes to render.")
      return this
    }

    // re-render component
    if (this.reactive) this.render(this.container)

    // update history and move along index
    if (this.currentIndex === this.history.length) {
      // we are not traversing state history, so add the new state to history
      this.history.push({
        id: this.history.length,
        state: this.previousState,
        action: this.action || "setState"
      })
    }
    this.currentIndex = this.history.length

    // log state changes
    if (this.log) console.log(this.currentIndex, [this.state, ...this.history])

    this.action = undefined

    // freeze state so it can only be changed through setState()
    this.deepFreeze(this.state)
    return this
  }

  /**
   * Travel forward/backward to different states in the state history
   * @param {number} num - the number of steps through the history to take
   * @param {string} direction - 'f' for forward, 'b' for backwards
   */
  this.travel = function(num, direction) {
    var newIndex
    if (direction === "f") {
      newIndex = this.currentIndex + num
    } else {
      newIndex = this.currentIndex - num
    }
    this.setState(this.history[newIndex].state)
    this.currentIndex = newIndex

    return this
  }

  /**
   * Go to previous (or first) state in the state history
   * @param {number} num - the number of steps through the history to take, 0 if 'num' not given
   */
  this.rewind = function(num) {
    if (!num) {
      this.setState(this.history[0].state)
      this.currentIndex = 0
      return true
    }
    this.travel(num, "b")

    return this
  }

  /**
   * Go to more recent state in the state history
   * @param {number} num - the number of steps through the history to take, most recent if 'num' not given
   */
  this.forward = function(num) {
    if (!num) {
      this.setState(this.history[this.history.length - 1].state)
      this.currentIndex = this.history.length - 1
      return true
    }
    this.travel(num, "f")

    return this
  }

  /**
   * Go go back one step in the state history
   */
  this.undo = function() {
    this.rewind(1)

    return this
  }

  /**
   * Go go forward one step in the state history
   */
  this.redo = function() {
    this.forward(1)

    return this
  }

  /**
   * If in browser, puts our component styles in this.styleEl
   */
  this.setStyles = function() {
    if (typeof document !== "undefined" && document.querySelector) {
      if (this.styleEl) {
        var minifiedCss = this.style(this.state)
          .replace(/\n/g, "")
          .replace(/\s\s+/g, " ")
        if (this.styleEl.innerHTML !== minifiedCss) {
          this.styleEl.innerHTML = minifiedCss || ""
        }
      }
    }
  }

  /*
  * Render the current view as a string, including
  * our component styling, in a <style> tag
  */
  this.renderToString = function() {
    var str = ""
    var view = this.view(this.state)
    var style

    if (typeof this.style === "function") {
      style = this.style(this.state).replace(/^ {4}/gm, "")
    }

    if (typeof view === "string") {
      try {
        // if view is a JSON string
        str = JSON.parse(view)
        // return the view as prettified JSON
        str = JSON.stringify(str, null, 2)
      } catch (err) {
        if (style) str = `<style>${style}\n</style>`
        str += `${view}`.replace(/^ {4}/gm, "")
      }
    } else if (typeof view === "object" || typeof view === "array") {
      // return the view as prettified JSON
      str = JSON.stringify(view, null, 2)
    }
    //if (this.log) console.log(str)
    return str
  }

  /**
   * Re-render the component and add it to the page
   * @param {string|element} container - the element which holds the component
   */
  this.render = function(container) {
    var view = this.view(this.state)
    if (this.isNode) {
      return this.renderToString()
    } else {
      var el = container
      if (this.styleEl) this.setStyles()
      if (typeof el === "string") el = document.querySelector(el)
      this.container = el
      //
      // For diffing of real DOM nodes:
      //
      // here is where you would diff this.view this el.innerHTML
      // and apply only the differences.. see nanohtml and nanomorph
      //
      // For diffing of VDOM:
      //
      // here you would generate VDOM from the `this.view` template string
      // (see snabby, nano-byte, vel, etc), then do VDOM diffing (see main-loop, etc),
      // then do VDOM to real DOM (nano-byte, jsx-pragmatic, etc)
      //
      // For better performance, through batched rendering, we can use
      // requestAnimationFrame (see Raynos/main-loop)
      //
      // ... we have no diffing setup, lets just replace the whole thing :/
      el.innerHTML = view
    }
    return this.container
  }

  return this
}

if (typeof module !== "undefined") {
  module.exports = Component
}
