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
- Just 1.4kb, minified and gzipped
- No build tools or transpiler needed
- Simple syntax, easy to use, easy to learn
- Plain JavaScript wherever possible
- Works **client-side**, in browsers:
  - add your component to the page as you would a normal Element
  - auto re-render on state change, with DOM-diffing
- Works **server-side**, in Node:
  - render your components as strings (HTML, stringified JSON)
  - render your components as data (JS objects or JSON)
- ...and more

Your components will support:

- Auto re-render on state change
- DOM diffing for fast re-renders
- Scoped CSS styling, with re-rendering on CSS changes
- Event attributes like `onclick`, `onchange`, `onkeyup`, etc, etc
- Easy state management:
  - define "actions" to easily update the state in specific ways 
  - a state timeline:
    - a log/history of all changes to the component state
    - rewind or fast-forward to any point in the state history
    - save/load current or any previous state as "snapshots"
- Simple, stateless "child" components
- Server side rendering
- ...and more

## Limitations

Currently, the most important limitations are:

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
App.render('.container')

// ...later

// Update the state, the page will re-render for you
App.setState({ title: "Hello again!" })
```

An overview:

- **App.state**: an object, contains your app data, read-only - cannot be modified directly
- **App.view(props)**: receives a state and sets the component view to (re)render
- **App.style(props)**: receives a state and sets the `<style>` to (re)render
- **App.render(el)**: (re)render to the given element on state change (browser)
- **App.toString()**: render your component as a string on state change (NodeJS)
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

App.rw()         // go to initial state
App.ff()         // go to latest state
App.rw(2)        // rewind two steps to a previous state
App.ff(2)        // fast-forward two steps to a more current state

// Set a previous state
App.setState(App.log[2].state)

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

If rendering a component with `.view()` and `.style()` defined in Node, or calling `.toString()` directly, the output will be a string like this one:

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

## Changelog

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

Look in `src/component.js`, make any changes you like.

Minify it (your choice how), and save the minified version to `dist/component.min.js`

## Future improvements

- Performance:
  - Batched rendering: only needed in browser, use requestAnimationFrame:
    - [main-loop](https://github.com/Raynos/main-loop)
    - [Animation loops - gist](https://gist.github.com/louisremi/1114293)
  - Memoize state updates: so we can return cached states and views

- Usability:
  - Better CSS-in-JS: 
    - define a components CSS using regular JS objects (alternative to template strings)
    - auto-scoped CSS, with namespaced/prefixed classes 
    - see [twirl](https://github.com/benjamminj/twirl-js)
  - Better Event handling: so `onclick` etc receive proper `Event` objects. See these links:
    - [yo-yo](https://github.com/maxogden/yo-yo) - hooks into morphdom, and manually copies events handlers to new elems, if needed
    - [nano-html](https://github.com/choojs/nanohtml/blob/master/lib/set-attribute.js) - similar to above

- Better SSR
  - server-side: 
    - render as streams/chunks (deliver page to clients in bits, soon as its ready):
     - see [almost/stream-template](https://github.com/almost/stream-template)
     - see [bogas04/marinate](https://github.com/bogas04/marinate)
  - client-side: 
    - ability to "hydrate" or takeover a view that already exists in the page:
      - simply don't define a view, and call `App.render('.container')`:
        - any `id` or `class` attributes will become items in `App.state`
        - the contents will be grabbed and used for a new `.view()`
      - for (re)attaching events, see [yo-yo](https://github.com/maxogden/yo-yo)
  
- Universal rendering (add-on):
  - use [tagged templates](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals) to render from HTML strings to:
    - virtual DOM (see `htm`, `hyperx`, `snabby`)
    - real DOM (see `bel`, `genel`, ...)
    - ANSI console markup (?)
    - markdown (?)
    - files (?)

## Related projects:

### DOM and DOM diffing

- [BAD-DOM](https://codepen.io/tevko/pen/LzXjKE?editors=0010) - a tiny (800 bytes) lazy DOM diffing function (used by this project)
- [morphdom](https://github.com/patrick-steele-idem/morphdom/) - a nice, fast DOM differ (not vdom, real DOM)
- [set-dom](https://github.com/DylanPiercey/set-dom) - tiny dom diffing library
- [fast-html-parser](https://www.npmjs.com/package/fast-html-parser) - generate a simplified DOM tree from string, with basic element querying

### Template strings to real DOM nodes

- [htl](https://observablehq.com/@observablehq/htl)- by Mike Bostock, events, attr/styles as object, other syntactic sugar, 2kb
- [nanohtml](https://github.com/choojs/nanohtml) - uses vdom, can attach event listers, can do SSR, 8kb
- [domify-template-strings](https://github.com/loilo-archive/domify-template-strings) - get real DOM nodes from HTML template strings, browser only, no SSR
- [genel](https://github.com/capsidjs/genel) - create real DOM nodes from template string, browser only (no SSR), 639 bytes

### CSS in JS

- [twirl](https://github.com/benjamminj/twirl-js) - a tag for template literals, turns CSS into objects 
- `/(^|,)[\.#a-z][a-zA-Z0-9_\-:]*/gm` - match first part of CSS selector in a CSS string, useful for scoping (see https://regexr.com/524pu)
- `document.styleSheets[0].cssRules[0].style.cssText.split(/\;[\s.]/).slice(0,-1)` - convert cssText to array containing CSS proprties and values, like "margin:0 auto;"
- `str.replace(/([A-Z])/g, "-$1").toLowerCase()` - camelCase to hyphen-case converter
- `var cssClassMatchRegex = new RegExp(/\.(-?[_a-zA-Z]+[_a-zA-Z0-9-]*)(?![^\{]*\})/g)` - regex to match all classes in a string (maybe useful for "scoping")
- `Math.random().toString(36).split(".")[1]` - unique ID generator (create a unique id for each new component)
- `cssString.replace(/\n/g, '').replace(/\s\s+/g, ' ')` - minify string of CSS

### VDOM and VDOM diffing

- [developit/htm](https://github.com/developit/htm) - JSX like syntax in ES6 templates, generates vdom
- [snabbdom](https://github.com/snabbdom/snabbdom) - the vdom diffing library used by Vue.js
- [snabby](https://github.com/mreinstein/snabby) - use HTML template strings to generate vdom, use with snabbdom
- [petit-dom](https://github.com/yelouafi/petit-dom) - tiny vdom diffing and patching library
- [hyperx](https://github.com/choojs/hyperx) - tagged templates to vdom (used by [nanohtml](https://github.com/choojs/nanohtml)

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

