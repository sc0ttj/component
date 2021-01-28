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
  var rt = function(state) {
    rt.render(rt.container)
    rt.setState(state)
    return rt
  }

  rt.state = state
  rt.schema = schema

  rt.reactive = true // if true, re-render on every state change
  rt.debug = false //  if true, maintain a history of state changes in `.log`
  rt.scopedCss = true // auto prefix component css with a unique id

  var self = rt

  // for debouncing render() calls
  var timeout = undefined

  rt.isNode =
    typeof process !== "undefined" &&
    process !== null &&
    process.versions !== null &&
    process.versions.node !== null

  rt.view = props => props // the default view (just return the props)

  rt.middleware = []

  // a unique ID, used for scoping component CSS
  rt.uid = Math.random()
    .toString(36)
    .split(".")[1]

  if (!rt.isNode) {
    // the <style> elem into which we put our component CSS
    rt.css = document.createElement("style")
    document.head.appendChild(rt.css)
  }

  // on init, add our initial state to the state history
  rt.log = [{ id: 0, state: state, action: "init" }]

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  rt.actions = actions => {
    // convert each key/value to set state function:
    Object.keys(actions).forEach(action => {
      if (typeof rt[action] !== "undefined") {
        return false
      }
      rt[action] = newState => {
        rt.action = action
        return actions[action](newState)
      }
    })
    return rt
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
  rt.setState = newState => {
    // enable schema validation using @scottjarvis/validator
    if (Component.validator && rt.schema) {
      var err = Component.validator({ ...rt.state, ...newState }, rt.schema)
      if (err.length > 0) {
        var msg = "State doesn't match schema:"
        console.error(msg, "\n", err, "\n")
        throw new Error(msg + "\n" + JSON.stringify(err) + "\n")
      }
    }
    // ...the new state is valid, lets continue

    // update previous and current state
    rt.prev = rt.state
    rt.state = { ...rt.state, ...newState }

    if (!this.eq(rt.state, rt.prev)) {
      // re-render component
      if (rt.reactive) rt.render(rt.container)

      if (t) cancelAnimationFrame(t)
      // for debouncing logging
      var t = undefined
      t = requestAnimationFrame(() => {
        // update history and move along index
        if (rt.debug && this.i === rt.log.length) {
          // we are not traversing state history, so add the new state to the log
          rt.log.push({
            id: rt.log.length,
            state: rt.prev,
            action: rt.action || "setState"
          })
        }
        this.i = rt.log.length
      })

      // log state changes if dubeg = true
      //if (rt.debug) console.log(this.i, [rt.state, ...rt.log])

      // freeze state so it can only be changed through setState()
      this.freeze(rt.state)

      // if we updated using an "action" method, and emitter is avail,
      // then emit an event with same name as the "action" called,
      // passing in the current state
      if (typeof Component.emitter !== "undefined" && !!rt.action) {
        Component.emitter.emit(`${rt.action}`, rt.state)
      }

      // run any middlware functions that were defined by the user
      rt.middleware.forEach(fn => fn({ ...rt.state }))

      // unset any action that may have called this invocation of setState()
      rt.action = undefined

      return rt
    }
  }

  /**
   * Tween from the current state to the given state, then set the given
   * state as the new state.
   *
   * @param {object} cfg - the settings used for the tweening
   *
   */
  rt.tweenState = (newState, cfg) => {
    typeof Component.tweenState !== "undefined"
      ? Component.tweenState(rt, newState, cfg)
      : rt.setState(newState)
    return rt
  }

  rt.on = (ev, fn) => {
    typeof Component.emitter !== "undefined"
      ? Component.emitter.on(ev, fn)
      : false
    return rt
  }

  rt.once = (ev, fn) => {
    if (typeof Component.emitter !== "undefined") {
      Component.emitter.on(ev, props => {
        fn(props)
        Component.emitter.off(ev, fn)
      })
    }
    return rt
  }

  rt.off = (ev, fn) => {
    typeof Component.emitter !== "undefined"
      ? Component.emitter.off(ev, fn)
      : false
    return rt
  }

  /**
   * Travel forward/backward to different states in the state history
   * @param {number} num - the number of steps through the history to take
   * @param {string} direction - 'f' for forward, 'b' for backwards
   */
  rt.go = function(num, dir) {
    var i
    if (dir === "f") {
      i = this.i + num
    } else {
      i = this.i - num
    }
    if (rt.log[i]) rt.setState(rt.log[i].state)
    this.i = i

    return this
  }

  /**
   * Go to previous (or first) state in the state history
   * @param {number} num - the number of steps through the history to take, 0 if 'num' not given
   */
  rt.rw = function(num) {
    if (!num) {
      if (rt.log[0]) rt.setState(rt.log[0].state)
      this.i = 0
      return true
    }
    this.go(num, "b")

    return rt
  }

  /**
   * Go to more recent state in the state history
   * @param {number} num - the number of steps through the history to take, most recent if 'num' not given
   */
  rt.ff = function(num) {
    if (!num) {
      if (rt.log[rt.log.length - 1])
        this.setState(rt.log[rt.log.length - 1].state)
      this.i = rt.log.length - 1
      return true
    }
    rt.go(num, "f")

    return rt
  }

  /**
   * If in browser, puts scoped component styles in rt.css
   */
  rt.setCss = function() {
    // if in browser
    if (!rt.isNode) {
      // if a style is defined
      if (rt.css && typeof rt.style === "function") {
        // get the latest component style
        var c = rt.style(rt.state) // the css

        // auto-prefix CSS styles with a unique id,to "scope" the
        // styles to the component only
        if (rt.scopedCss) {
          // get container id, or class if no id
          var u = rt.container.id ? rt.container.id : rt.container.className

          // if container has no class or id, use uid
          u = !!u ? u : rt.uid

          var p = rt.container.id ? "#" : "."

          var fix1 = new RegExp(u + " ,\\s*\\.", "gm")
          var fix2 = new RegExp(u + " ,\\s*#", "gm")
          var fix3 = new RegExp(u + " ,\\s*([a-z\\.#])", "gmi")

          c = c
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
        var minCss = c.replace(/\n/g, "").replace(/\s\s+/g, " ")
        // if the new CSS is changed from previous, re-render it
        if (rt.css.innerHTML !== minCss) rt.css.innerHTML = minCss
      }
    }
  }

  /*
  * Render the current view as a string, including
  * our component styling, in a <style> tag
  */
  rt.toString = function() {
    var str = ""
    var view = rt.view(rt.state)
    var style

    // get component styles, nicely indented
    if (typeof rt.style === "function") {
      style = rt.style(rt.state).replace(/^ {4}/gm, "")
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
    //if (rt.debug) console.log(str)
    return str
  }

  /**
   * Re-render the component and add it to the page
   * @param {string|element} container - the element which holds the component
   */
  rt.render = function(el) {
    var view = typeof rt.view === "function" ? rt.view(rt.state) : null
    if (view.outerHTML) view = view.outerHTML

    if (rt.isNode) {
      return rt.toString()
    } else {
      rt.container = el
      // only interact with the DOM once every animation frame (usually 60fps)

      // If there's a timer, cancel it
      if (timeout) cancelAnimationFrame(timeout)

      // Setup the new requestAnimationFrame()
      timeout = requestAnimationFrame(() => {
        //console.log("debounced")
        // get the container element if needed
        if (typeof el === "string") el = document.querySelector(`${el}`)
        rt.container = el
        rt.html = el
        if (rt.css && rt.style) rt.setCss()
        if (rt.container && view) {
          try {
            domDiff(rt.container.firstChild, view)
          } catch (err) {
            rt.container.innerHTML = view
          }
        }
      })
    }
    return rt.container
  }

  return rt
}

export default Component
