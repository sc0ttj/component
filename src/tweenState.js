import raf from './raf.js'
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
    context.frame =
      requestAnimationFrame(function() {
        return step(context)
      }) + 1
    return
  }

  // calculate progress according to time and and easing
  var progress = Math.min(1, (elapsed - delay) / duration)

  // add progress to tween props
  context.progress = progress

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
    context.frame =
      requestAnimationFrame(function() {
        return step(context)
      }) + 1
}

var Tween = /*#__PURE__*/ (function() {
  function Tween(context) {
    this._c = context
    this._c.ease = easing[context.ease] || easing[ease]
    this._c.onUpdate = context.onUpdate || noop
    this._c.onComplete = context.onComplete || noop
    this._c.delay = context.delay || 0
    this._c.duration = context.duration || 200
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


// for each property in newState, get the value from the given state
const getStateToTween = function(state, newState) {
  const stateToTween = {}
  Object.entries(state).forEach(entry => {
    const key = entry[0];
    const val = entry[1];
    if (newState[key]) stateToTween[key] = val;
  })
  return stateToTween
}

// go through properties in the given state, add to the given array
const addValues = function(state, array) {
  Object.keys(state).forEach((key, index) => {
    if (typeof state[key] !== "undefined") {
      if (typeof state[key] !== "object") {
        array.push(state[key])
        return
      }
      addValues(state[key], array)
    }
  })
}

const setTweenedValues = function(state, vals) {
  function reducer(obj, [key, val]) {
    obj[key] = val
    if (typeof val === "number") {
      obj[key] = vals.shift()
    } else if (typeof val === "object") {
      obj[key] = Object.entries(val).reduce(reducer, {})
    }
    return obj
  }
  const tweenedState = Object.entries(state).reduce(reducer, {})
  return tweenedState
}

const tweenState = (self, newState, cfg) => {
  // define default callbacks
  var onStart = cfg.onStart ? cfg.onStart : noop
  var onUpdate = cfg.onUpdate ? cfg.onUpdate : noop
  var onComplete = cfg.onComplete ? cfg.onComplete : noop
  var shouldSetState = cfg.shouldSetState ? cfg.shouldSetState : true
  var onSetState = cfg.onSetState ? cfg.onSetState : noop

  if (typeof shouldSetState === "boolean") shouldSetState = () => shouldSetState

  cfg.frame = 1
  cfg.frameTotal = Math.ceil((60 / 1000) * (cfg.delay + cfg.duration)) + 2

  // get a state matching the shape of newState, but with values from self.state
  var stateToTween = getStateToTween(self.state, newState)

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
    duration: cfg.duration || 200,
    ease: cfg.ease || "linear",
    frame: 1,
    frameTotal: cfg.frameTotal || 1,
    onUpdate: props => {
      // make sure values is an array
      var tweenedState = setTweenedValues(newState, [...props.values])
      if (props.frame === 1) onStart(props)
      // set current tween properties as the new state
      if (shouldSetState(props)) {
        self.setState(tweenedState)
        onSetState(props)
      }
      return onUpdate({ ...props, tweenedState })
    },
    onComplete: props => {
      self.setState(newState)
      return onComplete(props)
    }
  })

  return tween
}

export default tweenState
