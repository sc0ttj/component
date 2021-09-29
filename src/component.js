// Begin example implementation

// Note:   This is just a demo/experiment
// Goals:  Super easy to setup, small code base, automatic re-renders on state update
;("use strict")

// t = target
// s = source
const domDiff = (t, s) => { // from https://codepen.io/tevko/pen/LzXjKE?editors=0010
  const d = document; // TODO: support shadow DOM - check the root, set accordingly
  const job = {
    cfg: {
      orig: t
    },
    // t = target
    // s = source
    replace(t, s = t) {
      const v = d.createElement("template")
      v.innerHTML = s
      const vHTML = v.content.firstChild.nextElementSibling
      if (vHTML.nodeName !== t.nodeName) {
        t.parentElement.replaceChild(vHTML, t)
        return
      }
      this.loop(t, vHTML)
    },
    // tn = target Node
    // sn = source Node
    loop(tn, sn, tOrig) {
      if (tn || sn) {
        this.checkNew(tn, sn, tOrig)
        if (
          tn &&
          sn &&
          tn.nodeName !== sn.nodeName
        ) {
          this.checkNodeName(tn, sn)
        } else if (
          tn &&
          sn &&
          tn.nodeName === sn.nodeName
        ) {
          this.checkCtx(tn, sn)
          tn.nodeType !== 3 &&
            t.nodeType !== 8 &&
            this.checkAttrs(tn, sn)
        }
      }
      if (tn && sn) {
        if (tn.childNodes && sn.childNodes) {
          this.cfg.lengthDiff = [
            ...t.childNodes,
            ...sn.childNodes
          ]
        } else {
          this.cfg.lengthDiff = null
        }
        Array.apply(null, this.cfg.lengthDiff).forEach(
          (node, idx) => {
            this.cfg.lengthDiff &&
              this.loop(
                tn.childNodes[idx],
                sn.childNodes[idx],
                tn,
                sn
              )
          }
        )
      }
    },
    checkNodeName(tn, sn) {
      const n = sn.cloneNode(true)
      tn.parentElement.replaceChild(n, tn)
    },
    checkAttrs(tn, sn) {
      const attrs = tn.attributes || []
      const filteredAttrs = Object.keys(attrs).map(n => attrs[n])
      const attrsNew = sn.attributes || []
      const filteredAttrsNew = Object.keys(attrsNew).map(
        n => attrsNew[n]
      )
      filteredAttrs.forEach(o => {
        return sn.getAttribute(o.name) !== null
          ? tn.setAttribute(o.name, sn.getAttribute(o.name))
          : tn.removeAttribute(o.name)
      })
      filteredAttrsNew.forEach(a => {
        return (
          tn.getAttribute(a.name) !== sn.getAttribute(a.name) &&
          tn.setAttribute(a.name, sn.getAttribute(a.name))
        )
      })
    },
    checkCtx(tn, sn) {
      if (tn.nodeValue !== sn.nodeValue) {
        tn.textContent = sn.textContent
      }
    },
    checkNew(tn, sn, tParent = this.cfg.orig) {
      if (sn && tn === undefined) {
        const newNode = sn.cloneNode(true)
        tParent.nodeType !== 3 &&
          tParent.nodeType !== 8 &&
          tParent.appendChild(newNode)
      } else if (tn && sn === undefined) {
        tn.parentElement.removeChild(tn)
      }
    }
  }
  // t = target
  // s = source
  Object.create(job).replace(t, s)
}


/**
 * A stateful component creator
 * @constructor
 * @param {object} state - The component state (model).
 */
