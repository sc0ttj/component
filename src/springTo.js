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
  stiffness = config.stiffness,
  damping = config.damping,
  mass = config.mass,
  precision = config.precision,
  onUpdate = noop,
  onComplete = noop,
} = config) {
  let keys, previous, current;
  let destination = {};
  let completedKeys = [];

  function target(dest) {
    Object.keys(dest).forEach(key => {
      let completedKeyIndex = completedKeys.indexOf(key);
      if (completedKeyIndex >= 0) {
        completedKeys.splice(completedKeyIndex, 1);
      }

      destination[key] = dest[key];
    });

    spring.completed = false;
  }

  function update(frame) { // pass in frame, so it can be receved by users callbacks (for convenience)
    if (Object.keys(destination).length > 0) {
      let velocity;
      let acceleration;
      for (let i = 0; i < keys.length; i++) {
        let key = keys[i];

        if (destination[key] !== undefined && !completedKeys.includes(key)) {
          velocity = (current[key] - previous[key]);
          acceleration = (destination[key] - current[key]) * spring.stiffness - velocity * spring.damping;
          acceleration /= spring.mass;

          previous[key] = current[key];
          current[key] += velocity + acceleration;
          start[key] = current[key];

          if (isAtTarget(current[key], destination[key], spring.precision) && !completedKeys.includes(key)) {
              completedKeys.push(key);
          }
        }
      }

      let isComplete = Object.keys(destination).every(key => completedKeys.includes(key));

      if (isComplete && !spring.completed) {
        spring.completed = true;

        Object.keys(destination).forEach(key => {
            current[key] = destination[key];
        })

        onUpdate(getValue());
        onComplete(getValue());
      } else if (!spring.completed) {
        onUpdate({ ...getValue(), velocity, acceleration, frame });
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

    destination = {};
    completedKeys = [];
    spring.completed = false;
  }

  function getValue() {
      return current;
  }

  const spring = {
    completed: false,
    stiffness,
    damping,
    precision,
    mass,
    update,
    getValue,
    setValue,
    target
  };

  spring.setValue(start);

  return spring;
}

function createSpring(start, options) {
  return createObjectSpring(start, options);
}

// sc0ttj - component specific stuff below

// dont export this, we create the spring for the user, below
//export default createSpring;


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

const springTo = function(self, newState, springCfg) {
  let spring;
  let timeout;
  
  const defaults = {
    onUpdate: noop,
    onComplete: noop,
  };

  const cfg = {
    ...defaults,
    ...springCfg,
    // wrap the users callbacks, so they receive the current tweened values as props
    onStart: props => {
      console.log('onStart => props', props);
      const tweenedState = setTweenedValues(newState, [...props.values])
      return springCfg.onStart(tweenedState)
    },
    onUpdate: props => {
      console.log('onUpdate => props', props);
      const tweenedState = setTweenedValues(newState, [...props.values])
      console.log('onUpdate => tweenedState', tweenedState);
      if (frame === 1) cfg.onStart(props);
      return springCfg.onUpdate(tweenedState)
    },
    onComplete: props => {
      console.log('onComplete => props', props);
      const tweenedState = setTweenedValues(newState, [...props.values])
      return springCfg.onComplete(tweenedState)
    },
  };

  // get a state matching the shape of newState, but with values from self.state
  const stateToTween = getStateToTween(self.state, newState)

  // define the spring
  spring = createSpring(stateToTween, { ...defaults, ...springCfg });

  // console.log({
  //   stateToTween,
  //   newState,
  //   springConfig: { ...defaults, ...springCfg },
  //   spring,
  // });

  // pass the values to animate
  spring.target(newState);

  // define the animation loop
  function loop() {
    spring.update(frame);
    frame += 1;
    timeout = requestAnimationFrame(loop);
  }

  // start the loop
  let frame = 1;
  requestAnimationFrame(() => loop())

};

export default springTo;

