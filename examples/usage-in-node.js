var { Component } = require("../dist/index.min.js")
Component.validator = require("@scottjarvis/validator")

// ------------------------------------------------
// USAGE: Defining components
// ------------------------------------------------

// Define our app state
var state = {
  count: 0,
  incrementBy: 5,
  id: "foo-id",
  items: [{ name: "Item one" }, { name: "Item two" }],
  btnColor: "green",
  foo: {
    bar: 0,
    bob: {
      ppp: "foobar"
    }
  }
}

// Define some generic, re-usable, stateless "sub-components"
var Heading = text => `<h1>${text}</h1>`

var List = items =>
  `<ul>${items.map(item => `<li>${item.name}</li>`).join("")}</ul>`

// OPTIONAL: Define the schema against which to validate state updates
var schema = {
  count: "number",
  incrementBy: "number",
  id: "string",
  items: "array",
  btnColor: "string",
  foo: {
    bar: "number",
    bob: {
      ppp: "string"
    }
  }
}

// Define a stateful main component: pass in
// a schema as an optional, second param
var App = new Component(state, schema)

// IMPORTANT: Define a view - a function which receives the
// state as `props` and returns the view as a string or JSON

// Create an HTML view, using template literals
var htmlView = props => `
    <div id=${props.id}>
      ${Heading("Total so far = " + props.count)}
      ${List(props.items)}
    </div>`

// ...or a JS object view
var jsonView = props => {
  return { count: props.count, items: props.items }
}

// ...or return the state itself (pure headless component)
var dataOnlyView = props => props

// ... for now, lets use data view
App.view = dataOnlyView

// ------------------------------------------------
// OPTIONAL: Define chainable "actions", to update the state more easily
// ------------------------------------------------

// OPTIONAL: call only 'setState()' instead of 'App.setState()'
var setState = App.setState

// These "actions" are like regular methods, except
// they're always chainable and tagged by name in
// your components state history
App.actions({
  update: props => setState({ props }), // same as calling App.setState()

  reset: props => setState({ count: 0 }),

  count: props => setState({ count: props }),

  plus: props => setState({ count: App.state.count + props }),

  minus: props => setState({ count: App.state.count - props }),

  items: props => setState({ items: props }),

  addItems: props => setState({ items: [...App.state.items, ...props] })
})

//
// ------------------------------------------------
// OPTIONAL: using "middleware" functions to enhance setState behaviour
// ------------------------------------------------

// Define some "middleware" functions - these are called right after setState().
// Note that "props" will contain the latest state (that was just set)
var countLog = props => console.log("middleware -> count logger: ", props.count)
var itemsLog = props => console.log("middleware -> items logger: ", props.items)

// Add your "middleware" to a component as an array of functions
App.middleware = [countLog, itemsLog]

// ...now every time setState() is called, each middleware function
// in the array will run too.

//
// ------------------------------------------------
// USAGE: Using the component (setting state)
// ------------------------------------------------

//
// You'd normally use your components inside a web server, etc,
// in order to do "server side rendering" (SSR)
//

// Using setState() to trigger a full re-render
setState({ items: [{ name: "First" }] })

// If you defined some "actions", you can use them
// to update specific parts of your state
App.plus(105)
App.minus(5)

// A components "actions" can be chained
App.minus(1)
  .minus(1)
  .minus(1)
  .plus(3)
  .addItems([{ name: "two" }, { name: "three" }])

//
// ------------------------------------------------
// OPTIONAL: Using the state "timeline"
// ------------------------------------------------

// Take a "snapshot" (we'll use it later)
var snapshot = App.state

App.rw() // go to initial state
App.ff() // go to latest state
App.rw(2) // rewind two steps to a previous state
App.ff(2) // fast-forward two steps to a more current state

// Set a previous state
App.setState(App.log[0].state)
// Set a "named" state, from a previous point in time
App.setState(snapshot)

//
// ------------------------------------------------
// OPTIONAL: State validation:
// ------------------------------------------------
//
// Uncomment below to cause an error, as "count" should be a number!
// setState({ count: "one" })

//
// ------------------------------------------------
// Now return or render the component:
// ------------------------------------------------
//
// Returns the current view (and any App styles you
// defined) as a string, or a JS object
//
// (for demo purposes we console log it, so you can see
// the component rendered to the terminal)
console.log(App.render())
