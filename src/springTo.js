import raf from './raf.js'

// if no requestAnimationFrame, use the 'raf' polyfill
const requestAnimationFrame =
  typeof window !== "undefined" &&
  typeof window.requestAnimationFrame !== "undefined"
    ? window.requestAnimationFrame
    : raf

// Taken from https://github.com/raphaelameaume/lemonade-spring
const config = {
  mass: 1,
  stiffness: 0.1,
  damping: 0.8,
  precision: 0.01,
};

function noop() {}

function isAtTarget(curr, dest, precision = config.precision) {
  return curr < dest + precision && curr > dest - precision;
}

function createObjectSpring(start, {
  paused = false,
  stiffness = config.stiffness,
  damping = config.damping,
  mass = config.mass,
  precision = config.precision,
  shouldSetState = () => true,
  onSetState = noop,
  onStart = noop,
  onUpdate = noop,
  onComplete = noop,
} = config) {
  let keys, previous, current;
  let finalState = {};
  let completedKeys = [];

  function to(newState) {
    Object.keys(newState).forEach(key => {
      let completedKeyIndex = completedKeys.indexOf(key);
      if (completedKeyIndex >= 0) {
        completedKeys.splice(completedKeyIndex, 1);
      }
      finalState[key] = newState[key];
    });
    spring.completed = false;
  }

  function update(frame, self) { // pass in frame, so it can be receved by users callbacks (for convenience)
    if (Object.keys(finalState).length > 0) {
      let velocity;
      let acceleration;

      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];
        if (finalState[key] !== undefined && !completedKeys.includes(key)) {
          velocity = (current[key] - previous[key]);
          acceleration = (finalState[key] - current[key]) * spring.stiffness - velocity * spring.damping;
          acceleration /= spring.mass;

          previous[key] = current[key];
          current[key] += velocity + acceleration;
          start[key] = current[key];

          if (isAtTarget(current[key], finalState[key], spring.precision) && !completedKeys.includes(key)) {
              completedKeys.push(key);
          }
        }
      }

      const values = getValue();
      const currentData = { ...values, velocity, acceleration, frame };
      if (frame === 1) onStart({ ...values, frame });

      let isComplete = Object.keys(finalState).every(key => completedKeys.includes(key));

      if (!spring.completed) {
        onUpdate(currentData);
        if (shouldSetState(currentData)) {
          self.setState({ ...values });
          onSetState(currentData);
        }
        if (isComplete) {
          spring.completed = true;
          Object.keys(finalState).forEach(key => {
              current[key] = finalState[key];
          });
          onComplete(currentData);
        }
      }
    }
  }


  function setValue(value) {
    keys = Object.keys(value);

    previous = keys.reduce((obj, key) => {
      obj[key] = value[key];

      return obj;
    }, {});

    current = keys.reduce((obj, key) => {
      obj[key] = value[key];

      return obj;
    }, {});

    finalState = {};
    completedKeys = [];
    spring.completed = false;
  }


  function getValue() {
      return current;
  }


  const spring = {
    paused,
    completed: false,
    stiffness,
    damping,
    precision,
    mass,
    update,
    getValue,
    setValue,
    to
  };

  spring.setValue(start);

  return spring;
}

// sc0ttj - component specific stuff below

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

const springTo = function(self, newState, springCfg) {
  let spring,
      loop,
      frame = 1;

  const defaults = {
    onStart: noop,
    onUpdate: noop,
    onComplete: noop,
    shouldSetState: noop,
    onSetState: noop,
  };

  // get a state matching the shape of newState, but with values from self.state
  const stateToTween = getStateToTween(self.state, newState)

  // define the spring
  spring = createObjectSpring(stateToTween, { ...defaults, ...springCfg });
  spring.cfg = springCfg;

  // define the animation loop
  function loopFn() {
    if (spring.paused === true) return;
    spring.update(frame, self);
    frame += 1;
    loop = requestAnimationFrame(loopFn);
  }

  // pass the values to animate
  spring.to(newState);
  // start the loop
  loopFn();


  // create some callbacks
  spring.pause = () => {
    spring.paused = true;
    cancelAnimationFrame(loop);
  };

  spring.play = () => {
    spring.paused = false;
    loopFn();
  }

  spring.stop = () => {
    cancelAnimationFrame(loop);
    spring.play = noop;
    spring.completed = true;
    frame = 1;
  }

  return spring;
};

export default springTo;

