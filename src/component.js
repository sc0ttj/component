// Begin example implementation

// Note:   This is just a demo/experiment
// Goals:  Super easy to setup, small code base, automatic re-renders on state update
;("use strict")

// from https://codepen.io/tevko/pen/LzXjKE?editors=0010
var domDiff = (target, source) => {
  //console.log("updating DOM!")
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
function Component(state, schema) {
  var c = function (state) {
    c.render(c.container)
    c.setState(state)
    return !state ? c.container : c
  }

  c.state = state
  c.schema = schema

  c.reactive = true // if true, re-render on every state change
  c.debug = false //  if true, maintain a history of state changes in `.log`
  c.scopedCss = true // auto prefix component css with a unique id

  var self = c

  // for debouncing render() calls
  var timeout = undefined

  c.isNode =
    typeof process !== "undefined" &&
    process !== null &&
    process.versions !== null &&
    process.versions.node !== null

  c.view = props => props // the default view (just return the props)

  c.middleware = []

  // a unique ID, used for scoping component CSS
  c.uid = Math.random()
    .toString(36)
    .split(".")[1]

  if (!c.isNode) {
    // the <style> elem into which we put our component CSS
    c.css = document.createElement("style")
    document.head.appendChild(c.css)
  }

  // on init, add our initial state to the state history
  c.log = [{ id: 0, state: state, action: "init" }]

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  c.actions = actions => {
    c.actionsList = actions
    // convert each key/value to set state function:
    Object.keys(actions).forEach(action => {
      if (typeof c[action] !== "undefined") {
        return false
      }
      c[action] = newState => {
        c.action = action
        return actions[action](newState)
      }
    })
    return c
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
  c.setState = newState => {
    // enable schema validation using @scottjarvis/validator
    if (Component.validator && c.schema) {
      var err = Component.validator({ ...c.state, ...newState }, c.schema)
      if (err.length > 0) {
        var msg = "State doesn't match schema:"
        console.error(msg, "\n", err, "\n")
        throw new Error(msg + "\n" + JSON.stringify(err) + "\n")
      }
    }
    // ...the new state is valid, lets continue

    // update previous and current state
    c.prev = c.state
    c.state = { ...c.state, ...newState }

    if (!this.eq(c.state, c.prev)) {
      // re-render component
      if (c.reactive) c.render(c.container)

      if (t && !c.isNode) cancelAnimationFrame(t)
      // for debouncing logging in browser
      var t = undefined
      if (typeof requestAnimationFrame === "undefined") {
        var requestAnimationFrame = function(logFn) { setTimeout(() => logFn(), 1); };
      }
      t = requestAnimationFrame(() => {
        // update history and move along index
        if (c.debug && this.i === c.log.length) {
          // we are not traversing state history, so add the new state to the log
          c.log.push({
            id: c.log.length,
            state: c.prev,
            action: c.action || "setState"
          })
        }
        this.i = c.log.length
      })

      // log state changes if dubeg = true
      //if (c.debug) console.log(this.i, [c.state, ...c.log])

      // freeze state so it can only be changed through setState()
      this.freeze(c.state)

      // if we updated using an "action" method, and emitter is avail,
      // then emit an event with same name as the "action" called,
      // passing in the current state
      if (typeof Component.emitter !== "undefined" && !!c.action) {
        Component.emitter.emit(`${c.action}`, c.state)
      }

      // run any middlware functions that were defined by the user
      c.middleware.forEach(fn => fn({ ...c.state }))

      // unset any action that may have called this invocation of setState()
      c.action = undefined

      return c
    }
  }

  /**
   * Tween from the current state to the given state, then set the given
   * state as the new state.
   *
   * @param {object} cfg - the settings used for the tweening
   *
   */
  c.tweenState = (newState, cfg) => {
    typeof Component.tweenState !== "undefined"
      ? Component.tweenState(c, newState, cfg)
      : c.setState(newState)
    return c
  }

  c.on = (ev, fn) => {
    typeof Component.emitter !== "undefined"
      ? Component.emitter.on(ev, fn)
      : false
    return c
  }

  c.once = (ev, fn) => {
    if (typeof Component.emitter !== "undefined") {
      Component.emitter.on(ev, props => {
        fn(props)
        Component.emitter.off(ev, fn)
      })
    }
    return c
  }

  c.off = (ev, fn) => {
    typeof Component.emitter !== "undefined"
      ? Component.emitter.off(ev, fn)
      : false
    return c
  }

  /**
   * Travel forward/backward to different states in the state history
   * @param {number} num - the number of steps through the history to take
   * @param {string} direction - 'f' for forward, 'b' for backwards
   */
  c.go = function(num, dir) {
    var i
    if (dir === "f") {
      i = this.i + num
    } else {
      i = this.i - num
    }
    if (c.log[i]) c.setState(c.log[i].state)
    this.i = i

    return this
  }

  /**
   * Go to previous (or first) state in the state history
   * @param {number} num - the number of steps through the history to take, 0 if 'num' not given
   */
  c.rw = function(num) {
    if (!num) {
      if (c.log[0]) c.setState(c.log[0].state)
      this.i = 0
      return true
    }
    this.go(num, "b")

    return c
  }

  /**
   * Go to more recent state in the state history
   * @param {number} num - the number of steps through the history to take, most recent if 'num' not given
   */
  c.ff = function(num) {
    if (!num) {
      if (c.log[c.log.length - 1])
        this.setState(c.log[c.log.length - 1].state)
      this.i = c.log.length - 1
      return true
    }
    c.go(num, "f")

    return c
  }

  /**
   * If in browser, puts scoped component styles in c.css
   */
  c.setCss = function() {
    // if in browser
    if (c && !c.isNode) {
      // if a style is defined
      if (c.css && typeof c.style === "function") {
        // get the latest component style
        var st = c.style(c.state) // the css

        // auto-prefix CSS styles with a unique id,to "scope" the
        // styles to the component only
        if (c.scopedCss) {
          // get container id, or class if no id
          var u = c.container.id ? c.container.id : c.container.className

          // if container has no class or id, use uid
          u = !!u ? u : c.uid

          var p = c.container.id ? "#" : "."

          var fix1 = new RegExp(u + " ,\\s*\\.", "gm")
          var fix2 = new RegExp(u + " ,\\s*#", "gm")
          var fix3 = new RegExp(u + " ,\\s*([a-z\\.#])", "gmi")

          st = st
            .replace(/}/g, "}\n")
            .replace(/\;\s*\n/g, ";")
            .replace(/{\s*\n/g, "{ ")
            .replace(/^\s+|\s+$/gm, "\n")
            .replace(/(^[\.#\w][\w\-]*|\s*,[\.#\w][\w\-]*)/gm, p + u + " $1")
            .replace(fix1, ", " + p + u + " ")
            .replace(fix2, ", " + p + u + " #")
            .replace(fix3, ", " + p + u + " $1")
            .replace(/\n/g, "")
            .replace(/\s\s+/g, " ")
        }

        // minify the CSS
        var minCss = st.replace(/\n/g, "").replace(/\s\s+/g, " ")
        // if the new CSS is changed from previous, re-render it
        if (c.css.innerHTML !== minCss) c.css.innerHTML = minCss
      }
    }
  }

  /*
  * Render the current view as a string, including
  * our component styling, in a <style> tag
  */
  c.toString = function() {
    var str = ""
    var view = c.view(c.state)
    var style

    // get component styles, nicely indented
    if (typeof c.style === "function") {
      style = c.style(c.state).replace(/^ {4}/gm, "")
    }

    if (view.outerHTML) {
      if (style) str = `<style>${style}\n</style>\n`
      str += `${view.outerHTML}`.replace(/^ {4}/gm, "")
    } else if (typeof view === "string") {
      try {
        // if view is a JSON string
        str = JSON.parse(view)
        // return the view as prettified JSON
        str = JSON.stringify(str, null, 2)
      } catch (err) {
        if (style) str = `<style>${style}\n</style>\n`
        str += `${view}`.replace(/^ {4}/gm, "")
      }
    } else if (typeof view === "object" || Array.isArray(view)) {
      // return the view as prettified JSON
      str = JSON.stringify(view, null, 2)
    }
    //if (c.debug) console.log(str)
    return str
  }

  /**
   * Re-render the component and add it to the page
   * @param {string|element} container - the element which holds the component
   */
  c.render = function(el) {
    var view = typeof c.view === "function" ? c.view(c.state) : null
    if (view.outerHTML) view = view.outerHTML

    if (c.isNode) {
      return c.toString()
    } else {
      // make sure we have the HTML Element, not just the selector for it
      if (document && !c.html) el = document.querySelector(el)
      c.html = c.container = el

      // If there's a timer, cancel it
      if (timeout) cancelAnimationFrame(timeout)

      // Setup the new requestAnimationFrame()
      timeout = requestAnimationFrame(() => {
        //console.log("debounced")
        // get the container element if needed
        //if (document && !c.html) {
        //  el = document.querySelector(el)
        //  c.html = c.container = el
        //}
        if (c.css && c.style) c.setCss()
        if (c.container && view) {
          try {
            domDiff(c.container.firstChild, view)
          } catch (err) {
            c.container.innerHTML = view.outerHTML ? view.outerHTML : view
          }
        }
      })
    }
    return c.container
  }

  return c
}

export default Component
