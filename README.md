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
- Less than 1kb, minified and gzipped
- No build tools or transpiler needed
- Simple syntax, easy to use, easy to learn
- Works **client-side**, in browsers:
  - add your component to the page as you would a normal Element
- Works **server-side**, in Node:
  - render your components as strings (HTML, stringified JSON)
  - render your components as data (JS objects or JSON)
- ...and more

Your components will support:

- Automatic re-rendering on state change
- Scoped CSS styling, with re-rendering on CSS changes
- Event attributes like `onclick`, `onchange`, `onkeyup`, etc, etc
- Easy state management:
  - define "actions" to easily update the state in specific ways 
  - a state timeline:
    - a history of all changes to the component state
    - rewind or fast-forward to any point in the state history
    - save/load current or any previous state as "snapshots"
- Simple, stateless "child" components
- ...and more

## Limitations

Currently, the most important limitations are:

- No DOM diffing - re-renders just replace your component containers innerHTML
- No Event objects passed into components events attributes (`onclick`, etc)
- No JSX - uses template literals
- No CSS-in-JS - uses template literals

## Quickstart

```js

// Define a state
var state = { title: "Hello world!" }

// Define your component:

// 1. create it, pass in the state 
var App = new Component(state)

// 2. define a view
App.view = (props) => `<h1>${props.title}</h1>`

// 3. render into the given elem
App.render('body')

// ...later

// Update the state, the page will re-render for you
App.setState({ title: "Hello again!" })
```

An overview:

- **App.state**: an object, contains your app data, read-only - cannot be modified directly
- **App.view(props)**: receives a state and sets the component view to (re)render
- **App.style(props)**: receives a state and sets the `<style>` to (re)render
- **App.render(el)**: (re)render to the given element on state change (browser)
- **App.renderToString()**: render your component as a string on state change (NodeJS)
- **App.setState(props)**: update the component state (`obj`), triggers a re-render
- ...and many more

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
var Component = require('@scottjarvis/component');

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

### Styling your component

Use `.style()` to define some styles for your components view (optional):

```js
App.style = (props) => `
  #${props.id} {
    border: 2px solid ${props.borderColor || 'red'};
    margin: 0 auto;
    max-width: ${props.maxWidth};
  }
  #${props.id} .btn {
    background-color: ${props.btnColor || 'red'};
    padding: 6px;
  }
`
```

Note: in the example above, we name-spaced or "scoped" the CSS so it will affect the current component only, by using `props.id` (passed in from the state).

To see `style()` in use, see [examples/usage-in-browser.html](examples/usage-in-browser.html)

### Using "actions"

Define "actions" to update your state in specific ways.

These are like regular methods, except they're always chainable and tagged by name in your components state history

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

### Using the "state history"

Here is how to "time travel" to previous states, or jump forward to more recent ones.

```js

// Take a "snapshot" (we'll use it later)
var snapshot = App.state

App.rewind()         // go to initial state
App.forward()        // go to latest state
App.rewind(2)        // rewind two steps to a previous state
App.forward(2)       // fast-forward two steps to a more current state
App.undo()           // same as App.rewind(1)
App.redo()           // same as App.forward(1)

// Set a previous state
App.setState(App.history[2].state)

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

// or a custom JS object view
var jsonView = props => {
  return { count: props.count, items: props.items }
}

// Choose a view to render
App.view = htmlView


// render the component
App.render()


// ..other rendering options...

// print it to the terminal
console.log(App.render())

// Or render the component as an HTTP response,
// using something like express.js
res.send(App.render())

```

If rendering a component with `.view()` and `.style()` defined in Node, or calling `.renderToString()` directly, the output will be a string like this one:

```
"<style>
#foo-id {
  border: 2px solid grey;
  margin: 0 auto;
  max-width: 360px;
}
#foo-id .btn {
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

^ any styles are wrapped in a `<style>` tag, and your view is rendered after that.

## Making changes to `Component`

Look in `src/component.js`, make any changes you like.

Rebuild the bundles in `dist/` using this command: `npm run build`

## Future improvements

- Performance:
  - DOM diffing: real DOM, not VDOM (only needed in browser, NodeJS would use HTML template strings)
  - Batched rendering: only needed in browser, use requestAnimationFrame. See [main-loop](https://github.com/Raynos/main-loop)
  - Memoize state updates: so we can return cached states and views

- Usability:
  - Better CSS-in-JS: 
    - define a components CSS using regular JS objects (alternative to template strings)
    - auto-scoped CSS, with namespaced/prefixed classes 
    - see [twirl](https://github.com/benjamminj/twirl-js)
  - Better Event handling: so `onclick` etc receive proper `Event` objects. See these links:
    - [yo-yo](https://github.com/maxogden/yo-yo) - hooks into morphdom, and manually copies events handlers to new elems, if needed

## Related projects:

- [microbundle](https://github.com/developit/microbundle) - used by this project to create the bundled & compressed builds in `dist/`

### DOM and DOM diffing

- [morphdom](https://github.com/patrick-steele-idem/morphdom/) - a nice, fast DOM differ (not vdom, real DOM)
- [set-dom](https://github.com/DylanPiercey/set-dom) - tiny dom diffing library
- [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010) - a tiny (800 bytes) lazy DOM diffing function

### Template strings to real DOM nodes

- [domify-template-strings](https://github.com/loilo-archive/domify-template-strings) - creates real DOM nodes from HTML template strings
- [genel](https://github.com/capsidjs/genel) - create real DOM nodes from template string, 639 bytes

### CSS in JS

- [twirl](https://github.com/benjamminj/twirl-js) - a tag for template literals, turns CSS into objects 
- `str.replace(/([A-Z])/g, "-$1").toLowerCase()` - camelCase to hyphen-case converter
- `var cssClassMatchRegex = new RegExp(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/g)` - regex to match all classes in a string (maybe useful for "scoping")
- `Math.random().toString(36).split(".")[1]` - unique ID generator (create a unique id for each new component)
- `cssString.replace(/\n/g, '').replace(/\s\s+/g, ' ')` - minify string of CSS

### VDOM and VDOM diffing

- [snabbdom](https://github.com/snabbdom/snabbdom) - the vdom diffing library used by Vue.js
- [snabby](https://github.com/mreinstein/snabby) - use HTML template strings to generate vdom, use with snabbdom
- [petit-dom](https://github.com/yelouafi/petit-dom) - tiny vdom diffing and patching library
- [developit/htm](https://github.com/developit/htm) - JSX alternative, using ES6 tagged templates to generate vdom trees
- [hyperx](https://github.com/choojs/hyperx) - use tagged template string to build virtual dom trees, which then need diffing/patching

### Routers

- [router](https://github.com/sc0ttj/router) - a tiny, simple isomorphic router

### Other tiny component libraries

- [yo-yo](https://github.com/maxogden/yo-yo/) - tiny UI library, DOM diffing (morphdom), Event handling, ES6 tagged template literals 
- [hyperapp](https://github.com/jorgebucaran/hyperapp) - The tiny framework for building web interfaces
- [preact](https://github.com/preactjs/preact) - a 3.1kb alternative to React.js
- [choojs](http://github.com/choojs/) - A 4kb framework for creating sturdy frontend applications
