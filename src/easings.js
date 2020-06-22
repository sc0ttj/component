var easing = {
  // no easing, no acceleration
  linear: t => t,
  // accelerating from zero velocity
  inQuad: t => t * t,
  // decelerating to zero velocity
  outQuad: t => t * (2 - t),
  // acceleration until halfway, then deceleration
  inOutQuad: t => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  // accelerating from zero velocity
  inCubic: t => t * t * t,
  // decelerating to zero velocity
  outCubic: t => --t * t * t + 1,
  // acceleration until halfway, then deceleration
  inOutCubic: t =>
    t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  // accelerating from zero velocity
  inQuart: t => t * t * t * t,
  // decelerating to zero velocity
  outQuart: t => 1 - --t * t * t * t,
  // acceleration until halfway, then deceleration
  inOutQuart: t => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),
  // accelerating from zero velocity
  inQuint: t => t * t * t * t * t,
  // decelerating to zero velocity
  outQuint: t => 1 + --t * t * t * t * t,
  // acceleration until halfway, then deceleration
  inOutQuint: t =>
    t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t,
  // elastic bounce effect at the beginning
  inElastic: t => (0.04 - 0.04 / t) * Math.sin(25 * t) + 1,
  // elastic bounce effect at the end
  outElastic: t => ((0.04 * t) / --t) * Math.sin(25 * t),
  // elastic bounce effect at the beginning and end
  inOutElastic: t =>
    (t -= 0.5) < 0
      ? (0.02 + 0.01 / t) * Math.sin(50 * t)
      : (0.02 - 0.01 / t) * Math.sin(50 * t) + 1,
  // slight acceleration from zero to full speed
  inSin: t => 1 + Math.sin((Math.PI / 2) * t - Math.PI / 2),
  // slight deceleration at the end
  outSin: t => Math.sin((Math.PI / 2) * t),
  // slight acceleration at beginning and slight deceleration at end
  inOutSin: t => (1 + Math.sin(Math.PI * t - Math.PI / 2)) / 2,
  // Accelerate exponentially until finish
  inExpo: t => {
    if (t === 0) return 0
    return Math.pow(2, 10 * (t - 1))
  },
  //
  // Initial exponential acceleration slowing to stop
  outExpo: function(t) {
    if (t === 1) return 1
    return -Math.pow(2, -10 * t) + 1
  },
  // Exponential acceleration and deceleration
  inOutExpo: function(t) {
    if (t === 0 || t === 1) return t
    var scaledTime = t * 2
    var scaledTime1 = scaledTime - 1
    if (scaledTime < 1) return 0.5 * Math.pow(2, 10 * scaledTime1)
    return 0.5 * (-Math.pow(2, -10 * scaledTime1) + 2)
  },
  // Slow movement backwards then fast snap to finish
  inBack: function(t, magnitude) {
    var m = typeof magnitude !== "undefined" ? magnitude : 1.70158
    return t * t * ((m + 1) * t - m)
  },
  // Fast snap to backwards point then slow resolve to finish
  outBack: function(t, magnitude) {
    var m = typeof magnitude !== "undefined" ? magnitude : 1.70158
    var scaledTime = t / 1 - 1
    return scaledTime * scaledTime * ((m + 1) * scaledTime + m) + 1
  },
  // Slow movement backwards, fast snap to past finish, slow resolve to finish
  inOutBack: function(t, magnitude = 1.70158) {
    var scaledTime = t * 2
    var scaledTime2 = scaledTime - 2
    var s = magnitude * 1.525
    if (scaledTime < 1)
      return 0.5 * scaledTime * scaledTime * ((s + 1) * scaledTime - s)
    return 0.5 * (scaledTime2 * scaledTime2 * ((s + 1) * scaledTime2 + s) + 2)
  }
}

export default easing
