var Component = require("../src/component.js")

// ------------------------------------------------
// USAGE: Defining components
// ------------------------------------------------

// Define our app state
var state = {
  count: 0,
  incrementBy: 5,
  id: "foo-id",
  items: [{ name: "Item one" }, { name: "Item two" }],
  btnColor: "green"
}

// Define some generic, re-usable, stateless "sub-components"
var Heading = text => `<h1>${text}</h1>`

var List = items =>
  `<ul>${items.map(item => `<li>${item.name}</li>`).join("")}</ul>`

var Button = (label, fn) =>
  `<button class="btn" onclick=${fn}>${label}</button>`

// Define a stateful main component
var App = new Component(state)

// OPTIONAL: call only 'setState()' instead of 'App.setState()'
var setState = App.setState

// OPTIONAL: Define some events
clickBtn = props => setState({ count: App.state.count + props })

// IMPORTANT: Define a view - a function which receives the
// state as `props` and returns the view as a string or JSON

// Create an HTML view, using template literals
var htmlView = props => `
    <div id=${props.id}>
      ${Heading("Total so far = " + props.count)}
      ${List(props.items)}
      ${Button("Click here", `clickBtn(${props.incrementBy})`)}
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
//
// ------------------------------------------------
// USAGE: Using the component
// ------------------------------------------------

//
// You'd normally use your components inside a web server, etc,
// in order to do "server side rendering" (SSR)
//

// Using setState() to trigger a full re-render
App.setState({ items: [{ name: "First" }] })

// ...Or directly call any methods you defined
clickBtn(1)

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
//
//
// Now return the component...

// Returns the current view (and any App styles you
// defined) as a string, or a JS object
//
// (for demo purposes we console log it, so you can see
// the component rendered to the terminal)
console.log(App.render())

//
// ------------------------------------------------
// OPTIONAL: Using the state "timeline"
// ------------------------------------------------

// Take a "snapshot" (we'll use it later)
var snapshot = App.state

App.rewind() // go to initial state
App.forward() // go to latest state
App.rewind(2) // rewind two steps to a previous state
App.forward(2) // fast-forward two steps to a more current state
App.undo() // same as App.rewind(1)
App.redo() // same as App.forward(1)

// Set a previous state
App.setState(App.history[2].state)
// Set a "named" state, from a previous point in time
App.setState(snapshot)
