// Begin example implementation

// Note:   This is just a demo/experiment
// Goals:  Super easy to setup, small code base, automatic re-renders on state update

"use strict"

// from https://codepen.io/tevko/pen/LzXjKE?editors=0010
var domDiff = (target, source) => {
  const worker = {
    cfg: {
      orig: target
    },
    replace(target, source = target) {
      const v = document.createElement("template")
      v.innerHTML = source
      const vHTML = v.content.firstChild.nextElementSibling
      if (vHTML.nodeName !== target.nodeName) {
        target.parentElement.replaceChild(vHTML, target)
        return
      }
      this.iterate(target, vHTML)
    },
    iterate(targetNode, sourceNode, tOrig) {
      if (targetNode || sourceNode) {
        this.checkAdditions(targetNode, sourceNode, tOrig)
        if (
          targetNode &&
          sourceNode &&
          targetNode.nodeName !== sourceNode.nodeName
        ) {
          this.checkNodeName(targetNode, sourceNode)
        } else if (
          targetNode &&
          sourceNode &&
          targetNode.nodeName === sourceNode.nodeName
        ) {
          this.checkTextContent(targetNode, sourceNode)
          targetNode.nodeType !== 3 &&
            target.nodeType !== 8 &&
            this.checkAttributes(targetNode, sourceNode)
        }
      }
      if (targetNode && sourceNode) {
        if (targetNode.childNodes && sourceNode.childNodes) {
          this.cfg.lengthDifferentiator = [
            ...target.childNodes,
            ...sourceNode.childNodes
          ]
        } else {
          this.cfg.lengthDifferentiator = null
        }
        Array.apply(null, this.cfg.lengthDifferentiator).forEach(
          (node, idx) => {
            this.cfg.lengthDifferentiator &&
              this.iterate(
                targetNode.childNodes[idx],
                sourceNode.childNodes[idx],
                targetNode,
                sourceNode
              )
          }
        )
      }
    },
    checkNodeName(targetNode, sourceNode) {
      const n = sourceNode.cloneNode(true)
      targetNode.parentElement.replaceChild(n, targetNode)
    },
    checkAttributes(targetNode, sourceNode) {
      const attributes = targetNode.attributes || []
      const filteredAttrs = Object.keys(attributes).map(n => attributes[n])
      const attributesNew = sourceNode.attributes || []
      const filteredAttrsNew = Object.keys(attributesNew).map(
        n => attributesNew[n]
      )
      filteredAttrs.forEach(o => {
        return sourceNode.getAttribute(o.name) !== null
          ? targetNode.setAttribute(o.name, sourceNode.getAttribute(o.name))
          : targetNode.removeAttribute(o.name)
      })
      filteredAttrsNew.forEach(a => {
        return (
          targetNode.getAttribute(a.name) !== sourceNode.getAttribute(a.name) &&
          targetNode.setAttribute(a.name, sourceNode.getAttribute(a.name))
        )
      })
    },
    checkTextContent(targetNode, sourceNode) {
      if (targetNode.nodeValue !== sourceNode.nodeValue) {
        targetNode.textContent = sourceNode.textContent
      }
    },
    checkAdditions(targetNode, sourceNode, tParent = this.cfg.orig) {
      if (sourceNode && targetNode === undefined) {
        const newNode = sourceNode.cloneNode(true)
        tParent.nodeType !== 3 &&
          tParent.nodeType !== 8 &&
          tParent.appendChild(newNode)
      } else if (targetNode && sourceNode === undefined) {
        targetNode.parentElement.removeChild(targetNode)
      }
    }
  }
  Object.create(worker).replace(target, source)
}

/**
 * A stateful component creator
 * @constructor
 * @param {object} state - The component state (model).
 */