function Component(state, schema) {
  const c = function c(state, schema) {
    c.setState(state, schema)
    return !state ? c.container : c
  }

  const C = Component
  // register the add-ons
  const validator = C.validator
  const emitter = C.emitter
  const tweenState = C.tweenState
  const springTo = C.springTo
  const strg = C.storage
  const useAudio = C.useAudio
  const onScroll = C.onScroll
  const onLoop = C.onLoop
  const Ctx = C.Ctx
  const devtools = C.devtools
  const cache = C.memo ? C.memo : function(f){return f;}
  // used by storage add-on.. maybe try to remove at some point
  const self = c
  // re-used a lot..
  const O = Object
  const R = RegExp

  // for debouncing render() calls, and window, document
  let timeout, w, d, raf, t

  c.reactive = true                   // if true, re-render on every state change
  c.immutable = true                  // if true, freeze the state object after updating it
  c.debug = devtools ? true : false   //  if true, maintain a history of state changes in `.log`
  c.scopedCss = true                  // auto prefix component css with a unique id
  c.state = state                     // component state
  c.schema = schema                   // component schema (optional)

  // on init, add our initial state to the state history
  c.log = [{ id: 0, state: state, action: "init" }]
  c.i = c.log.length

  c.view = props => props // the default view (just return the props)

  c.middleware = []

  // a unique ID, used for scoping component CSS and by devtools to register them
  c.uid = Math.random()
    .toString(36)
    .split(".")[1]

  c.isNode =
    typeof process !== "undefined" &&
    process !== null &&
    process.versions !== null &&
    process.versions.node !== null

  if (!c.isNode) {
    w = window
    d = document  // TODO: support shadow DOM - check the root, set accordingly
    raf = requestAnimationFrame
    // the <style> elem into which we put our component CSS
    // TODO: only do this if component styles are defined
    c.css = d.createElement("style")
    c.css.id = c.uid
    d.head.appendChild(c.css)
  }

  /**
   * Define chainable named "actions" that will update our
   * state in specific ways and register in our state history
   */
  c.actions = actions => {
    c.actionsList = actions
    // convert each key/value to set state function:
    O.keys(actions).forEach(axn => {
      if (typeof c[axn] !== "undefined") return false
      // add the action as a function
      c[axn] = newState => {
        // set current action
        c.action = axn
        // run action
        actions[axn](newState)
        // make sure the component returns itself, so it's always chainable
        return c
      }
    })
    return c
  }

  /**
   * Used to freeze the component state
   * @param {object} o - the object to freeze
   */
  c.freeze = cache(o => {
    if (!O.isFrozen(o)) {
      // Recursively call until all child objects are frozen
      O.keys(o).forEach(k => c.freeze(o[k]))
      O.freeze(o)
    }
    return o
  })

  /**
   * Used to compare the current and next component state
   * @param {object} x - the object to compare with y
   * @param {object} y - the object to compare with x
   */
  c.eq = cache((x, y) => {
    const ok = O.keys,
      tx = typeof x,
      ty = typeof y
    return x && y && tx === "object" && tx === ty
      ? ok(x).length === ok(y).length &&
          ok(x).every(key => c.eq(x[key], y[key]))
      : String(x) === String(y)
  })

  /**
   * Set the component state
   * @param {object} newState - the new state to update to
   */
  c.setState = newState => {
    const nextState = { ...c.state, ...newState };
    // get initial state from localStorage, if it's in there
    if (strg && !c.done) {
      const pState = strg.getItem(c, nextState);
      if (pState) newState = { ...newState, ...pState };
    }
    c.done = true;

    // enable schema validation using @scottjarvis/validator
    if (validator && c.schema) {
      const err = cache(validator(nextState, c.schema))
      const msg = "State doesn't match schema:"
      if (err.length > 0) {
        console.error(msg, "\n", err, "\n")
        throw new Error(msg + "\n" + JSON.stringify(err) + "\n")
      }
    }
    // ...the new state is valid, lets continue

    // update previous and current state
    c.prev = c.state
    c.state = { ...c.state, ...nextState }

    if (!c.eq(c.state, c.prev)) {

      if (strg && c.done) {
        // c.store is just the name of the key in localStorage,
        // where we keep our JSON stringified state
        strg.setItem(c, c.state)
      }

      // re-render component
      if (c.reactive) c.render(c.container, c.ctx)

      if (t && !c.isNode) cancelAnimationFrame(t)

      // c.tt = component is "time travelling" (traversing state history)
      if (c.debug && c.tt !== true) {
        // if node, just use setTimeout
        if (c.isNode) raf = (logFn) => setTimeout(() => logFn(), 1)
        t = raf(() => {
          // we are not traversing state history, so add the new state to the log
          c.log.push({
            id: c.log.length,
            state: c.state,
            action: c.action || "setState"
          })
          // move along index
          c.i = c.log.length -1
        })
      }

      // log state changes if debug = true
      //if (c.debug) console.log(c.i, [c.state, ...c.log])

      // freeze state so it can only be changed through setState()
      if (c.immutable) c.freeze(c.state)

      // if we updated using an "action" method, and emitter is avail,
      // then emit an event with same name as the "action" called,
      // passing in the current state
      if (typeof emitter !== "undefined" && !!c.action) {
        emitter.emit(`${c.action}`, { ...c.state })
      }

      // run any middlware functions that were defined by the user
      c.middleware.forEach(fn => fn({ ...c.state }))

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
  c.tweenState = (props, cfg) => {
    typeof tweenState !== "undefined"
      ? tweenState(c, props, cfg)
      : c(props)
    return c
  }

  /**
   * Animate from the current state to the given state, then set the given
   * state as the new state. Uses spring-based physics.
   *
   * @param {object} cfg - the settings used for the spring
   *
   */
  c.springTo = (props, cfg) => {
    typeof springTo !== "undefined"
      ? springTo(c, props, cfg)
      : c(props)
    return c
  }

  /**
   * Audio for components
   *
   * @param {object} audio library - the audio files and their settings
   *
   */
  c.useAudio = (props) => {
    if (typeof useAudio !== "undefined") {
      useAudio(props, c)
    } else {
      c(props)
    }
    return c
  }

  /**
   * Scroll-based animations for components
   *
   * @param {object}
   *
   */
  c.onScroll = fn => {
    if (onScroll) {
      onScroll(fn, c);
    }
    return c
  }

  /**
   * Game loop (fixed interval loop, variable interval rendering)
   *
   * @param {object}
   *
   */
  if (onLoop) {
    c.onLoop = (fn, o) => {
      // create a controllable loop, if needed
      c.loop = c.loop ? c.loop : new onLoop(o, fn, c)
      // attach the methods to control the loop
      c.start = () => c.loop.start();
      c.stop = () => c.loop.stop();
      c.pause = () => c.loop.pause();
      c.resume = () => c.loop.resume();
    }
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
    let i
    if (dir === "f") {
      i = c.i + num
    } else {
      i = c.i - num
    }
    if (c.log[i]) {
      c.i = i
      c.tt = true;
      c(c.log[i].state) // set state
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
        c(c.log[0].state) // set state
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
        c(c.log[c.log.length - 1].state) // set state
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
        let st = c.style(c.state) // the css

        // auto-prefix CSS styles with a unique id,to "scope" the
        // styles to the component only
        if (c.scopedCss) {
          const p = c.container.id ? "#" : "."
          // get container id, or class if no id
          let u = c.container.id ? c.container.id : c.container.className
          // if container has no class or id, use uid
          u = !!u ? u : c.uid

          // ..these 3 are used for scoping CSS, in setCss()
          const fx1 = new R(u + " ,\\s*\\.", "gm")
          const fx2 = new R(u + " ,\\s*#", "gm")
          const fx3 = new R(u + " ,\\s*([a-z\\.#])", "gmi")
          // func to scope css
          const fx = (v,p,u) =>
            v.replace(/}/g, "}\n")
             .replace(/\;\s*\n/g, ";")
             .replace(/{\s*\n/g, "{ ")
             .replace(/^\s+|\s+$/gm, "\n")
             .replace(/(^[\.#\w][\w\-]*|\s*,[\.#\w][\w\-]*)/gm, p + u + " $1")
             .replace(fx1, ", " + p + u + " ")
             .replace(fx2, ", " + p + u + " #")
             .replace(fx3, ", " + p + u + " $1")
             .replace(/\n/g, "")
             .replace(/\s\s+/g, " ")
           // scope the css
           st = cache(fx(st,p,u))
        }

        // minify the CSS
        const minCss = st.replace(/\n/g, "").replace(/\s\s+/g, " ")
        // if the new CSS is changed from previous, re-render it
        if (c.css.innerHTML !== minCss) c.css.innerHTML = minCss
      }
    }
  }

  // used by .toString()
  const toStr = (view, style) => {
    let s = '';
    if (view.outerHTML) {
      if (style) s = `<style>${style}\n</style>\n`
      s += `${view.outerHTML}`.replace(/^ {4}/gm, "")
    } else if (typeof view === "string") {
      try {
        // if view is a JSON string
        s = JSON.parse(view)
        // return the view as prettified JSON
        s = JSON.stringify(s, null, 2)
      } catch (err) {
        if (style) s = `<style>${style}\n</style>\n`
        s += `${view}`.replace(/^ {4}/gm, "")
      }
    } else if (typeof view === "object" || Array.isArray(view)) {
      // return the view as prettified JSON
      s = JSON.stringify(view, null, 2)
    }
    //if (c.debug) console.log(s)
    return s
  }

  /*
  * Render the current view as a string, including
  * our component styling, in a <style> tag
  */
  c.toString = function() {
    let view = c.view(c.state, c.ctx)
    let str = ''
    let style = ''

    // get local state
    if (!c.done && strg) {
      const pState = strg.getItem(c, c.state);
      c(pState);
      view = typeof c.view === "function" ? c.view(pState, c.ctx) : view
    }

    // get component styles, nicely indented
    if (typeof c.style === "function") {
      style = c.style(c.state).replace(/^ {4}/gm, "")
    }

    return cache(toStr(view,style))
  }

  /**
   * Re-render the component and add it to the page
   * @param {string|element} container - the element which holds the component
   */
  c.render = function(el, ctxType) {
    if (c.isNode) return c.toString()

    let view;

    // get state from localStorage, if it's in there
    if (!c.html && strg) {
      const pState = strg.getItem(c, c.state);
      view = typeof c.view === "function" ? c.view(pState, c.ctx) : null
      c(pState); // set state
    }

    // make sure we have container as an HTML Element
    if (d && !c.html) {
      // TODO: support shadow DOM - check the root , set `d` accordingly
      el = d.querySelector(el)
    }
    c.html = c.container = el

    // get the canvas context, if needed
    if (c.html && c.html.getContext && !c.ctx) {
      c.ctx = c.html.getContext(ctxType ? ctxType : '2d')
      // extend canvas if Ctx addon available (adds methods, makes all methods chainable)
      if (c.ctx && Ctx) {
        c.ctx = new Ctx(c.ctx, c);
      }
    }

    if (timeout) cancelAnimationFrame(timeout)

    timeout = raf(() => {
      if (c.css && c.style) c.setCss()

      // if we a container, lets (re)render the view (if any) to the page
      if (c.html) {
        view = typeof c.view === "function" ? c.view(c.state, c.ctx) : null
        // if container exists, is *not* a canvas
        if (!c.ctx) {
          // get the view
          // try to update view:
          // try DOM diffing, else append to empty innerHTML, else replace innerHTML
          try {
            domDiff(c.html.firstElementChild, view.outerHTML ? view.outerHTML : view)
            //console.log('diffed')
          } catch (err) {
            if (view && view.outerHTML) {
              c.html.innerHTML = ''
              c.html.append(view)
              //console.log('cleared & appended')
            } else {
              c.html.innerHTML = view
              //console.log('replaced innerHTML')
            }
          }
        } else {
          // else if container exists and *is* a canvas
          c.view(c.state, c.ctx)
        }
      }
      // for devtools
      if (devtools && c.html) {
        c.html.firstChild.setAttribute('data-uid', c.uid)
        devtools.populateUI(c.html)
      }
    })

    // return the container element
    return c.html
  }

  // for devtools
  if (!c.isNode) {
    w.sjComponents = w.sjComponents || {};
    w.sjComponents[c.uid] = c;
  }

  return c
}

export default Component
