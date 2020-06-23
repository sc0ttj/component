import raf from "./raf.js"
import easing from "./easings.js"
;("use strict")

// if no window.performance, use 'perf_hooks' module
// (from https://stackoverflow.com/questions/23003252/window-performance-now-equivalent-in-nodejs)
var performance =
  typeof process !== "undefined" && typeof require !== "undefined"
    ? require("perf_hooks").performance
    : window.performance

// if no requestAnimationFrame, use the 'raf' polyfill
var requestAnimationFrame =
  typeof window !== "undefined" &&
  typeof window.requestAnimationFrame !== "undefined"
    ? window.requestAnimationFrame
    : raf

//
//
// ES5-loose (transpiled) version of
// https://github.com/jeremenichelli/phena/blob/master/src/index.js
//

var noop = function noop() {}

var now = function now() {
  return performance && performance.now ? performance.now() : Date.now()
}

var step = function step(context) {
  var delay = context.delay,
    from = context.from,
    to = context.to,
    duration = context.duration,
    startTime = context.startTime,
    easeFn = context.ease,
    onUpdate = context.onUpdate,
    onComplete = context.onComplete

  var currentTime = now()
  var elapsed = currentTime - startTime

  if (delay >= elapsed) {
    context.frame = requestAnimationFrame(function() {
      return step(context)
    })
    return
  }

  // calculate progress according to time and and easing
  var progress = Math.min(1, (elapsed - delay) / duration)

  var values = from.length
    ? from.map(function(val, index) {
        var value = val + (to[index] - val) * easeFn(progress)
        if (Number.isNaN(value)) {
          value = val + (to[index] - val) * progress
        }
        return value
      })
    : (() => {
        var value = from + (to - from) * easeFn(progress)
        if (Number.isNaN(value)) {
          value = from + (to - from) * progress
        }
        return value
      })()

  // EDIT by @sc0ttj - pass in the whole context, with values
  onUpdate({ ...context, values }) // call complete callback or invoke new frame

  // EDIT by @sc0ttj - pass in the whole context, with values
  if (progress === 1) onComplete({ ...context, values })
  else
    context.frame = requestAnimationFrame(function() {
      return step(context)
    })
}

var Tween = /*#__PURE__*/ (function() {
  function Tween(context) {
    this._c = context
    this._c.ease = easing[context.ease] || easing[ease]
    this._c.onUpdate = context.onUpdate || noop
    this._c.onComplete = context.onComplete || noop
    this._c.delay = context.delay || 0
    if (!context.paused) this.start()
  }

  var _proto = Tween.prototype

  _proto.start = function start() {
    this._c.startTime = now()
    step(this._c)
  }

  _proto.cancel = function cancel() {
    cancelAnimationFrame(this._c.frame)
  }

  return Tween
})()

var tweenState = (self, newState, cfg) => {
  // define default callbacks
  var onUpdate = cfg.onUpdate ? cfg.onUpdate : props => props
  var onComplete = cfg.onComplete ? cfg.onComplete : () => null

  // for each property in newState, get the value from the given state
  function getStateToTween(state) {
    var stateToTween = {}
    Object.entries(state).forEach(entry => {
      var key = entry[0]
      var val = entry[1]
      if (newState[key]) stateToTween[key] = val
    })
    return stateToTween
  }
  // get a state matching the shape of newState, but with values from self.state
  var stateToTween = getStateToTween(self.state)

  // go through properties in the given state, add to the given array
  function addValues(state, array) {
    Object.keys(state).forEach((key, index) => {
      if (typeof state[key] !== "undefined") {
        if (typeof state[key] !== "object") {
          if (!Number.isNaN(state[key])) array.push(state[key])
          return
        }
        if (!Number.isNaN(state[key])) addValues(state[key], array)
      }
    })
  }

  function setTweenedValues(state, vals) {
    function reducer(obj, [key, val]) {
      obj[key] = val
      if (typeof val === "number") {
        obj[key] = vals.shift()
      } else if (typeof val === "object") {
        obj[key] = Object.entries(val).reduce(reducer, {})
      }
      return obj
    }
    var tweenedState = Object.entries(state).reduce(reducer, {})
    return tweenedState
  }

  var startValuesArr = []
  var endValuesArr = []
  // use current state values as start values
  addValues(stateToTween, startValuesArr)
  // use next state values as end values
  addValues(newState, endValuesArr)

  // execute the tween, set state on completion
  var tween = new Tween({
    from: startValuesArr || 0,
    to: endValuesArr || 1,
    paused: cfg.paused || false,
    delay: cfg.delay || 0,
    duration: cfg.duration || 250,
    ease: cfg.ease || "none",
    onUpdate: props => {
      // make sure values is an array
      var tweenedState = setTweenedValues(newState, [...props.values])
      // set current tween properties as the new state
      self.setState(tweenedState)
      return onUpdate({ ...props, tweenedState })
    },
    onComplete: props => {
      var newState = {}
      self.setState(newState)
      return onComplete(props)
    }
  })

  return tween
}

export default tweenState