function Component(state) {
  this.reactive = true // if true, re-render on every state change
  this.debug = false //  if true, print state history to console on re-render

  this.isNode =
    typeof process !== "undefined" &&
    process !== null &&
    process.versions !== null &&
    process.versions.node !== null

  this.state = state // the main state/model of the component

  if (!this.isNode) {
    // the <style> elem into which we put our component CSS
    this.css = document.createElement("style")
    document.head.appendChild(this.css)
  }

  // on init, add our initial state to the state history
  this.log = [{ id: 0, state: state, action: "init" }]

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  this.actions = actions => {
    // convert each key/value to set state function:
    Object.keys(actions).forEach(action => {
      if (typeof this[action] !== "undefined") return false
      this[action] = newState => {
        this.action = action
        return actions[action](newState)
      }
    })

    return this
  }

  this.freeze = o => {
    if (!Object.isFrozen(o)) {
      // Recusively call until all child objects are frozen
      Object.keys(o).forEach(k => this.freeze(o[k]))
      Object.freeze(o)
    }
    return o
  }

  this.eq = (x, y) => {
    const ok = Object.keys,
      tx = typeof x,
      ty = typeof y
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every(key => this.eq(x[key], y[key]))
      : String(x) === String(y)
  }

  /**
   * Set the component state
   * @param {object} newState - the new state to update to
   */
  this.setState = newState => {
    // update previous and current state
    this.prev = this.state
    this.state = { ...this.state, ...newState }

    if (!this.eq(this.state, this.prev)) {
      // re-render component
      if (this.reactive) this.render(this.container)

      // update history and move along index
      if (this.i === this.log.length) {
        // we are not traversing state history, so add the new state to history
        this.log.push({
          id: this.log.length,
          state: this.prev,
          action: this.action || "setState"
        })
      }
      this.i = this.log.length

      // log state changes
      if (this.debug) console.log(this.i, [this.state, ...this.log])

      this.action = undefined

      // freeze state so it can only be changed through setState()
      this.freeze(this.state)
      return this
    }
  }

  /**
   * Travel forward/backward to different states in the state history
   * @param {number} num - the number of steps through the history to take
   * @param {string} direction - 'f' for forward, 'b' for backwards
   */
  this.go = function(num, dir) {
    var i
    if (dir === "f") {
      i = this.i + num
    } else {
      i = this.i - num
    }
    this.setState(this.log[i].state)
    this.i = i

    return this
  }

  /**
   * Go to previous (or first) state in the state history
   * @param {number} num - the number of steps through the history to take, 0 if 'num' not given
   */
  this.rw = function(num) {
    if (!num) {
      this.setState(this.log[0].state)
      this.i = 0
      return true
    }
    this.go(num, "b")

    return this
  }

  /**
   * Go to more recent state in the state history
   * @param {number} num - the number of steps through the history to take, most recent if 'num' not given
   */
  this.ff = function(num) {
    if (!num) {
      this.setState(this.log[this.log.length - 1].state)
      this.i = this.log.length - 1
      return true
    }
    this.go(num, "f")

    return this
  }

  /**
   * If in browser, puts our component styles in this.css
   */
  this.setCss = function() {
    if (typeof document !== "undefined" && document.querySelector) {
      if (this.css && typeof this.style === "function") {
        var minCss = this.style(this.state)
          .replace(/\n/g, "")
          .replace(/\s\s+/g, " ")
        if (this.css.innerHTML !== minCss) this.css.innerHTML = minCss || ""
      }
    }
  }

  /*
  * Render the current view as a string, including
  * our component styling, in a <style> tag
  */
  this.toString = function() {
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
    } else if (typeof view === "object" || Array.isArray(view)) {
      // return the view as prettified JSON
      str = JSON.stringify(view, null, 2)
    }
    //if (this.debug) console.log(str)
    return str
  }

  /**
   * Re-render the component and add it to the page
   * @param {string|element} container - the element which holds the component
   */
  this.render = function(el) {
    var view = typeof this.view === "function" ? this.view(this.state) : null
    if (this.isNode) {
      return this.toString()
    } else {
      // initial render
      if (typeof el === "string") el = document.querySelector(`${el}`)
      this.container = el
      if (this.css && this.style) this.setCss()
      //
      // For diffing of real DOM nodes:
      //
      // here is where you would diff this.view with el.innerHTML
      // and apply only the differences.. see set-dom, BAD-DOM, nanohtml
      // and nanomorph in README.md
      if (this.container && view) {
        try {
          domDiff(this.container.firstChild, view)
        } catch (err) {
          this.container.innerHTML = view
        }
      }
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
    }
    return this.container
  }
  return this
}

if (typeof module !== "undefined") {
  module.exports = Component
}
