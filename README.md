<p align="center">
  <img align="center" src="https://i.imgur.com/yL240c7.png" alt="Component logo" />
  <h1 align="center">
    <b>Component</b>
  </h1>
    <p align="center"><i>A simple JavaScript component thing</i><p>
</p>

[![npm version](https://badge.fury.io/js/%40scottjarvis%2Fcomponent.svg)](https://badge.fury.io/js/%40scottjarvis%2Fcomponent) [![Dependency Status](https://david-dm.org/sc0ttj/component.svg)](https://david-dm.org/sc0ttj/component) [![devDependencies Status](https://david-dm.org/sc0ttj/component/dev-status.svg)](https://david-dm.org/sc0ttj/component?type=dev) [![Node version](https://badgen.net/npm/node/@scottjarvis/component)](http://nodejs.org/download/) [![Build Status](https://travis-ci.org/sc0ttj/component.svg?branch=master)](https://travis-ci.org/sc0ttj/component) [![bundle size](https://badgen.net/bundlephobia/minzip/@scottjarvis/component?color=green&label=gzipped)](https://badgen.net/bundlephobia/minzip/@scottjarvis/component) [![Downloads](https://badgen.net/npm/dt/@scottjarvis/component)](https://badgen.net/npm/dt/@scottjarvis/component)

**Component** is a simple, "stateful component" thing.

It lets you create re-usable, "functional components" - basically functions that have a "state". 

A "state" is a snapshot of your application data at a specific time.

## Features

- Easy setup, zero dependencies
- 2.1kb, minified and gzipped
- Simple syntax, easy to use, easy to learn:
  - plain JavaScript only
  - no compilation or build tools needed
  - no virtual DOM or JSX needed
  - should work with any test suite
- Works **client-side**, in browsers:
  - add your component to the page as you would a normal Element
  - auto re-render on state change, using `requestAnimationFrame` and DOM-diffing
    - DOM diffing uses real DOM Nodes (not VDOM)
    - all DOM reads/writes performed inside a debounced `requestAnimationFrame` 
    - good (re)rendering/animation performance at 60fps
- Works **server-side**, in Node:
  - render your components as strings (HTML, stringified JSON)
  - render your components as data (JS objects or JSON)
- Includes a useful list of **optional add-ons**:
  - `validator`: validate states against a schema (like a simple PropTypes)
  - `html`/`htmel`: simpler, more powerful Template Literals (like a simple JSX)
  - `emitter`: an event emitter, for sharing updates between components
  - `tweenState`: animate from one state to the next
- Supports **"middleware"** functions:
  - easily customise a components setState and re-render behaviour
- Easy component CSS styling:
  - Automatic "scoping"/prefixing of your component CSS (_optional_)
  - Re-render styles on component CSS change (_optional_)
- Easy state management:
  - define "actions" to easily update the state in specific ways 
  - a log of all state history can be kept, for debugging (_optional_):
    - rewind or fast-forward to any point in the state history
    - save/load current or any previous state as "snapshots"
- Simple, stateless "child" components
- ...and more


## Quickstart

Example of a re-usable HTML component:

```js
const { Component } = require('@scottjarvis/component');

function Header(state) {
  const Header = new Component({ title: "Hello world", ...state });
  Header.view = props => `<h1>${props.title}</h1>`;
  return Header;
}

export default Header
```

And you use it like this:

```js
import Header from './Header.js'

const header = new Header();

// add it to our page
header.render('.container');

// Update the state, the heading will re-render for you
header.setState({ title: "Hello again!" });

// Or set state via the component constructor (since v1.2.0)
header({ title: "Hello a 3rd time!" });
```

## Component API overview

Methods:

- **.setState(obj)**: update the component state, triggers a re-render
- **.render(el)**: (re)render to the given element on state change (browser)
- **.tweenState(obj[, cfg])**: set state on each animation frame, supports various easing functions
- **.view(props)**: receives a state and sets the component view to (re)render
- **.style(props)**: receives a state and sets the `<style>` to (re)render
- **.actions(obj)**: creates chainable methods that simplify updating the state
- **.middleware**: an array of functions that run at the end of setState()
- **.toString()**: render your component as a string on state change (NodeJS)
- ...and more

Properties:

- **.state**: an object, contains your app data, read-only - cannot be modified directly
- **.container**: the HTML Element into which the components view is rendered
- **.html**: alias of `.container`
- **.css**: the `<style>` Element which holds the component styles (if set)
- **.uid**: a unique string, generated once, on creation of a component
- **.log**: an array containing a history of all component states
- ...and more

Settings:

- **.reactive**: if `false`, disables auto re-rendering on state change
- **.scopedCss**: if `false`, disables auto-prefixing `.style()` CSS with the class `.${uid}`
- **.debug**: if true, a record of states changes are kept in `.log`

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

```js
var { Component } = require('@scottjarvis/component');

// use it here

```

## Usage

### In browsers

Create interactive components for your web pages:

See [examples/usage-in-browser.html](examples/usage-in-browser.html)

### In NodeJS

Or you can do "server-side rendering" (SSR) of your components:

```
node examples/usage-in-node.js
```

See [examples/usage-in-node.js](examples/usage-in-node.js)

## Advanced usage

### State validation

You can validate your component state against a schema, before you set it or render anything.

If the data to set doesn't match a components state schema, an error will be thrown.

This is a similar concept to `propTypes` in React, but a bit simpler.

First, you must install a tiny (~300 bytes) additional dependency:

```js
npm i @scottjarvis/validator
```

Then enable it:

```js
var { Component } = require("@scottjarvis/component")
Component.validator = require("@scottjarvis/validator")
```

Define a schema object. For each property included, the value should be:

- a `typeof` type name, as a string
- or a validator function, that returns true or false

Then create your component, passing in the schema as the second parameter to `Component()`. 

```js
function Foo(state) {
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
  const Foo = new Component({ ...defaults, ...state }, schema);

  return Foo;
}
```

If you try to set an invalid state, your component will `throw` an error:

```js
const foo = new Foo();
foo.setState({ count: "a string" }) // this will throw an Error!
```

See [`@scottjarvis/validator`](https://github.com/sc0ttj/validator) for more usage info.

### Using "middleware"

When you call `myComponent.setState()`, the page is re-rendered (in browser) and a history of state updates are kept.

Using "middleware" functions you can extend this behaviour further, and make other stuff happen at the end of the `setState()` method.

Middleware functions can be re-used across lots of components and, unlike "actions", are not tied to one component.

Here's how to use "middleware" functions to customise your components `setState()` behaviour:

1. Define some "middleware" functions - these will be called at the end of `setState()`
2. Add your "middleware" to a component as an array of functions:

```js
// Define the middleware functions
const countLog = props => console.log("middleware -> count = ", props.count)

// Define a component that uses middleware
function Foo() {

  const Foo = new Component({ count: 0 })

  Foo.view = props => `<p>${props.count}</p>`

  // Add the middleware to your component
  Foo.middleware = [countLog]

  return Foo;
}

// ..let's use our component with middleware

const foo = new Foo();
foo.setState({ count: 1 }) // will run the middleware
```

In the above example, every time `foo.setState({ ... })` is called, the `countLog` function will be called at the end of `setState()`.

Note that your middleware functions receive the latest state of the host component, as `props`.

See [examples/usage-in-node.js](examples/usage-in-node.js) for the complete example.

### Using the "state history"

Here is how to "time travel" to previous states, or jump forward to more recent ones.

Note: To enable the state history, `app.debug` must be `true`.

```js
const foo = new Foo();

// enable logging of state history
foo.debug = true

// Take a "snapshot" (we'll use it later)
var snapshot = foo.state

// ...later

foo.rw()         // go to initial state
foo.ff()         // go to latest state
foo.rw(2)        // rewind two steps to a previous state
foo.ff(2)        // fast-forward two steps to a more current state

// Set a previous state
foo.setState(foo.log[0].state)

// Set a "named" state, from a previous point in time
foo.setState(snapshot)
```

### Styling your component

Use `Foo.style()` to define some styles for your components view (optional):

```js
function Foo(state, schema) {

  // ... 

  Foo.style = (props) => `
    #myapp {
      border: 2px solid ${props.borderColor || 'red'};
      margin: 0 auto;
      max-width: ${props.maxWidth};
    }
    .btn {
      background-color: ${props.btnColor || 'red'};
      padding: 6px;
    }`;

  return Foo;
}
```

If a component is added to a page with `foo.render('.container')`, the CSS is prefixed with the `id` or `className` of its container. 

_This CSS "auto-scoping" will prevent a components styles affecting other parts on the page_.

It also keeps your component CSS clean - no need to prefix anything with a unique ID or class yourself.

If your container has no class or id attributes, then a unique string, `foo.uid`, will be used instead.

You can disable automatic CSS "scoping"/prefixing by using `foo.scopedCss = false`.

When rendering your component in NodeJS, or using `toString()`, your CSS will **not** be auto prefixed.

To see `style()` in use, see [examples/usage-in-browser.html](examples/usage-in-browser.html)

### Using "actions"

Define "actions" to update your state in specific ways.

These are like regular methods, except they're always chainable, they hook into the [emitter](#using-the-emitter-module) add-on automatically, and they're tagged by name in your components state history. 

```js
function Foo(state, schema) {
  const Foo = new Component({ count: 0, items: [] });
  // define the actions
  Foo.actions({
    update:     props => Foo({ props }), // same as calling Foo.setState()
    plus:       props => Foo({ count: Foo.state.count + props }),
    minus:      props => Foo({ count: Foo.state.count - props }),
    addItems:   props => Foo({ items: [ ...Foo.state.items, ...props ] }),
  });
  return Foo;
}

// ...later

const foo = new Foo();

// use "actions" to update specific parts of your state
foo.plus(105);
foo.minus(5);

// A components "actions" can be chained
foo.minus(1)
   .minus(1)
   .minus(1)
   .plus(3)
   .addItems([ { name: "one" }, { name: "two" } ]);
```

Using the add-on [emitter](#using-the-emitter-module) module, components can listen for and react to these actions. This is an easy way to share states between components, and for components to "talk to each other".

### Using the `emitter` module

Any time a components state is changed via an "action", it can emit an event that other components can listen for.

To achieve this, just include the emitter like so:

#### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/emitter.min.js"></script>
<script>
  Component.emitter = emitter

  // use it here
</script>
```

#### In NodeJS:

```js

var { Component, emitter } = require("@scottjarvis/component");
Component.emitter = emitter;
```

The emitter provides the following methods:

- `foo.on("actionName", props => { ... })` - every time `actionName` is emitted, run the given function
- `foo.once("actionName", props => { ... })` - run the given function only once
- `foo.off("actionName")` - stop listening to `actionName`

Note, `props` is the latest state of the component that emitted the event.

Here's how to use the emitter:

```js
// Define a component to listen to

function Foo(state) {
  const defaults = {
    count: 0,
    items: [{ name: "one" }]
  }
  const Foo = new Component({ ...defaults, ...state })

  // Define chainable "actions" that we can listen to
  Foo.actions({
    plus:     props => Foo.setState({ count: Foo.state.count + props }),
    minus:    props => Foo.setState({ count: Foo.state.count - props }),
    addItems: props => Foo.setState({ items: [...Foo.state.items, ...props] })
  })

  return Foo;
}
```

Now let's "listen" to `foo` using another component, called `bar`:

```js  
// Define some other component
const bar = new Component({})

// Define "listeners" for the actions above:
bar
  .once("minus",  props => console.log("Bar: 'minus'",    props.count))
  .on("plus",     props => console.log("Bar: 'plus'",     props.count))
  .on("addItems", props => console.log("Bar: 'addItems'", props.items))

// ...now we're ready to run the program..

const foo = new Foo();

// these actions will trigger Bar
foo.plus(105)
foo.minus(5)

// stop listening to the "plus" action, keep listening to others..
bar.off("plus")

foo.minus(1)
  .minus(1)
  .plus(3)
  .addItems([{ name: "two" }, { name: "three" }])
```

Also see [examples/usage-emitter.js](examples/usage-emitter.js)

### Attaching Event Listeners

To add your own Event Listeners, you should add them to the container of your components:

```js
foo.render('.container');

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

### Using the `tweenState` module

With `tweenState` it's super easy to do animations that use `requestAnimationFrame` and DOM diffing.

Using `tweenState()` is much like using `setState()`, except:

- you only pass in the state values you want to tween
- you can pass in tween settings as a 2nd param (delay, duration, easing, callbacks)

How it works:

- the tweened state values are passed to `setState()` on each frame (or whenever you choose, if using the `shouldSetState()` callback)
- the state you passed in will be passed to `setState()` on the final frame

By default, `tweenState()` calls `setState()` on every frame of the tweened animation. You can override this behaviour by defining a `shouldSetState()` callback in your tween config, which is called on every frame - `setState()` will only be called on that frame if `shouldSetState()` returns true.

To use `tweenState`, import it along with Component, like so:

#### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/tweenState.min.js"></script>
<script>
  Component.tweenState = tweenState

  // use it here
</script>
```

#### In NodeJS:

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

### JSX-like features with `html` and `htmel`

To make it easier to build a good HTML "view" for your components, there are two **optional** add-on functions which provide a nicer way to write HTML in JavaScript "Template literals".

These return your components view as either a String or HTML Object, but are otherwise mostly inter-changeable:

- `html` (527 bytes) - returns your template as a String.
- `htmel` (728 bytes) - returns your template as an HTML Object (browser) or String (NodeJS).

Both `html` and `htmel` can be used standalone (without `Component`) for general HTML templating.

To use `html` or `htmel` (or both), import them along with Component, like so:

#### In browsers:

```html
<script src="https://unpkg.com/@scottjarvis/component"></script>
<script src="https://unpkg.com/@scottjarvis/component/dist/html.min.js"></script>
<script>
  // use it here
</script>
```

#### In NodeJS:

```js
var { Component, html } = require('@scottjarvis/component');

// use it here

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

Example usage:

```js
Foo(state, schema) {

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

### Using JSON-LD (linked data)

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

### Server side rendering

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

If rendering a component in NodeJS that has a `.view()` and `.style()`, or if calling `.toString()` directly, the output will be a string like this one:

```
"<style>
#myapp {
  border: 2px solid grey;
  margin: 0 auto;
  max-width: 360px;
}
.btn {
  background-color: black;
  color: white;
  padding: 6px;
}
</style>
<div id=\"foo-id\">
  <h1>Total so far = 101</h1>
  <ul><li>First</li><li>two</li><li>three</li></ul>
  <button class=\"btn\" onclick=App.clickBtn(5)>Click here</button>
</div>"
```

^ Any styles are wrapped in a `<style>` tag, and your view is rendered after that.

Note: your component CSS is not auto-prefixed or "scoped" with containers class/id until/unless it's added to a container element, client-side, using `.render('.container')`.

## Changelog

**1.3.0**
- new add-ons: `html` and `htmel` for more JSX-like component views
- both add-ons are optional, can be used for easier HTML templating
- `html` always returns your template as a String
- `htmel` returns your template as an HTML Object (browser) or String (NodeJS)
- updates to `src/component.js`:
  - fixed: in NodeJS, debounced logging now falls back to using setTimeout, if needed 
  - added: allow view to be HTML Object, not only String
  - added: `App.actionsList` property - the list of defined actions functions
  - added: `App.html` property - alias of `App.container` (returns an HTML Element) 
  - added: `App()` will return the container (an HTML Element)
    - `App({...})` still returns `App` (for chainable actions, etc)
- updated examples, README and build configs

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

## Making changes to `Component`

Look in `src/`, make any changes you like.

Rebuild to `dist/` using the command `npm run build`

## Future improvements

- Persistant state
  - stored in/retrieved from localStorage (etc)

- Store manager
  - like redux, storeon, etc
   
- Usability:
  - Better Event handling: so `onclick` etc receive proper `Event` objects. See these links:
    - [yo-yo](https://github.com/maxogden/yo-yo) - hooks into morphdom, and manually copies events handlers to new elems, if needed
    - [nano-html](https://github.com/choojs/nanohtml/blob/master/lib/set-attribute.js) - similar to above

- Better SSR
  - an `toEnvelope()` add-on method, to render components as JSON envelopes:
    - render as JSON
    - include view, actions & style as stringified HTML, CSS and JS
  - pass in config to `toString()`, to choose what to render:
    - Component lib itself
    - actions
    - methods
    - styles
    - views
  - client-side: 
    - ability to "hydrate" or takeover a view that already exists in the page:
      - simply don't define a view, and call `App.render('.container')`:
        - any `id` or `class` attributes will become items in `App.state`
        - the contents will be grabbed and used for a new `.view()`
      - for (re)attaching events, see [yo-yo](https://github.com/maxogden/yo-yo)
  
- Scroll-based re-rendering/animation:
  - create a `Component.scroll({ ... })` add-on module:
    - hooks `setState` into scroll progress values for components container
    - see [sc0ttj/scrollstory](https://github.com/sc0ttj/scrollstory)
      - e.g. progress = data => App.tweenState({ width: `${data.progress * 100}%` })

- Better animations: 
  - create a physics based timing functions module:
    - like current easings, but more flexible/dynamic
    - can pass params like friction, magnitude, etc, to make the anims more/less "pronounced"
    - see `react-motion`, `react-spring`, `react-move`, `pose`, etc
    - maybe do a `Component.motion` add-on that attaches extra info to component state:
      - component positioning and motion info:
        - (x,y, in view or not, scroll speed & direction, accel, current momentum, etc)
        - is inside/outside other component/element
        - collision detection

- Universal rendering (add-ons):
  - use [tagged templates](https://codeburst.io/javascript-es6-tagged-template-literals-a45c26e54761) to render from `x` to HTML strings:
    - markdown (see [YerkoPalma/marli](https://github.com/YerkoPalma/marli))
    - files/binary/buffer (see [almost/stream-template](https://github.com/almost/stream-template))
  - use [tagged templates](https://codeburst.io/javascript-es6-tagged-template-literals-a45c26e54761) to render from HTML strings to `x`:
    - real DOM (see `html`/`htmel`, or [htl](https://observablehq.com/@observablehq/htl), [fast-html-parser](https://www.npmjs.com/package/fast-html-parser), [genel](https://github.com/capsidjs/genel), ...)
    - virtual DOM (see [developit/htm](https://github.com/developit/htm), [hyperx](https://github.com/choojs/hyperx), [snabby](https://github.com/mreinstein/snabby))
    - ANSI console output (for coloured terminal output..?)
    - PDF (..?)

- Support for custom elements/Web Components
  - so you can use `<my-custom-app></my-custom-app>` in your HTML
  - see [Custom Element patterns](https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4)

## Related projects:

### DOM and DOM diffing

- [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010) - a tiny (800 bytes) lazy DOM diffing function (used by this project)
- [set-dom](https://github.com/DylanPiercey/set-dom) - tiny dom diffing library
- [morphdom](https://github.com/patrick-steele-idem/morphdom/) - a nice, fast DOM differ (not vdom, real DOM)

### JSX-like syntax in Template Literals (alternatives to `html`/`htmel`)

- [developit/htm](https://github.com/developit/htm) - JSX-like syntax in ES6 templates, generates vdom from Template Literals
- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [zspecza/common-tags: `html` function](https://github.com/zspecza/common-tags#html) - makes it easier to write properly indented HTML in your templates

### Template strings to real DOM nodes

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

- [twirl](https://github.com/benjamminj/twirl-js) - a tag for template literals, turns CSS into objects 
- `/(^|,)[\.#a-z][a-zA-Z0-9_\-:]*/gm` - match first part of CSS selector in a CSS string, useful for scoping (see https://regexr.com/524pu)
- `document.styleSheets[0].cssRules[0].style.cssText.split(/\;[\s.]/).slice(0,-1)` - convert cssText to array containing CSS proprties and values, like "margin:0 auto;"
- `str.replace(/([A-Z])/g, "-$1").toLowerCase()` - camelCase to hyphen-case converter
- `var cssClassMatchRegex = new RegExp(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/g)` - regex to match all classes in a string (maybe useful for "scoping")
- `Math.random().toString(36).split(".")[1]` - unique ID generator (create a unique id for each new component)
- `cssString.replace(/\n/g, '').replace(/\s\s+/g, ' ')` - minify string of CSS

### Animation

- [react-tween-state](https://github.com/chenglou/react-tween-state) - tween from one state to another (where I got `tweenState` idea from)
- [phena](https://github.com/jeremenichelli/phena/) - a petit tweening engine based on requestAnimationFrame (adapted version inside `src/tweenState.js`)
- [easing functions](https://gist.github.com/gre/1650294) - excellent set of easing functions (used by this project in `src/easings.js`)
- [react-tweenful](https://github.com/teodosii/react-tweenful) - tweening and animation for React
- [react-state-stream](https://github.com/chenglou/react-state-stream) - instead of one state, set all the states that will ever be, aka a lazy state stream

### Routers

- [router](https://github.com/sc0ttj/router) - a tiny, isomorphic router & web server, supports express middleware, runs in browsers, lambdas, NodeJS.

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
