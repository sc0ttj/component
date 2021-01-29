<p align="center">
  <img align="center" src="https://i.imgur.com/yL240c7.png" alt="Component logo" />
  <h1 align="center">
    <b>Component</b>
  </h1>
    <p align="center"><i>A simple JavaScript component thing</i><p>
</p>

[![npm version](https://badge.fury.io/js/%40scottjarvis%2Fcomponent.svg)](https://badge.fury.io/js/%40scottjarvis%2Fcomponent) [![Dependency Status](https://david-dm.org/sc0ttj/component.svg)](https://david-dm.org/sc0ttj/component) [![devDependencies Status](https://david-dm.org/sc0ttj/component/dev-status.svg)](https://david-dm.org/sc0ttj/component?type=dev) [![Node version](https://badgen.net/npm/node/@scottjarvis/component)](http://nodejs.org/download/) [![Build Status](https://travis-ci.org/sc0ttj/component.svg?branch=master)](https://travis-ci.org/sc0ttj/component) [![bundle size](https://badgen.net/bundlephobia/minzip/@scottjarvis/component?color=green&label=gzipped)](https://badgen.net/bundlephobia/minzip/@scottjarvis/component) [![Downloads](https://badgen.net/npm/dt/@scottjarvis/component)](https://badgen.net/npm/dt/@scottjarvis/component)

**Component** is a simple, "stateful component" thing.

It lets you create "functional components" - basically functions that have a "state". 

A "state" is a snapshot of your application data at a specific time.

## Features

- Easy setup, zero dependencies
- 2kb, minified and gzipped
- Simple syntax, easy to use, easy to learn
- Plain JavaScript only
- Works **client-side**, in browsers:
  - add your component to the page as you would a normal Element
  - auto re-render on state change, using `requestAnimationFrame` and DOM-diffing
- Works **server-side**, in Node:
  - render your components as strings (HTML, stringified JSON)
  - render your components as data (JS objects or JSON)
- Use "middleware" to easily customise component re-render behaviour 
- A small list of optional add-on modules:
  - `tweenState`: animate from one state to the next
  - `emitter`: an event emitter, for sharing updates between components
  - `validator`: validate states against a schema (like a simple PropTypes)
  - `html`/`htmel`: simpler, more powerful Template Literals (like a simple JSX)
- ...and more

Your components will support:

- Auto re-render to page on state change (_optional_)
- good rendering/animation performance:
  - DOM diffing
  - all DOM reads/writes performed inside a debounced `requestAnimationFrame` 
- Automatic "scoping"/prefixing of your component CSS (_optional_)
- Re-render styles on component CSS change (_optional_)
- Event attributes like `onclick`, `onchange`, `onkeyup`, etc, etc
- Easy state management:
  - define "actions" to easily update the state in specific ways 
  - a state timeline for debugging (_optional_):
    - a log/history of all changes to the component state
    - rewind or fast-forward to any point in the state history
    - save/load current or any previous state as "snapshots"
- Use "middleware" to customise your components "on state change" behaviour
- Tweening/animating from the current state to the next state
- Event emitting - publish & subscribe to state changes between components
- Server side rendering:
  - render component views as a String, JSON, or Buffer
- Simple, stateless "child" components
- ...and more

## Quickstart

```js

// Define a state
var state = { title: "Hello world" }

// Define your component:

// 1. create it, pass in the state 
var App = new Component(state)

// 2. define a view
App.view = (props) => `<h1>${props.title}</h1>`

// 3. render into the given elem
App.render('.container')

// ...later

// Update the state, the page will re-render for you
App.setState({ title: "Hello again!" })

// Or set state via the component constructor (since v1.2.0)
App({ title: "Hello a 3rd time!" })
```

## Component overview

Methods:

- **App.view(props)**: receives a state and sets the component view to (re)render
- **App.style(props)**: receives a state and sets the `<style>` to (re)render
- **App.render(el)**: (re)render to the given element on state change (browser)
- **App.toString()**: render your component as a string on state change (NodeJS)
- **App.setState(obj)**: update the component state, triggers a re-render
- **App.tweenState(obj[, cfg])**: set state on each animation frame, supports various easing functions
- **App.actions(obj)**: creates chainable methods that simplify updating the state
- ...and more

Properties:

- **App.uid**: a unique string, generated once, on creation of a component
- **App.state**: an object, contains your app data, read-only - cannot be modified directly
- **App.log**: an array containing a history of all component states
- **App.css**: the `<style>` Element which holds the component styles
- **App.container**: the HTML Element into which the components view is rendered
- **App.html**: alias of `App.container`
- ...and more

Settings:

- **App.reactive**: if `false`, disables auto re-rendering on state change
- **App.scopedCss**: if `false`, disables auto-prefixing `.style()` CSS with the class `.${App.uid}`
- **App.debug**: if true, a record of states changes are kept in `.log`

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

### JSX-like features with `html` and `htmel`

To make it easier to build a good HTML "view" for your components, there are two **optional** add-on functions which provide a nicer way to write HTML in JavaScript "Template literals".

These return your components view as either a String or HTML Object, but are otherwise inter-changeable:

- `html` (469 bytes) - returns your Template literal as a string.
- `htmel` (541 bytes) - returns your Template literal as real DOM Node Element.

Features of `html` and `htmel`:

```js
// embed JS object properties as CSS 
html`<p style=${{background: "red"}}>I'm red!</p>`
```

```js
// embed JS object properties as CSS (ignores nested/child objects, keeping only properties)
html`<p style="${someObj}">some text</p>`
```

```js
// embed JS object properties as valid HTML attributes  (ignores nested/child objects)
html`<p ${someObj}>some text</p>`
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

var Table = props =>
  html`<div>
    <table>
    <tbody>
      ${TableRows(props.data)}
    </tbody>
    </table>
  </div>`;
```

Use `htmel` instead of `html` to return DOM Nodes (instead of strings):

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

Example usage:

```js
import { Component, html } from "@scottjarvis/Component"

// ...later

var state = {
  css: {
    "border": "2px solid red",
    list: {
      "padding": "8px",
    }
  },
  text: "My Title:",
  list: [
    "one",
    "two",
  ],
  status: null,
};

// now let's use `html` to construct our HTML view..

App.view = props => html`
  <div style="${props.css}">
    <h2>${props.title}</p>
    <p>${props.text}</p>
    <ul style="${props.css.list}">
      ${props.list.map(val => `<li>${val}</li>`)}
    </ul>
    ${status && `<p>${status}</p>`}
  </div>
`;

console.log(App.view(state));  // returns string of valid HTML
```

Note: Both `html` and `htmel` can be used standalone (without `Component`) for general HTML templating.

### Styling your component

Use `App.style()` to define some styles for your components view (optional):

```js
App.style = (props) => `
  #myapp {
    border: 2px solid ${props.borderColor || 'red'};
    margin: 0 auto;
    max-width: ${props.maxWidth};
  }
  .btn {
    background-color: ${props.btnColor || 'red'};
    padding: 6px;
  }
`
```

When a component is added to the page using `render('.container')`, the CSS above is prefixed with the `id` or `className` of your container. 

_This CSS automatic "scoping"/prefixing will prevent your component styles affecting other parts of the page_.

It also keeps your component CSS clean - no need to prefix anything with a unique ID or class yourself.

If your container has no class or id attributes, then a unique string, `App.uid`, will be used instead.

You can disable automatic CSS "scoping"/prefixing by using `App.scopedCss = false`.

When rendering your component in NodeJS, or using `toString()`, your CSS will **not** be auto prefixed.

To see `style()` in use, see [examples/usage-in-browser.html](examples/usage-in-browser.html)

### Using "actions"

Define "actions" to update your state in specific ways.

These are like regular methods, except they're always chainable, they hook into the `emitter` automatically, and they're tagged by name in your components state history. 

```js
App.actions({

  update:     (props) => App.setState({ props }), // same as calling App.setState()

  reset:      (props) => App.setState({ count: 0 }),

  count:      (props) => App.setState({ count: props }),

  plus:       (props) => App.setState({ count: App.state.count + props }),

  minus:      (props) => App.setState({ count: App.state.count - props }),

  items:      (props) => App.setState({ items: props }),

  addItems:   (props) => App.setState({ items: [ ...App.state.items, ...props ] }),

});

// If you defined some "actions", you can use them
// to update specific parts of your state
App.plus(105)
App.minus(5)

// A components "actions" can be chained
App
  .minus(1)
  .minus(1)
  .minus(1)
  .plus(3)
  .addItems([ { name: "two" }, { name: "three" } ])
```

Using the add-on [emitter](#using-the-emitter-module) module, components can listen for and react to these actions. This is an easy way to share states between components, and for components to "talk to each other".

### Using "middleware"

When you call `myComponent.setState()`, the page is re-rendered (in browser) and a history of state updates are kept.

Using "middleware" functions you can extend this behaviour further, and make other stuff happen at the end of the `setState()` method.

Middleware functions can be re-used across lots of components and, unlike "actions", are not tied to one component.

Here's how to use "middleware" functions to customise your components `setState()` behaviour:

1. Define some "middleware" functions - these will be called at the end of `setState()`
2. Add your "middleware" to a component as an array of functions:

```js
// Define the middleware functions
var countLog = props => console.log("middleware -> count logger", props.count)
var itemsLog = props => console.log("middleware -> items logger", props.items)

// Add the middleware to your component
App.middleware = [countLog, itemsLog]
```

In the above example, every time `App.setState({ ... })` is called, the `countLog` and `itemsLog` functions will be called at the end of `setState()`.

Note that your middleware functions receive the latest state of the host component, as `props`.

See [examples/usage-in-node.js](examples/usage-in-node.js) for the complete example.

### Using the "state history"

Here is how to "time travel" to previous states, or jump forward to more recent ones.

Note: To enable the state history, `App.debug` must be `true`.

```js

// enable logging of state history
App.debug = true

// Take a "snapshot" (we'll use it later)
var snapshot = App.state

// ...later

App.rw()         // go to initial state
App.ff()         // go to latest state
App.rw(2)        // rewind two steps to a previous state
App.ff(2)        // fast-forward two steps to a more current state

// Set a previous state
App.setState(App.log[0].state)

// Set a "named" state, from a previous point in time
App.setState(snapshot)
```

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

- `App.on("eventName", props => { ... })` - every time `eventName` is emitted, run the given function
- `App.once("eventName", props => { ... })` - run the given function only once
- `App.off("eventName")` - stop listening to `eventName`

Note, `props` is the latest state of the component that emitted the event.

Here's how to use the emitter:

```js
var { Component, emitter } = require("../dist/index.min.js")
Component.emitter = emitter

// Define our app
var state = {
  count: 0,
  items: [{ name: "one" }]
}
var App = new Component(state)

// Define chainable "actions", to update the state more easily
App.actions({
  plus:     props => App.setState({ count: App.state.count + props }),

  minus:    props => App.setState({ count: App.state.count - props }),

  addItems: props => App.setState({ items: [...App.state.items, ...props] })
})

// Define some other component
var Foo = new Component({ foo: "bar" })

// Listen for the actions above:
Foo
  .once("minus",  props => console.log("Foo: action 'minus'", props.count))
  .on("plus",     props => console.log("Foo: action 'plus'", props.count))
  .on("addItems", props => console.log("Foo: action 'addItems'", props.items))

// ...now we're ready to run the program..

App.plus(105)
App.minus(5)

// stop listening to the "plus" action
Foo.off("plus")

App.minus(1)
  .minus(1)
  .plus(3)
  .addItems([{ name: "two" }, { name: "three" }])
```

Also see [examples/usage-emitter.js](examples/usage-emitter.js)

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

Example usage of `tweenState`, in NodeJS:

```js
var { Component, tweenState } = require('@scottjarvis/component');
Component.tweenState = tweenState

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

### Using JSON-LD (linked data)

Adding linked data to your components is easy - just define it as part of your view:

```js
App.view = props => `
  <script type="application/ld+json">{ ... }</script>
  <div> ... </div>
`
```

- add a JSON-LD script before your component HTML
- use the `props` passed in to define/update whatever you need
- you JSON-LD will be updated along with your view whenever your component re-renders

### State validation

You can validate your component state against a schema, before you set it or render anything.

This is a similar concept to `propTypes` in React, but simpler and dumber.

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

Then create your component, passing in the schema as the second parameter. 

```js
var state = { 
  count: 0, 
  age: 20 
  items: [ "one", "two" ],
  foo: {
    bar: "whatever"
  }
}

var schema = { 
  count: "number",
  age: age => typeof age === "number" && age > 17,
  items: "array",
  foo: {
    bar: "string"
  }
}

var App = new Component(state, schema)
```

If you try to set an invalid state, your component will `throw` an error:

```js
App.setState({ count: "foo" }) // this will throw an Error!
```

See [`@scottjarvis/validator`](https://github.com/sc0ttj/validator) for more usage info.

## Changelog

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

- Usability:
  - Better Event handling: so `onclick` etc receive proper `Event` objects. See these links:
    - [yo-yo](https://github.com/maxogden/yo-yo) - hooks into morphdom, and manually copies events handlers to new elems, if needed
    - [nano-html](https://github.com/choojs/nanohtml/blob/master/lib/set-attribute.js) - similar to above
  - Better CSS-in-JS: 
    - define a components CSS using regular JS objects (alternative to template strings)
    - see [twirl](https://github.com/benjamminj/twirl-js)
  - see `htl` or similar for wrappers around view HTML that provide syntactic sugar

- Better SSR
  - an `App.envelope()` add-on method, to render components as JSON envelopes:
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
  - use [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to render from `x` to HTML strings:
    - markdown (see [YerkoPalma/marli](https://github.com/YerkoPalma/marli))
    - files/binary/buffer (see [almost/stream-template](https://github.com/almost/stream-template))
  - use [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to render from HTML strings to `x`:
    - virtual DOM (see `htm`, `hyperx`, `snabby`)
    - real DOM (see `htl`, `fast-html-parser`, `bel`, `genel`, ...)
    - ANSI console markup, for coloured terminal output (like a JS/HTML-based `tput`) (?)
    - pdf (?)

- Support for custom elements/Web Components
  - so you can use `<my-custom-app></my-custom-app>` in your HTML
  - see [Custom Element patterns](https://gist.github.com/WebReflection/ec9f6687842aa385477c4afca625bbf4)

## Related projects:

### DOM and DOM diffing

- [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010) - a tiny (800 bytes) lazy DOM diffing function (used by this project)
- [set-dom](https://github.com/DylanPiercey/set-dom) - tiny dom diffing library
- [morphdom](https://github.com/patrick-steele-idem/morphdom/) - a nice, fast DOM differ (not vdom, real DOM)
- [fast-html-parser](https://www.npmjs.com/package/fast-html-parser) - generate a simplified DOM tree from string, with basic element querying

### JSX-like syntax in Template Literals (alternatives to `html`/`hmtel`)

- [developit/htm](https://github.com/developit/htm) - JSX-like syntax in ES6 templates, generates vdom from Template Literals
- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [zspecza/common-tags - html function](https://github.com/zspecza/common-tags#html) - makes it easier to write properly indented HTML in your templates

### Template strings to real DOM nodes

- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [developit/htm](https://github.com/developit/htm) - JSX-like syntax in ES6 templates, generates vdom from Template Literals
- [nanohtml](https://github.com/choojs/nanohtml) - uses vdom, can attach event listers, can do SSR, 8kb
- [domify-template-strings](https://github.com/loilo-archive/domify-template-strings) - get real DOM nodes from HTML template strings, browser only, no SSR
- [genel](https://github.com/capsidjs/genel) - create real DOM nodes from template string, browser only (no SSR), 639 bytes

### Template strings to VDOM and VDOM diffing

- [snabbdom](https://github.com/snabbdom/snabbdom) - the vdom diffing library used by Vue.js
- [snabby](https://github.com/mreinstein/snabby) - use HTML template strings to generate vdom, use with snabbdom
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

- [router](https://github.com/sc0ttj/router) - a tiny, simple isomorphic router, should play nice with this project

### Other tiny component libraries

- [yo-yo](https://github.com/maxogden/yo-yo/) - tiny UI library, DOM diffing (uses `morphdom`), Event handling, ES6 tagged template literals 
- [choojs](http://github.com/choojs/) - A 4kb framework for creating sturdy frontend applications, uses `yo-yo`
- [hyperapp](https://github.com/jorgebucaran/hyperapp) - The tiny framework for building web interfaces, React-like, uses h(), VDOM, etc
- [preact](https://github.com/preactjs/preact) - a 3.1kb alternative to React.js


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
