<p align="center">
  <img align="center" src="https://i.imgur.com/yL240c7.png" alt="Component logo" />
  <h1 align="center">
    <b>Component</b>
  </h1>
    <p align="center"><i>A simple JavaScript component thing</i><p>
</p>

[![npm version](https://badge.fury.io/js/%40scottjarvis%2Fcomponent.svg)](https://badge.fury.io/js/%40scottjarvis%2Fcomponent) [![Node version](https://badgen.net/npm/node/@scottjarvis/component)](http://nodejs.org/download/) [![Build Status](https://travis-ci.org/sc0ttj/component.svg?branch=master)](https://travis-ci.org/sc0ttj/component) [![bundle size](https://badgen.net/bundlephobia/minzip/@scottjarvis/component?color=green&label=gzipped)](https://badgen.net/bundlephobia/minzip/@scottjarvis/component) [![Downloads](https://badgen.net/npm/dt/@scottjarvis/component)](https://badgen.net/npm/dt/@scottjarvis/component)

**Component** is a simple, "stateful component" thing.

It lets you create re-usable, "functional components" - basically functions that have a "state". 

A "state" is a snapshot of your application data at a specific time.

## Features

- Easy setup, **zero dependencies**:
  - no compilation or build tools needed
- Simple syntax, quick to learn, **easy to use**:
  - plain, vanilla JavaScript only!
  - plain HTML & CSS, no virtual DOM or JSX
  - should work with any test suite
- Very **lightweight & modular** - use only what you need, for example:
  - *~2.2 kb*, using the main `Component` library (_lots_ of features)
  - *~810 bytes*, using only the standalone `htmel` module (for JSX-like HTML templating)
  - *~830 bytes*, using only the standalone `render` module (for "debounced" DOM diffing at 60fps)
- Works **client-side**, in browsers:
  - auto re-render on state change
  - good (re)rendering/animation performance at 60fps, using `requestAnimationFrame`
  - DOM diffing uses real DOM Nodes (not VDOM)
- Works **server-side**, in Node:
  - render your components as strings (HTML, or stringified JSON)
  - render your components as data (JS objects, Arrays, etc)
- Easy **state management**:
  - immutable states, can only be updated through `setState()` (_optional_)
  - define "actions" to easily update the state in specific ways
  - log all states in a history, for debugging (_optional_):
    - rewind or fast-forward to any point in the state history
    - save/load current or any previous state as "snapshots"
- Easy CSS **component styling**:
  - Automatic "scoping"/prefixing of your component CSS (_optional_)
  - Re-render styles on component CSS change (_optional_)
- Supports **"middleware"** functions:
  - easily customise a components setState and re-render behaviour
- Supports **nested components**:
  - embed components in the "views" of other components
  - supports various methods and syntaxes
- Works with these **optional add-ons**:
  - `validator`: validate states against a schema (_like a simple PropTypes_)
  - `html`/`htmel`: simpler, more powerful Template Literals (_like a simple JSX_)
  - `emitter`: an event emitter - share updates between components
  - `tweenState`: animate nicely from one state to the next (tweened)
  - `springTo`: animate nicely from one state to the next (using spring physics)
  - `onScroll`:  enables easy scroll-based animations (using debounced scroll event)
  - `useAudio`: add dynamic audio to your components (uses Web Audio API)
  - `storage`: enables persistent states (between page refreshes, etc)
  - `syncTabs`: Synchronize state updates & page renders between browser tabs
  - `devtools`: enables easier component debugging in the browser

---

## Quickstart

Here's some quick examples to demo how it all looks, generally:

### "Counter" app

```js
const Counter = new Component({ count: 1 });

const add = num => Counter({ count: Counter.state.count + num })

Counter.view = props => htmel
  `<div>
    <h1>Counter: ${props.count}</h1>
    <button onclick="${e => add(+1)}"> + </button>
    <button onclick="${e => add(-1)}"> - </button>
  </div>`;

Counter.render('.container')
```

### "Todo list" app

```js
const Todo = new Component({ txt: '', list: [ "one" ] });

const setText = e => Todo({ txt: e.target.value });
const addItem = e => Todo({ list: [ ...Todo.state.list, Todo.state.txt ] });

Todo.view = props => htmel
  `<div>
    <h1>Todo</h1>
    <input  onkeyup="${setText}" value="${props.txt}" type="text" />
    <button onclick="${addItem}"> Add Note </button>
    <ul>
      ${props.list.map(i => `<li>${i}</li>`)}
    </ul>
  </div>`;

Todo.render('.container')
```

### A *re-usable* HTML component:

Here is a "factory" function that generates _re-usable_ components - a new component is created and returned each time it's called.

```js
function Header(state) {
  const Header = new Component({ title: "Hello world", ...state });
  Header.view = props => `<h1>${props.title}</h1>`;

  return Header;
}

// And you use it like this:
const header1 = new Header();

// Add it to our page
header1.render('.container');

// Update the state, the heading will re-render for you
header1.setState({ title: "Hello again!" });

// Or set state via the component constructor
header1({ title: "Hello a 3rd time!" });
```

### Nested components

Child components should be regular functions that return part of the view of the parent component:

```js
const Foo = new Component({ title: "Hey!", items: [ "one", "two" ] });

const Header = txt => `<h2>${txt}</h2>`
const List   = i   => `<ul>${i.map(item => `<li>${i}</li>`).join('')}</ul>`

Foo.view = props => 
  `<div id="myapp">
    ${Header(props.title)}
    ${List(props.items)}
  </div>`

Foo.render('.container');  
```

But you can also nest proper (stateful) components inside other components, too:

```js
// create a re-usable button component
function Button(state) {
  const Button = new Component(state);
  Button.view = props => htmel`<button onclick="${props.fn}">${props.txt}</button>`;

  return Button;
}

// create 3 buttons from the re-usable component
const btn1 = new Button({ txt: "1", fn: e => alert("btn1") });
const btn2 = new Button({ txt: "2", fn: e => alert("btn2") });
const btn3 = new Button({ txt: "3", fn: e => alert("btn3") });

// create the parent component
const Menu = new Component({ txt: 'Click the buttons!' });

// create a view with our buttons included
Menu.view = props => htmel`
  <div>
    <h2>${props.txt}</h2>
    ${btn1}
    ${btn2}
    ${btn3}
  </div>
`;

Menu.render('.container');
```

See more short recipes in [examples/recipes.js](examples/recipes.js).

---

## Installation

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script>
  // use it here
</script>
```

### In NodeJS:

```
npm i @scottjarvis/component
```

Then add it to your project:

#### ES6 Modules:

```js
import { Component } from '@scottjarvis/component'

// use it here
```

#### Using NodeJS `require()`:

```js
var { Component } = require('@scottjarvis/component');

// use it here
```

See each add-on module (`validator`, `html`, `htmel`, `emitter`, `storage`, `tweenState`, etc) for their respective installation instructions.

---

## Usage

### In browsers

Create interactive components for your web pages:

- [examples/usage-in-browser--table.html](examples/usage-in-browser--table.html)
- [examples/usage-in-browser.html](examples/usage-in-browser.html)

### In NodeJS

Or you can do "server-side rendering" (SSR) of your components:

See [examples/usage-in-node.js](examples/usage-in-node.js)

Or run it in your terminal:

```
node examples/usage-in-node.js
```

## Component API overview

These are the methods and properties attached to the components you create.

### Methods:

- **.setState(obj)**: update the component state, triggers a re-render
- **.render(el)**: (re)render to the given element on state change (browser)
- **.toString()**: render your component as a string on state change (for NodeJS)
- **.view(props)**: receives a state and sets the component view to (re)render (_optional_)
- **.style(props)**: receives a state and sets the `<style>` to (re)render (_optional_)
- **.actions(obj)**: chainable methods that simplify updating the state (_optional_)
- **.tweenState(obj[, cfg])**: set state on each frame, supports various easings (_optional_)
- **.middleware**: an array of functions that run at the end of `setState()` (_optional_)
- ...and more

### Properties:

- **.state**: an object, contains your app data, read-only - cannot be modified directly
- **.schema**: an object against which to validate your component state (_optional)_ 
- **.container**: the HTML Element into which the components view is rendered (_optional_)
- **.html**: alias of `.container`
- **.css**: the `<style>` Element which holds the component styles (_optional_)
- **.uid**: a unique string, generated once, on creation of a component
- **.log**: an array containing a history of all component states
- ...and more

### Settings:

- **.immutable**: if `true`, then `setState()` updates _then "freezes"_ the current state. Default = `true`.
- **.reactive**: if `false`, disables auto re-rendering on state change. Default = `true`.
- **.scopedCss**: if `false`, disables auto-prefixing `.style()` CSS . Default = `true`.
- **.debug**: if true, a record of states changes are kept in `.log`. Default = `false`.

## Using "state validation"

You can validate your component state against a schema, before you set state or render anything. If the data to set doesn't match a components state schema, an error will be thrown.

This is a similar concept to `propTypes` in React, but a bit simpler.

First, install a tiny (~300 bytes) additional dependency:

```js
npm i @scottjarvis/validator
```

Then enable it:

```js
const { Component } = require("@scottjarvis/component")
Component.validator = require("@scottjarvis/validator")
```

Define a schema object. For each property included, the value should be:

- a `typeof` type name, as a string
- or a validator function, that returns true or false

Then create your component, passing in the schema as the second parameter to `Component()`. 

```js
function Foo() {
  const defaults = { 
    count: 0, 
    age: 20 
    items: [ "one", "two" ],
    foo: {
      bar: "whatever"
    }
  };

  const schema = { 
    count: "number",
    age: age => typeof age === "number" && age > 17,
    items: "array",
    foo: {
      bar: "string"
    }
  };

  // pass in the schema as the 2nd param
  const Foo = new Component(defaults, schema);

  return Foo;
}
```

If you try to set an invalid state, your component will `throw` an error:

```js
const foo = new Foo();
foo.setState({ count: "a string" }) // this will throw an Error!
```

See [`@scottjarvis/validator`](https://github.com/sc0ttj/validator) for more usage info.

## Using "middleware"

Using "middleware" functions you can extend your components `setState`/`render` behaviour, and make other stuff happen at the end of the `setState()` method.

Here's how to use "middleware" functions:

1. Define some "middleware" function(s) - these will be called at the end of `setState()`
2. Add your "middleware" to a component - as an array of functions

Your middleware functions receive the latest state of the host component, as `props`.

```js
// Define the middleware functions
const countLogger = props => console.log("count = ", props.count)

function Foo() {

  const Foo = new Component({ count: 0 })

  Foo.view = props => `<p>${props.count}</p>`

  // Add the middleware to your component
  Foo.middleware = [countLogger]

  return Foo;
}

const foo = new Foo();
foo.setState({ count: 1 }) // will run the middleware
```

See [examples/usage-in-node.js](examples/usage-in-node.js) for the complete example.

## Using the "state history"

Here is how to "time travel" to previous states, or jump forward to more recent ones.

Note: To enable the state history, `foo.debug` must be `true`.

```js
const foo = new Foo();

// enable logging of state history
foo.debug = true

// Take a "snapshot" (we'll use it later)
var snapshot = foo.state

// ...later

foo.rw()    // go to initial state
foo.ff()    // go to latest state
foo.rw(2)   // rewind two steps to a previous state
foo.ff(2)   // fast-forward two steps to a more current state

// Set a previous state
foo.setState(foo.log[0].state)

// Set a "named" state, from a previous point in time
foo.setState(snapshot)
```

## Using component CSS

You can insert styles into your view, and update them using `props`, like any other state properties.

However, with the `.style()` method you can separate your components styles from its view (_optional_):

```js
function Foo(props) {

  const Foo = new Component(props)

  Foo.view = props => `<h1>${props.txt}</h1>`

  // style the view with standard CSS
  Foo.style = props => `
    h1 {
      background-color: ${props.bgColor || 'red'};
    }
  `

  return Foo;
}
```

If using `style()`, the CSS will be auto-prefixed with the `id` or CSS `class` of the components container, when the component is first added to the page using `foo.render('.container')`.

_This CSS "auto-scoping" will prevent a components styles affecting other parts on the page_. It also keeps your component CSS clean - no need to prefix anything with a unique ID or class yourself. 

- If your container has no class or id attributes, then a unique string, `foo.uid`, will be used instead.
- You can disable automatic CSS "scoping"/prefixing by using `foo.scopedCss = false`.
- When rendering your component in NodeJS, or using `foo.toString()`, your CSS will **not** be auto prefixed.

To see `style()` in use, see [examples/usage-in-browser.html](examples/usage-in-browser.html)

## Using "actions"

Define "actions" to update your state in specific ways.

These are like regular methods, except they're always chainable, they hook into the [emitter](#using-the-emitter-module) add-on automatically, and they're tagged by name in your components state history. 

```js
function Foo() {
  const Foo = new Component({ count: 0, items: [] });

  // define the actions
  Foo.actions({
    plus:       props => Foo({ count: Foo.state.count + props }),
    minus:      props => Foo({ count: Foo.state.count - props }),
    addItems:   props => Foo({ items: [ ...Foo.state.items, ...props ] }),
  });

  return Foo;
}

const foo = new Foo();

// use "actions" to update specific parts of your state
foo.plus(105);
foo.minus(5);

// A components "actions" can be chained
foo.minus(1)
   .minus(1)
   .plus(3)
   .addItems([ { name: "one" }, { name: "two" } ]);
```

Using the add-on [emitter](#using-the-emitter-module) module, components can listen for and react to these actions. This is an easy way to share states between components, and for components to "talk to each other".

## Using the `emitter` module

Any time a components state is changed via an "action", it can emit an event that other components can listen for - the "listener" will receive the state of the component that emitted the event.

To achieve this, just include the emitter like so:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/emitter.min.js"></script>
<script>
  Component.emitter = emitter

  // use it here
</script>
```

### In NodeJS:

```js

var { Component, emitter } = require("@scottjarvis/component");
Component.emitter = emitter;
```

The emitter listens for "actions" using the following "listening" methods - `on()`, `off()` and `once()`.

Each method receives the latest state of the component that emitted the "action" being listened to.

Here's how to use the emitter:

Let's listen to the `foo` components actions, using another component, `logger`:

```js  
// Define some listening component
const logger = new Component({})

// Define "listeners"
logger
  .on('plus',     props => console.log('plus',     props.count))
  .on('addItems', props => console.log('addItems', props.items))
  .once('minus',  props => console.log('minus',    props.count))

// ...now we're ready to run the program..

const foo = new Foo();

// these "actions" will trigger the logger
foo.plus(105)
foo.minus(5)

// stop listening to the "plus" action, keep listening to others..
logger.off('plus')

foo.minus(1)
  .minus(1)
  .plus(3)
  .addItems([{ name: "two" }, { name: "three" }])
```

Also see [examples/usage-emitter.js](examples/usage-emitter.js)

## Using your own Event Listeners

To add your own Event Listeners, you should add them to the container of your components:

```js
// render a component into the page to get its HTML
foo.render('.container');

// now we have the `.html` property on our component, we can use it
foo.html.addEventListener("click", e => {
    // get the element clicked
    const el = e.target.className;
    // work out what to do next
    if (el === "foo") {
      // ...
    } else if (el === "bar") {
      // ...
    }
});
```

## Using the `storage` module

The storage module makes components remember their state between page refreshes, using `localStorage`.

Note that `storage` can be polyfilled for NodeJS, so works in Node too - by saving to JSON files. 

- In NodeJS, the state persists between script invocations, rather than page refreshes.

To use the `storage` add-on, include it in your project like so:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/storage.min.js"></script>
<script>
  Component.storage = storage

  // use it here
</script>
```

### In NodeJS:

```js
var { Component, storage } = require('@scottjarvis/component');
Component.storage = storage

// use it here

```

To enable persistent state storage, only need to define a **store name** (where to save your data), like `myComponent.store = "something"`.

**In a browser**, this is how you add persistent storage to our Counter app:

```js
const Counter = new Component({ count: 1 });

const add = num => Counter({ count: Counter.state.count + num })

Counter.view = props => htmel`
  <div>
    <h1>Counter: ${props.count}</h1>
    <button onclick="${e => add(+1)}"> + </button>
    <button onclick="${e => add(-1)}"> - </button>
  </div>`;

// simply define a "store name" (where to save your data) before you render
Counter.store = 'Counter';

// now we can render it into the page - it'll load in the last state 
// from its localStorage "store" as the initial state
Counter.render('.container')
```

**In NodeJS**, this is how you add persistent storage to our Counter app:

- install the NodeJS localStorage polyfill: `npm i node-localstorage -D`
- run your scripts with the `-r node-localstorage/register` option to enable it
- the "local storage" used will be a local folder/file, called `./scratch/<store name>`

Example command, running a component with a persistent state in NodeJS:

```
node -r node-localstorage/register examples/usage-persistant-state.js
```

See [examples/usage-persistant-state.js](examples/usage-persistant-state.js) for more info.

## Using the `syncTabs` module

Give your components a persistent state that is synchronized across multiple browser tabs - an update in one tab will update the others.

The `syncTabs` add-on uses `storage` (above) and only works in browsers.

How to use it:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/storage.min.js"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/syncTabs.min.js"></script>
<script>
  Component.storage = storage
  Component.syncTabs = syncTabs

  // now it's enabled
</script>
```

## Using the `tweenState` module

With `tweenState` it's super easy to do animations that use `requestAnimationFrame` and DOM diffing.

Using `tweenState()` is much like using `setState()`, except:

- you only pass in the state values you want to tween
- you can pass in tween settings as a 2nd param (delay, duration, easing, callbacks)

How it works:

By default, `tweenState()` calls `setState()` on every frame of the tweened animation. You can override this behaviour by defining a `shouldSetState()` callback in your tween config, which is called on every frame - `setState()` will only be called on that frame if `shouldSetState()` returns true.

To use `tweenState`, import it along with Component, like so:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/tweenState.min.js"></script>
<script>
  Component.tweenState = tweenState

  // use it here
</script>
```

### In NodeJS:

Note that `tweenState` includes polyfills for NodeJS, so works in Node too.

```js
var { Component, tweenState } = require('@scottjarvis/component');
Component.tweenState = tweenState

// use it here

```

Example usage of `tweenState`:

```js
// Define our app state
var state = {
  ignore: "me",
  count: 199,
  foo: 1,
  dontTween: "this property",
  bar: {
    zzz: 100
  }
}

// Define a stateful main component
var App = new Component(state)

// Tween (animate) from one state to the next:
// Give the state to tween to, with some tween options as the (optional) 2nd param

App.tweenState(
  // 1st param - object - the new state values to tween to...
  // pass in only the properties that you want to tween!
  { count: 200, foo: 10, bar: { zzz: 999 } },
  // 2nd param - object - the tween settings
  {
    delay: 0,
    duration: 500,
    ease: "linear",
    paused: false,
    // called on first frame:
    onStart: tweenProps => tweenProps,
    // called on every frame:
    onUpdate: tweenProps => tweenProps,
    // called on last frame:
    onComplete: tweenProps => tweenProps,
    // called on every frame, choose to set state or not (must return true or false)
    shouldSetState: tweenProps => tweenProps.frame % 2 > 0, // for example, this will set state only on odd frame numbers
    // called only on the frames where the state was updated:
    onSetState: tweenProps => tweenProps
  }
)
```

The tween config (2nd param) takes the following properties:

- `delay` in milliseconds (default: `0`)
- `duration` in milliseconds (default: `0`)
- `ease` - the name of a timing function  (default: `linear`, see `src/easings.js` for the full list)
- `paused` - true or false (default: `false`)
- `shouldSetState()` - called on every frame, receives `tweenProps`, should return true or false
- `onSetState()` - called only on frames where the state is updated, receives `tweenProps`
- `onStart()` called on the first frame, receives `tweenProps`
- `onUpdate()` called on every frame, receives `tweenProps` on each frame
- `onComplete()` called after last frame, receives final `tweenProps` 

The `tweenProps` object returned to callbacks provides the tweening values of the current frame, and includes:

- `progress` - a number from `0` to `1` (so `0.5` is half-way through the tween)
- `frame` - the current frame number
- `frameTotal` - the total number of frames
- `values` - an array of the tweened values
- `tweenedState` - the state of your component on the current frame
- and more...

Also see [examples/usage-tweenState.js](examples/usage-tweenState.js)

## Using the `springTo` module

With `springTo` it's easy to do spring-physics based animations, for lively, bouncy, dynamic animations which are really hard to achieve with tweening alone.

Using `springTo()` is much like using `setState()`, except:

- you only pass in the state values you want to animate
- you can pass in spring settings as a 2nd param (mass, stiffness, callbacks, etc)

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/springTo.min.js"></script>
<script>
  Component.springTo = springTo

  // use it here
</script>
```

### In NodeJS:

Note that `springTo` includes polyfills for NodeJS, so works in Node too.

```js
var { Component, springTo } = require('@scottjarvis/component');
Component.springTo = springTo

// use it here

```
### Example usage of `springTo`:

```js
// 1. define a component and render it to the page
const Foo = new Component({ x: 100, y: 100 });

Foo.view = props => `<div style="top:${props.y - 25}px;left:${props.x - 25}px"></div>`;

Foo.style = props => `div { 
  background-color: #d11;
  border: 2px solid #222;
  border-radius: 50%;
  height: 50px;
  width: 50px;
  position: absolute;
}`;

Foo.render('.container');

// 2. listen to clicks on the page and spring the component to click location
document.addEventListener('click', function(e) {

  // get mouse position on click
  const rect = e.target.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  // use "springTo" to animate the component
  Foo.springTo(
    // 1st param - the state values to animate to (pass in only the values you want to animate!)
    { x: mouseX, y: mouseY },
    // 2nd param - the spring settings
    {
      mass: 4.0,       // higher is slower/more drag         Default = 1.0
      stiffness: 0.5,  // higher is more "bouncy"            Default = 0.1
      damping: 0.8,    // higher is more "friction"          Default = 0.8
      precision: 0.01, // higher values finish anim sooner   Default = 0.01
      onUpdate: props => Foo.setState({ x: props.x, y: props.y }),
      onComplete: props => console.log("Moved to:", { x: props.x, y: props.y }),
    });
});
```

The spring config (2nd param) takes the following properties:

- `mass`: higher is slower/more drag. Default = 1.0
- `stiffness`: higher is more "bouncy". Default = 0.1
- `damping`: higher is more "friction". Default = 0.8
- `precision`: higher values finish anim sooner. Default = 0.01
- `onUpdate()`:  called on every frame, receives current animation values as `props`
- `onComplete()`: called on the last frame, receives current animation values as `props`

The `props` object returned to the callbacks contains:

- any properties that you passed in, with their current value(s)
- `frame` - the current frame number
- `acceleration` - the acceleration of the spring at current frame
- `velocity` - the velocity of the spring at current frame

Also see [examples/usage-spring-animation.html](examples/usage-spring-animation.html)

## Using the `onScroll` module

With the optional `onScroll` add-on, it's easy to do scroll-based animations. Works in browsers only (not NodeJS).

You can define a function to run on scroll, on a per-component basis, and set (an invisible) marker line (offset from top) through which a components view must pass to trigger/drive the animations.

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/onScroll.min.js"></script>
<script>
  Component.onScroll = onScroll

  // use it here
</script>
```

### In ES6:

```js
import { Component, onScroll } from '@scottjarvis/component';

Component.onScroll = onScroll

// use it here

```

Here's how to actually use it to drive an animation:

```js
const Foo = new Component({ percent: 0 });

Foo.view = props => `
  <p id="scroll-progress-monitor">
    progress: ${props.percent}%
  </p>
`;

// set the marker line through which elements must pass to trigger the animation:
// - 50  means 50%, which is halfway down the screen, 
// - 33  means 33% down from top,
// - 100 means at bottom of screen
Foo.onScroll.offset = 33; 

// now we can add the scroll event to the component
Foo.onScroll(scrollProps => {
  Foo.setState({ 
    percent: Math.floor(scrollProps.progress * 100) 
  });
});

// now render it to the page
Foo.render('.container');
```

The `scrollProps` param received by your given function contains the following properties:

- `progress`: progress of the component past the marker line, starts at `0.0`, ends at `1.0`
- `frame`: the frame count (resets once progress reach `0.0` or `1.0`)
- `totalFrames`: total frame count (from requestAnimationFrame)
- `direction`: the direction of the scroll (either `up` or `down`)

Also see [examples/usage-onScroll.html](examples/usage-onScroll.html)

## Using the `useAudio` module

Provides an audio add-on, powered by the Web Audio API, for highly performant, timing-sensitive sounds. Useful for games, audio applications and visualizations. Works in browser only (not in NodeJS).

`useAudio` can work with Component, or it can be used "standalone".

To use `useAudio` with Component:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/useAudio.min.js"></script>
<script>
  Component.useAudio = useAudio

  // use it here
</script>
```

### In ES6:

```js
import { Component, useAudio } from '@scottjarvis/component';

Component.useAudio = useAudio

// use it here

```

### Example usage of `useAudio` with `Component`:

If used as a Component add-on, each component gets a `myComponent.useAudio({ ... })` method attached to it when it's created, and is then responsible for its own sounds only.

```js
const Foo = new Component({});

Foo.useAudio({
  sound1: 'foo.mp3',
  mySound: 'bar.mp3',
});

document.addEventListener('audioLoaded', function audioLoaded(e) {
  // you can now use the sounds
  const { mySound, sound1 } = Foo.audio;

  Foo.view = props => htmel
    `<div>
      <button onclick="${mySound.play}">Click me</button>
    </div>`;

  Foo.render('.container');
});

```

### Example usage of `useAudio` standalone:

```html
<script src="https://unpkg.com/@scottjarvis/component/dist/useAudio.min.js"></script>
<script>
  const audio = useAudio({
    sound1: 'foo.mp3',
    mySound: 'bar.mp3',
  });

  document.addEventListener('audioLoaded', function audioLoaded(e) {
    // you can now use the sounds
    const { mySound, sound1 } = audio;
    mySound.play();
  });
</script>
```

### Using your sounds 

The `useAudio({ ... })` method generates sound objects with the following methods:

- `mySound.play()` - play a sound
- `mySound.pause()` - pause a playing sound
- `mySound.playFrom(time)` - play from the given time (in seconds)
- `mySound.rapidFire(num, delay)` - play `num` times, with `delay` seconds between 
- `mySound.fadeIn(duration)` - fade in over `duration` (in seconds)
- `mySound.fadeOut(duration)` - fade out over `duration` (in seconds)
- `mySound.stop(atTime)` - stop at given time (leave empty for immediate stop)
- `mySound.mute()` - set a sounds volume to zero
- `mySound.unmute()` - restore a sounds volume to its previous value
- `mySound.connectTo(otherSound)` - connect sounds together to play them (etc) at the same time
- `mySound.settings({ ... })` - adjust all the sounds properties, even during playback


### Defining advanced sound objects

Sounds can have many properties, which you can define when you create them, or adjust later, using `mySound.settings({ ... })`. 

Lets define a sound with all possible properties enabled:

```js
Foo.useAudio({
  heroVoice: {
    src: 'sounds/speech.mp3',
    volume: 0.20,       // min 0, max 1
    loop: false,        // true or false
    playbackRate: 1,    // 1 is normal speed, 2 is double speed, etc
    filters: {
      delay: 0,         // give a duration, in seconds, like 0.2
      panning: -1,      // -1 is left, 0 is center, 1 is right
      // add any combination of "biquad" filters 
      // (see https://developer.mozilla.org/en-US/docs/Web/API/BiquadFilterNode)
      lowshelf:  { freq:  400, gain: 0.2 },
      highshelf: { freq: 1200, gain: 0.2 },
      lowpass:   { freq:  400, q: 0.1 },
      highpass:  { freq: 1200, q: 0.1 },
      allpass:   { freq: 1200, q: 0.1 },
      bandpass:  { freq:  800, q: 0.5 },
      peaking:   { freq:  800, gain: 0.2, q: 0.5 },
      notch:     { freq:  800, q: 0.5 },
      // or add an array of filters into a customisable "equalizer"
      equalizer: [
        { freq:  200,  q: 0.25, },           // lowpass filter
        { freq:  800,  q: 0.25, gain: 0.9 }, // peaking filter(s) (can have many)
        { freq:  1200, q: 0.25,  },          // highpass filter
      ],
      // add a "reverb" or "echo" effect
      reverb: {
        duration: 1,
        decay: 1,
        reverse: true,
      },
      // how much to randomise various properties each time a sound is played
      randomization: {
        volume: 0.8,
        playbackRate: 0.6,
        startOffset: 0.0001,
        delay: 0.01,
      },
      // this enables the analyser node, useful for audio visualizations
      analyser: {
        fftSize: 2048,
        minDecibels: -100,
        maxDecibels: -30,
        smoothingTimeConstant: 0.8,
      },
      // can be used to prevent clipping and distortions
      compression: {
        threshold: -50.0,
        knee: 40.0,
        ratio: 12.0,
        attack: 0.0,
        release: 0.25,
      },
    },
    // callbacks 
    onPlay: props => console.log(props),   // props is the current state of the sound,
    onPause: props => console.log(props),  // and includes all settings for the filters
    onResume: props => console.log(props), // that you have enabled
    onStop: props => console.log(props),
    onChange: props => console.log(props),
  },
});
```

You can change any of these settings later, even during playback.

For best results, it's recommended to define up front (when creating your sounds) any properties that you intend to change during playback.

However, this is not required, as `useAudio` will rebuild a sounds AudioNodes graph (connections) during playback, if required - you can see this in action in [examples/usage-audio.html](examples/usage-audio.html) where reverb is added and then removed, while the sound plays.

### Updating your sounds settings

You can change any/all properties of the sounds state, even during playback, with the `.settings()` method:

```js
mySound.settings({
  reverb: { decay: 2 },
  volume: 1,
});
```

You can also update _all_ sounds attached to a component at once, using the following:

```js
// Foo is our component from above, edit all its sounds at once
Foo.audio.settings({
  reverb: { decay: 2 },
});
```

Calling `.settings()`, both on a single sound or on a library of sounds, will trigger the `onChange()` callback. 

The settings method can also take a callback as a second parameter, which is run after the settings have been changed:

```js
mySound.settings(
  // pass in the properties to change
  { reverb: { decay: 2 }, volume: 1 },
  // pass in the callback to run
  function(props) {
    console.log('State updated, and now contains: ', props);
  }
);

```

See [examples/usage-audio.html](examples/usage-audio.html) for examples and more information.

## Using `html` and `htmel` modules

To make it easier to build a good HTML "view" for your components, there are two **optional** add-on functions which provide a nicer way to write HTML in JavaScript "Template literals".

These return your components view as either a String or HTML Object, but are otherwise mostly inter-changeable:

- `html`  (~650 bytes) - returns your template as a String.
- `htmel` (~800 bytes) - returns your template as an HTML Object (browser) or String (NodeJS).

Note that both `html` and `htmel` can be used standalone (without `Component`) for general HTML templating.

```js
// Example of using `html` or `htmel` standalone, without any `Component` stuff:

const foo = "Hello world"

const str = html`<h1>${foo}</h1>` // `html`  returns a string
const el = htmel`<h1>${foo}</h1>` // `htmel` returns a DOM Node

// ..or in functions that return pre-defined HTML snippets from templates:

const para = text => htmel`<p>${text}</p>`

const list = array => htmel`<ul>${array.map(text => `<li>${text}</li>`)}</ul>`

// now generate the DOM elements
const p  = para("Put me in a paragraph.")
const ul = list([ "one", "two", "three" ])
```

To use `html` or `htmel` (or both), import them [optionally along with Component], like so:

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/html.min.js"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/htmel.min.js"></script>
<script>
  // use them here
</script>
```

### In NodeJS:

```js
var { Component, html, htmel } = require('@scottjarvis/component');

// use them here

```

Features of both `html` and `htmel`:

```js
// embed JS object properties as valid HTML attributes  (ignores nested/child objects)
html`<p ${someObj}>some text</p>`
```

```js
// embed JS object properties as CSS (ignores nested/child objects)
html`<p style="${someObj}">some text</p>`
```

```js
// embed JS objects as JSON in HTML data attributes
html`<p data-json='${someObj}'>some text</p>`
```

```js
// embed real DOM objects 
const elem = document.querySelector(".foo");
const elems = document.querySelectorAll(".bar");
html`<div>${elem}${elems}</div>` 
```

```js
// embeds arrays properly, no need to use .join('')
html`<ul>${list.map(i => `<li>${i}</li>`)}</ul>`
```

```js
// hides Falsey values, instead of printing "false", etc
html`<span>some ${foo && `<b>cool</b>`} text</span>`
```

```js
// nested templates
var TableRows = props => props.map(row =>
  html`<tr>
    ${row.map((item, i) => `<td>${row[i]}</td>`)}
  </tr>`);

var Table = props => html`
  <table>
    <tbody>
      ${TableRows(props.data)}
    </tbody>
  </table>`;
```

Features of `htmel`:

In a browser, you can use `htmel` instead of `html` to return DOM Nodes (instead of strings):

```js
// returns a text node
htmel`I’m simply text.`
```

```js
// returns an HTML node
htmel`<p>I’m text in an element.</p>`
```

```js
// supports HTML fragments
htmel`<td>foo</td>`
```

If using `htmel` in a browser, you can also embed functions as event attributes - they'll be attached to the relevant HTML Elements as proper Event listeners:

```js
// embed functions - they'll be attached as Event listener methods
htmel`<p onclick="${e => console.log(e.target)}">some text</p>`
```

### Example usage of `htmel` with `Component`:

```js
// Let's define a component with a view, using `htmel`
function Foo(state, schema) {

  const defaults = {
    css: {
      "border": "2px solid red",
      list: {
        "padding": "8px",
      }
    },
    attrs: {
      "class": "foo bar",
      "z-index": 2,
    },
    text: "My Title:",
    list: [
      "one",
      "two",
    ],
    status: false,
    someFunc: function(event) { console.log(event); }
  };

  const Foo = new Component({ ...defaults, ...state }, schema);

  // now let's use `htmel` to construct an HTML view..
  
  Foo.view = props => htmel`
    <div style="${props.css}" ${props.attrs}>
      <h2>${props.title}</p>
      <p>${props.text}</p>
      <ul style="${props.css.list}">
        ${props.list.map(val => `<li>${val}</li>`)}
      </ul>
      ${props.status && `<p>${props.status}</p>`}
      <button onclick="${props.someFunc}">Click me</button>
    </div>
  `;

  return Foo;
} 
  
```

## Using JSON-LD (linked data)

Adding linked data to your components is easy - just define it as part of your view:

```js
  Foo.view = props => `
    <div>
      <script type="application/ld+json">{ ... }</script>
      ...
    </div>`
  ```

- add a JSON-LD script before your component HTML
- use the `props` passed in to define/update whatever you need
- your JSON-LD will be updated along with your view, whenever your component re-renders

## Using "nested components"

Components that are nested inside other components are called _child components_.

All child components have the following in common:
- you include the child component in the "view" of the parent component
- child components do not trigger a re-render of the page
- to re-render a child component that has changed, you must re-render the parent component 
- nested components work with or without the `html`/`htmel` add-on(s)

There are two kinds of child component - _stateless_ and _stateful_ - and while they behave the same in most ways, they have slightly difference syntax and features.

### 1. Using "stateless" child components:

Stateless components are just _regular functions_ that take `props` as input, and return a view - usually HTML as a string.

```js
// a stateless child component 
const h2 = text => `<h2>${text}</h2>`;

// ...used inside the view of another component
Foo.view = props => `
  <div>
    ${h2(props.text)}
    <p> ... </p>
  </div>
`;
```

### 2. Using "stateful" child components:

Stateful components are _any components with a state_, usually created like so:

```js
const Foo = new Component({ ...someData });
```

NOTE: When nested inside another component, even stateful child components _do not_ run their own `setState()` & `render()` methods - they simply return their (newly updated) view.

This has a number of implications:

- better performance (fewer page re-renders)
- enforces similar behaviour to stateless child components:
  - i.e, only parent components trigger page re-renders
  - child components have no `.container` property
- calling `setState()` of a stateful child component:
  -  _will_ update its state and run its "middleware"
  - will _not_ re-render anything!

For code examples, see the nested component recipes in [examples/recipes.js](examples/recipes.js).

## Using a more "React-like" pattern 

For more "React-like" patterns, you can import a standalone `render` method (~800 bytes) that's supposed to be used with some *optional* React-like "hooks" (~1.5kb), but _without_ `Component` itself.

Features of `render`:

- adds your HTML or component to the page
- updates the page using DOM diffing, inside a debounced `requestAnimationFrame`
- works nicely with the optional `html` add-on
- works nicely with the optional `hooks` add-on 
- a React-like API in 2.3kb (inc all the hooks)
- that's it

Usage:

```js
import { render } from "@scottjarvis/component"

render(`<p>Hey</p>`, ".container")
```

Example without any "hooks" addons:

```js
const liteComponent = props => {
  this.state = { ...this.state, ...props }
  return html`<div>...</div>`
}

// ..add to page using render
render(liteComponent({ ...someData }), '.container')
```

Example using "hooks":

- Supported hooks: `useState`, `useReducer`, `useEffect`, `useMemo`, `useCallback`, `useRef`, `useDeferred`, `useThrottle`

```js
import { render, html, hooks } from "@scottjarvis/component"

// import "useHooks", and the hooks you want to use
const { useHooks, useState } = hooks

const countUp = props => {
  [ count, setCount ] = useState(0)
  setCount(count + props)
  return html`<div>${count}</div>`
}

// this is required to "connect" the hooks to your component
countUp = useHooks(countUp);

// re-render to page, counting up each time
render(countUp(1), '.container')
render(countUp(1), '.container')
render(countUp(1), '.container')
```

Note, this "React-like" pattern uses the excellent [getify/TNG-Hooks](https://github.com/getify/TNG-Hooks) under the hood, but is less heavily tested than using `new Component()`, and `htmel` seems to have issues attaching event handlers :/ but it otherwise works well.

## Using the `devtools` module

The **optional** devtools add-on provides a nice UI for inspecting and even editing your components directly in the page.

The devtools only works in the browser.

### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/devtools.min.js"></script>
<script>
  Component.devtools = devtools
  devtools.init();
</script>
<script>
// ..now define or import your components
</script>
```

It's a bit like React devtools but simpler:

- **Main Toolbar**: 
  - **Choose component**: click "Select component" button, then choose a component on the page
  - **Choose layout**: can switch between bottom (horizontal) view, and side (vertical) view
- **Overview tab**:check a components current state and HTML
- **Details tab**: view other info about the selected component 
- **History tab**: cycle through a components state history
- **Editor tab**: edit a components view and styling

Contains modified versions of:
- [Olical/EventEmitter](https://github.com/Olical/EventEmitter/)
- [luyuan/json-tree-view](https://github.com/luyuan/json-tree-view)
- [jakiestfu/Behave.js](https://github.com/jakiestfu/Behave.js)

### Devtools screenshots:

**Vertical view:**

![Devtools - vertical view](https://user-images.githubusercontent.com/2726610/108625288-ff4f1080-7441-11eb-9e52-ea8e329c66f4.png "Devtools (vertical view)")

**Horizontal view:**

![Devtools - horizontal view](https://user-images.githubusercontent.com/2726610/108628107-de41ec00-7450-11eb-9c9a-3ae98e81a797.png "Devtools (horizontal view)")

## Server side rendering

If running a NodeJS server, you can render the components as HTML strings or JSON.

Just define a view - a function which receives the state as `props` and returns the view as a string, object, etc.

```js
// create an HTML view, using template literals
var htmlView = props => `
    <div id=${props.id}>
      ${Heading("Total so far = " + props.count)}
      ${List(props.items)}
      ${Button("Click here", `App.clickBtn(${props.incrementBy})`)}
    </div>`

// or return the state itself (pure headless component)
var dataOnlyView = props => props

// Choose a view to render
App.view = htmlView

// render the component
App.render()

// ..other rendering options...

// print it to the terminal
console.log(App.render())
```

If rendering a component that has a `.view()` and `.style()` in NodeJS (or if calling `.toString()` directly), the output will be a string like this one:

```
"<style>
#foo h1 {
  color: red;
}
.btn {
  padding: 6px;
}
</style>
<div id=\"foo\">
  <h1>Total so far = 101</h1>
  <button class=\"btn\" onclick=\"App.clickBtn(1);\">Click here</button>
</div>"
```

^ Any styles are wrapped in a `<style>` tag, and your view is rendered after that.

Note: When using `.toString()`, your component CSS is not auto-prefixed or "scoped" with a containers class or id - you can only do this client-side (i.e, in a browser), using `.render('.container')`.

## Making changes to `Component`

Look in `src/`, make any changes you like.

Rebuild to `dist/` using the command `npm run build`

## Changelog

**1.3.2**
- new optional add-ons: 
  - `useAudio`
    - easily add dynamic audio capabilities to your components
    - uses Web Audio API, only works in browser
  - `onScroll`
    - easily power/drive animations based on scroll values
    - uses scroll event, only works in browser

**1.3.1**
- build a "tree-shakable" ES Module too:
  - added new file `src/index.esm.js`
  - updated the rollup configs
  - `npm run build` now also creates `dist/index.esm.js`
  - added a `"module"` field in package.json, that points to `dist/index.esm.js`

**1.3.0**
- new optional add-ons:
  - `html` JSX-like HTML templating, returns templates as a String
  - `htmel` JSX-like HTML templating, returns templates as HTMLObject (browser) or String (Node)
  - `storage` - persistent state between page refreshes (browser) or script invocations (Node)
  - `devtools` - easier debugging of your components (browser only)
- updates to `src/component.js`:
  - fixed: in NodeJS, debounced logging now falls back to using setTimeout, if needed 
  - added: support for all new add-ons
  - added: allow view to be HTML Object, not only String
  - added: `App.actionsList` property - the list of defined actions functions
  - added: `App()` will return the container (an HTML Element)
    - `App({...})` still returns `App` (for chainable actions, etc)
  - added: `App.html` property - alias of `App.container` (returns an HTML Element) 
- update docs:
  - re-write README and examples to show re-usable components
  - add the new add-ons to README and examples
- updated build configs

**1.2.0**
- doing `Foo = new Component(someState)` now returns a function, not an object
- the function returned calls `setState` in its constructor
  - this means you can now set state using a new syntax - via the constructor: `Foo({ count: 1 })`
  - this in turns allows for nicer nested stateful components:
    - nested stateful components can now use the same syntax as stateless (plain function) components 
- update in `tweenState`:  allow `shouldSetState` to be boolean (not only func that returns boolean)
- updated examples, README, package.json, dist/, etc

**1.1.12**
- new feature: state validation
  - simply pass a schema as the 2nd param when creating a new component
  - then call `setState()` as usual - Component will throw an error if the state isn't valid
  - requires `@scottjarvis/validator` to be installed (~330 bytes minified & gzipped)
  - see [`@scottjarvis/validator`](https://github.com/sc0ttj/validator) for more usage info
- updated README

**1.1.11**
- updated `rollup` deps and rebuilt in `dist/`
- nothing else

**1.1.10**
- better rendering performance: debounce the `render()` function:
  - `setState()` can be called 1000s of times a second
  - `setState()` also calls the render() function
  - `render()` will only update the DOM at 60fps
- see https://gomakethings.com/debouncing-your-javascript-events/
- updated README

**1.1.9**
- new feature: "middleware"
  - define an array of functions as `myComponent.middleware = [ someFunc, otherFunc ]`
  - each function will be run at the end of `setState()`
- updated README, package.json, etc 

**1.1.8**
  - fixes in package.json

**1.1.7**
- new feature: added an event emitter
  - if emitter is installed, component "actions" will emit an event
  - other components can listen to it with `myComponent.on('actionName', (props) => { ... })`
    - props will contain the latest state of the component that emitted the event
- added `src/emitter.js`, implemented as an optional, extra module
- updated build process to also build `dist/emitter.min.js`
- added examples and updated README
  - added `examples/usage-emitter.js`


**1.1.6**
- added `src/tweenState.js` and related support files (`src/raf.js`, `src/easings.js`)
- new build process: 
  - added `rollup` to bundle the source files into dist/ (see `rollup.config.js`)
  - added `src/index.js` to allow easier importing of multiple modules, if desired
- updated package.json: `index.js` is the file imported in Node by default
- now requires Node 10 or later (was Node 8)
- updated README 
  - updated install instructions
  - added `tweenState` usage info

**1.1.5**
- fixed: scoped CSS sometimes not applied on page load:
  - here is the new implementation:
    - prefix component CSS with the containers existing `id` or `class`, if any
    - fall back to previous behaviour only if container has no `id` or `class`:
      - add unique class to container
      - prefix component CSS with that same unique class
- better performance:
  - when `debug` is true,  _don't_ console log state history on state change
  - to see the state history, access `App.log` yourself instead
 - see [examples/usage-in-browser.html](examples/usage-in-browser.html)
  
**1.1.4**
- new: automatic "scoping" of component CSS
 - prevents component styles affecting other parts of page
 - simplifies writing CSS for your components:
   - removes the need to define unique namespaces (IDs, classes) in your component CSS
 - you can disable automatic CSS scoping like so: `App.scopedCss = false`
 - see [examples/usage-in-browser.html](examples/usage-in-browser.html)
 - README and example updates

**1.1.3**
- better performance:
  - only access/update the DOM from inside a `requestAnimationFrame`
  - only record state history if `.debug` is true
  - set `.debug` to false by default
- improved README:
  - added info about component settings (`reactive`, `debug`)


**1.1.2**
- fix: can re-render component to new container
- fix: can render multiple components to page
- fix: can call `setstate()` before defining `.view()`
- fix: can call `render()` before defining `.view()` (pointless for now)
- fix: don't attempt any styling if `.style()` not defined

**1.1.1**
- README fixes

**1.1.0**
- improved performance:
  - added DOM diffing, using [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010)
  - only re-render `.view()` if needed
  - only re-render `<style>` if needed
- smaller filesize:
  - smaller method names: 
    - `.forward()` => `.ff()`
    - `.rewind()`  => `.rw()`
    - `.history`   => `.log`
  - removed:
    - `.undo()` and `.redo()` (use `.rw(1)`, and `.ff(1)`)
- better indentation for server-side rendering
- minify CSS added to components `<style>` tag
- updated examples
- updated README

**1.0.0**
- initial release

## Future improvements

- Better SSR
  - an `toEnvelope()` add-on method, to render components as JSON envelopes:
    - render as JSON
    - include view, actions & style as stringified HTML, CSS and JS
  - pass in config to `toString()`, to choose what to render:
    - the component itself (`c`)
    - actions
    - methods
    - styles
    - views
  
- Better game support:
  - a `tick()` addon (time-based animation): 
    - a gameloop with ticker that emits "ticks" at set intervals (always 30 times/second, for example)
    - rendering de-coupled from gameloop (fps can vary)
  - render to canvas
    - define views as function which receives props and draws to a canvas

- Universal rendering (add-ons):
  - use [tagged templates](https://codeburst.io/javascript-es6-tagged-template-literals-a45c26e54761) to render from `x` to HTML strings:
    - from markdown (see [YerkoPalma/marli](https://github.com/YerkoPalma/marli))
    - from files/binary/buffer (see [almost/stream-template](https://github.com/almost/stream-template))
  - use [tagged templates](https://codeburst.io/javascript-es6-tagged-template-literals-a45c26e54761) to render from HTML strings to `x`:
    - to virtual DOM (see [developit/htm](https://github.com/developit/htm), [hyperx](https://github.com/choojs/hyperx), [snabby](https://github.com/mreinstein/snabby))
    - to ANSI console output (for coloured terminal output..?)
    - to PDF (..?)

- Support for custom elements/Web Components
  - so you can use `<my-custom-app></my-custom-app>` in your HTML
  - see [Custom Element patterns](https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4)

## Related projects:

### DOM diffing (no virtual-DOM)

- [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010) - a tiny (800 bytes) lazy DOM diffing function (used by this project)
- [set-dom](https://github.com/DylanPiercey/set-dom) - tiny (<1kb) dom diffing library
- [morphdom](https://github.com/patrick-steele-idem/morphdom/) - a nice, fast DOM differ (fast, but about 15kb)

### JSX-like syntax in Template Literals (alternatives to `html`/`htmel`)

- [developit/htm](https://github.com/developit/htm) - JSX-like syntax in ES6 templates, generates vdom from Template Literals
- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [zspecza/common-tags: `html` function](https://github.com/zspecza/common-tags#html) - makes it easier to write properly indented HTML in your templates

### Template strings to real DOM nodes

- [html-dom-parser](https://github.com/remarkablemark/html-dom-parser) - works in Node and browser
- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [developit/htm](https://github.com/developit/htm) - JSX-like syntax in ES6 templates, generates vdom from Template Literals
- [fast-html-parser](https://www.npmjs.com/package/fast-html-parser) - generate a simplified DOM tree from string, with basic element querying
- [domify-template-strings](https://github.com/loilo-archive/domify-template-strings) - get real DOM nodes from HTML template strings, browser only, no SSR
- [genel](https://github.com/capsidjs/genel) - create real DOM nodes from template string, browser only (no SSR), 639 bytes

### Template strings to VDOM and VDOM diffing

- [snabby](https://github.com/mreinstein/snabby) - use HTML template strings to generate vdom, use with snabbdom
- [snabbdom](https://github.com/snabbdom/snabbdom) - the vdom diffing library used by Vue.js
- [petit-dom](https://github.com/yelouafi/petit-dom) - tiny vdom diffing and patching library
- [hyperx](https://github.com/choojs/hyperx) - tagged templates to vdom (used by [nanohtml](https://github.com/choojs/nanohtml)

### CSS in JS

- [zserge.com/posts/css-in-js](https://zserge.com/posts/css-in-js/) - 200 bytes scoped CSS
- [twirl](https://github.com/benjamminj/twirl-js) - a tag for template literals, turns CSS into objects 
- `/(^|,)[\.#a-z][a-zA-Z0-9_\-:]*/gm` - match first part of CSS selector in a CSS string, useful for scoping (see https://regexr.com/524pu)
- `document.styleSheets[0].cssRules[0].style.cssText.split(/\;[\s.]/).slice(0,-1)` - convert cssText to array, each item like "margin:0 auto;"
- `str.replace(/([A-Z])/g, "-$1").toLowerCase()` - camelCase to hyphen-case converter
- `var cssClassMatchRegex = new RegExp(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/g)` - regex to match all classes in a string (useful for "scoping")
- `Math.random().toString(36).split(".")[1]` - unique ID generator (create a unique id for each new component)
- `cssString.replace(/\n/g, '').replace(/\s\s+/g, ' ')` - minify string of CSS

### Animation (tweening)

- [anime](https://github.com/juliangarnier/anime) - excellent, versatile lightweight animation library
- [popmotion](https://github.com/Popmotion/popmotion) - another great animation library
- [react-tween-state](https://github.com/chenglou/react-tween-state) - tween from one state to another (where I got `tweenState` idea from)
- [phena](https://github.com/jeremenichelli/phena/) - a petit tweening engine based on requestAnimationFrame (adapted version inside `src/tweenState.js`)
- [easing functions](https://gist.github.com/gre/1650294) - excellent set of easing functions (used by this project in `src/easings.js`)
- [react-tweenful](https://github.com/teodosii/react-tweenful) - tweening and animation for React
- [react-state-stream](https://github.com/chenglou/react-state-stream) - instead of one state, set all the states that will ever be, aka a lazy state stream

### Animation ("spring-based")

- see a nice list here: https://github.com/sc0ttj/component/issues/33

### Generate spring-based CSS animations

- [gerardabello/spring-animation-keyframes](https://github.com/gerardabello/spring-animation-keyframes) - generate css keyframes based on spring animations 
- [codepunkt/css-spring](https://github.com/codepunkt/css-spring) - physics based css-keyframes for css-in-js or plain css

### Routers

- [router](https://github.com/sc0ttj/router) - a 2kb isomorphic router & web server, supports express middleware, runs in browsers, lambdas, NodeJS.

### Other tiny component libraries

- [yo-yo](https://github.com/maxogden/yo-yo/) - tiny UI library, DOM diffing (uses `morphdom`), Event handling, ES6 tagged template literals 
- [choojs](http://github.com/choojs/) - A 4kb framework for creating sturdy frontend applications, uses `yo-yo`
- [hyperapp](https://github.com/jorgebucaran/hyperapp) - The tiny framework for building web interfaces, React-like, uses h(), VDOM, etc
- [preact](https://github.com/preactjs/preact) - a 3.1kb alternative to React.js
- [nanohtml](https://github.com/choojs/nanohtml) -  8kb, uses vdom, can attach event listers, can do SSR


## Further reading

- [get root selectors in CSS string](https://regexr.com/524pu)
- [regex to match css class name](https://stackoverflow.com/questions/6329090/regex-to-match-a-css-class-name/6329126#6329126)
- [2ality - ES6 template strings](https://2ality.com/2015/01/template-strings-html.html)
- [Tagged template literals - more than you think](https://codeburst.io/javascript-es6-tagged-template-literals-a45c26e54761)
- [Exploring JS - Template literals](https://exploringjs.com/es6/ch_template-literals.html)
- [How to put a string in a JS regex](https://stackoverflow.com/questions/4029109/javascript-regex-how-to-put-a-variable-inside-a-regular-expression)
- [Using "handleEvent()"](https://medium.com/@WebReflection/dom-handleevent-a-cross-platform-standard-since-year-2000-5bf17287fd38)
- [handleEvent gist](https://gist.github.com/WebReflection/35ca0e2ef2fb929143ea725f55bc0d63)
- [Custom Element patterns](https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4)
