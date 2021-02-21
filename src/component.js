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
  var c = function (state, schema) {
    c.setState(state, schema)
    return !state ? c.container : c
  }

  c.state = state
  c.schema = schema

  var self = c
  var storage = Component.storage
  var validator = Component.validator
  var emitter = Component.emitter
  var tweenState = Component.tweenState
  var devtools = Component.devtools

  c.reactive = true // if true, re-render on every state change
  c.debug = devtools ? true : false //  if true, maintain a history of state changes in `.log`
  c.scopedCss = true // auto prefix component css with a unique id

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
    c.css.id = c.uid
    document.head.appendChild(c.css)
  }

  // on init, add our initial state to the state history
  c.log = [{ id: 0, state: state, action: "init" }]
  c.i = c.log.length

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  c.actions = actions => {
    c.actionsList = actions
    // convert each key/value to set state function:
    Object.keys(actions).forEach(action => {
      if (typeof c[action] !== "undefined") return false
      // add the action as a function
      c[action] = newState => {
        c.action = action
        actions[action](newState)
        // return itself, so it's always chainable
        return c
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
    // get initial state from localStorage, if it's in there
    if (storage && !c.loaded) {
      const pState = storage.getItem(c, { ...c.state, ...newState });
      if (pState) newState = { ...newState, ...pState };
    }
    c.loaded = true;

    // enable schema validation using @scottjarvis/validator
    if (validator && c.schema) {
      var err = validator({ ...c.state, ...newState }, c.schema)
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

      if (storage && c.loaded) {
        // c.store is just the name of the key in localStorage,
        // where we keep our JSON stringified state
        storage.setItem(c, c.state)
      }

      // re-render component
      if (c.reactive) c.render(c.container)

      if (t && !c.isNode) cancelAnimationFrame(t)
      // for debouncing logging in browser
      var t = undefined

      // c.tt = component is "time travelling" (traversing state history)
      if (c.debug && c.tt !== true) {
        if (c.isNode && !requestAnimationFrame) {
          requestAnimationFrame = function raf(logFn) { setTimeout(() => logFn(), 1); };
        }

        t = requestAnimationFrame(() => {
          // we are not traversing state history, so add the new state to the log
          c.log.push({
            id: c.log.length,
            state: c.state,
            action: c.action || "setState"
          })
          c.action = undefined
          // move along index
          c.i = c.log.length -1
        })
      }

      // log state changes if debug = true
      //if (c.debug) console.log(c.i, [c.state, ...c.log])

      // freeze state so it can only be changed through setState()
      this.freeze(c.state)

      // if we updated using an "action" method, and emitter is avail,
      // then emit an event with same name as the "action" called,
      // passing in the current state
      if (typeof emitter !== "undefined" && !!c.action) {
        emitter.emit(`${c.action}`, c.state)
      }

      // run any middlware functions that were defined by the user
      c.middleware.forEach(fn => fn({ ...c.state }))

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
    typeof tweenState !== "undefined"
      ? tweenState(c, newState, cfg)
      : c.setState(newState)
    return c
  }

  c.on = (ev, fn) => {
    typeof emitter !== "undefined"
      ? emitter.on(ev, fn)
      : false
    return c
  }

  c.once = (ev, fn) => {
    if (typeof emitter !== "undefined") {
      emitter.on(ev, props => {
        fn(props)
        emitter.off(ev, fn)
      })
    }
    return c
  }

  c.off = (ev, fn) => {
    typeof emitter !== "undefined"
      ? emitter.off(ev, fn)
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
      i = c.i + num
    } else {
      i = c.i - num
    }
    if (c.log[i]) {
      c.i = i
      c.tt = true;
      c.setState(c.log[i].state)
      c.tt = false;
    }
    return c
  }

  /**
   * Go to previous (or first) state in the state history
   * @param {number} num - the number of steps through the history to take, 0 if 'num' not given
   */
  c.rw = function(num) {
    if (!num) {
      if (c.log[0]) {
        c.tt = true;
        c.setState(c.log[0].state)
        c.tt = false;
      }
      c.i = 0
      return c
    }
    return c.go(num, "b")
  }

  /**
   * Go to more recent state in the state history
   * @param {number} num - the number of steps through the history to take, most recent if 'num' not given
   */
  c.ff = function(num) {
    if (!num) {
      if (c.log[c.log.length - 1]) {
        c.tt = true;
        c.setState(c.log[c.log.length - 1].state)
        c.tt = false;
      }
      c.i = c.log.length -1
      return c
    }
    return c.go(num, "f")
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

    // get local state
    if (!c.loaded && storage) {
      const pState = storage.getItem(c, c.state);
      c.setState(pState);
      view = typeof c.view === "function" ? c.view(pState) : view
    }

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

    if (c.isNode) {
      return c.toString()
    } else {
      // get state from localStorage, if it's in there
      if (!c.html && storage) {
        const pState = storage.getItem(c, c.state);
        view = typeof c.view === "function" ? c.view(pState) : null
        c.setState(pState);
      }
      // make sure we have the HTML Element, not just the selector for it
      if (document && !c.html) el = document.querySelector(el)
      c.html = c.container = el

      // If there's a timer, cancel it
      if (timeout) cancelAnimationFrame(timeout)

      // Setup the new requestAnimationFrame()
      timeout = requestAnimationFrame(() => {
        if (c.css && c.style) c.setCss()
        if (c.container && view) {
          try {
            domDiff(c.container.firstElementChild, view.outerHTML ? view.outerHTML : view)
            console.log('diffed')
          } catch (err) {
            if (view.outerHTML) {
              c.container.innerHTML = ''
              c.container.append(view)
              console.log('cleared & appended')
            } else {
              c.container.innerHTML = view
              console.log('replaced innerHTML')
            }
          }
        }
        // for devtools
        if (devtools && c.container) {
          c.container.firstChild.setAttribute('data-uid', c.uid)
          devtools.populateUI(c.container)
        }
      })
    }
    return c.container
  }

  // for devtools
  if (!c.isNode) {
    window.sjComponents = window.sjComponents || {};
    window.sjComponents[c.uid] = c;
  }

  return c
}

export default Component
