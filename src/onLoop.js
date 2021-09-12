// adapted from https://github.com/robertcorponoi/deltaframe-extra

;("use strict")


class RAF {
  id = 0;
  running = false;
  fn = () => {};
  usingSetTimeout = false;

  constructor() {
    const self = this;
    window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || function (f) { return setTimeout(f, 1000 / 60) };
    window.cancelAnimationFrame = window.cancelAnimationFrame || window.webkitCancelAnimationFrame || function () { clearTimeout(self.id) }
  }

  start(fn, forceSetTimeout) {
    if (this.running) return;
    this.running = true;
    this.fn = fn;
    if (forceSetTimeout) {
      this.usingSetTimeout = true;
      this.updateTimeout();
    }
    else {
      window.requestAnimationFrame((time) => this.updateRAF(time));
    }
  }

  updateRAF(timestamp) {
    this.running = true;
    this.fn(timestamp);
    this.id = window.requestAnimationFrame((time) => this.updateRAF(time));
  }

  updateTimeout() {
    let timestamp = window.performance.now();
    this.fn(timestamp);
    this.id = window.setTimeout(() => this.updateTimeout(), 1000 / 60);
  }

  restart() {
    if (this.usingSetTimeout) {
      window.clearTimeout(this.id);
    }
    else {
      window.cancelAnimationFrame(this.id);
    }
    this.id = 0;
    this.running = false;
    if (this.usingSetTimeout) {
      this.updateTimeout();
    }
    else {
      window.requestAnimationFrame((time) => this.updateRAF(time));
    }
    this.running = true;
  }

  stop() {
    if (this.usingSetTimeout) {
      window.clearTimeout(this.id);
    }
    else {
      window.cancelAnimationFrame(this.id);
    }
    this.id = 0;
    this.running = false;
    this.fn = () => {};
    return;
  }
}

class Options {
  minFps = 15;
  targetFps = 60;
  maxRestarts = Infinity;
  runTime = Infinity;
  forceSetTimeout = false;

  constructor(options = {}) {
    Object.assign(this, options);
  }

  get minFpsCalc() {
    return Math.floor(1000 / this.minFps);
  }

  get targetFpsCalc() {
    return Math.floor(1000 / this.targetFps);
  }
}

export default class onLoop {
  _options;
  _restartAttempts;
  _running;
  _paused;
  _fn;
  _c;
  _raf;
  _frame;
  _time;
  _prevTime;
  _delta;
  _deltaAverage;
  _deltaHistory;
  _deltaIndex;
  _hidden;

  constructor(options, fn, c) {
    this._options = new Options(options);
    this._restartAttempts = 0;
    this._running = false;
    this._paused = false;
    this._fn = fn;
    this._c = c;
    this._frame = 0;
    this._time = 0;
    this._prevTime = 0;
    this._delta = 0;
    this._deltaAverage = 0;
    this._deltaHistory = [];
    this._deltaIndex = 0;
    this._raf = new RAF();
    this._hidden = document.hidden;
    this._boot();
  }

  get timesRestarted() { return this._restartAttempts; }

  get isRunning() { return this._running; }

  get isPaused() { return this._paused; }

  get frame() { return this._frame; }

  get time() { return this._time; }

  start() {
    this._prevTime = 0;
    this._running = true;
    this._raf.start((timestamp) => this._update(timestamp), this._options.forceSetTimeout);
  }

  pause() {
    this._paused = true;
    this._running = false;
  }

  resume() {
    this._paused = false;
    this._prevTime = window.performance.now();
    this._running = true;
  }

  stop() {
    this._restartAttempts = 0;
    this._running = false;
    this._paused = false;
    this._fn = () => {};
    this._frame = 0;
    this._time = 0;
    this._prevTime = 0;
    this._delta = 0;
    this._deltaHistory = [];
    this._deltaIndex = 0;
    document.removeEventListener('visibilitychange', () => this._visibilityChange);
    this._raf.stop();
    return;
  }

  _boot() {
    document.addEventListener("visibilitychange", () => this._visibilityChange());
  }

  _update(timestamp) {
    if (this._paused) return;

    if (timestamp >= this._options.runTime) {
      this.stop();
      return;
    }

    this._time = timestamp;

    this._delta = timestamp - this._prevTime;

    if (this._deltaIndex === 10) this._deltaIndex = 0;

    this._deltaHistory[this._deltaIndex] = this._delta;

    this._deltaIndex++;

    let mean = 0;

    for (let i = 0; i < this._deltaHistory.length; ++i) mean += this._deltaHistory[i];

    mean /= 10;

    this._deltaAverage = mean;

    if (this._deltaAverage >= this._options.minFpsCalc) {
      if (this._restartAttempts === this._options.maxRestarts) {
        this.stop();

        return;
      }

      this._raf.restart();

      this._restartAttempts++;
    }

    if (this._deltaAverage >= this._options.targetFpsCalc) {
      this._frame++;

      this._fn(this._c.state, this._delta, this._deltaAverage, timestamp);

      this._prevTime = timestamp;
    }
  }

  _visibilityChange() {
    const visibility = document.visibilityState;
    if (this.isPaused && this._options.autoResume && visibility === 'visible') this.resume();
    else if (this.isRunning && visibility === 'hidden') this.pause();
  }
}
