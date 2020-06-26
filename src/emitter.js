// from https://raw.githubusercontent.com/jeromeetienne/microevent.js/master/microevent.js

// This is basically "MicroEvent", renamed to "emitter", with
// some improvements:
//  - use "on", "off", "emit", instead of "bind", "unbind", "trigger"
//  - added "once" method
//  - added chainable methods
//  - fixed: check function passed to "off" was registered before splicing

// @TODO
//  1. update "on" and "off" methods:
//    - support matching events via regex pattern:
//    - "on":  for all matches, add fn to this._evts[match]
//    - "off": for all matches, rm fn from this._evts[match]
//  2. allow to pass data/props around in "emit" and "on"

;("use strict")

var emitter = {
  on: function(ev, fn) {
    this._evs = this._evs || {}
    this._evs[ev] = this._evs[ev] || []
    this._evs[ev].push(fn)
  },
  off: function(ev, fn) {
    this._evs = this._evs || {}
    if (ev in this._evs === false) return false
    this._evs[ev].splice(this._evs[ev].indexOf(fn), 1)
  },
  emit: function(ev /* , args... */) {
    this._evs = this._evs || {}
    if (ev in this._evs === false) return false
    for (var i = 0; i < this._evs[ev].length; i++) {
      // the "arguments" variable holds the current state (see src/component.js:214)
      this._evs[ev][i].apply(this, Array.prototype.slice.call(arguments, 1))
    }
  }
}

// export in common js
if (typeof module !== "undefined" && "exports" in module) {
  module.exports = emitter
}
