var { Component, emitter } = require("../dist/index.min.js")
Component.emitter = emitter

// ------------------------------------------------
// USAGE: Defining components
// ------------------------------------------------

// Define our app state
var state = {
  count: 0,
  items: [{ name: "one" }]
}
// Define a stateful main component
var App = new Component(state)

// ------------------------------------------------
// OPTIONAL: Define chainable "actions", to update the state more easily
// ------------------------------------------------

// These "actions" are like regular methods, except
// they're always chainable and tagged by name in
// your components state history
App.actions({
  update: props => App.setState({ props }), // same as calling App.setState()

  reset: props => App.setState({ count: 0 }),

  count: props => App.setState({ count: props }),

  plus: props => App.setState({ count: App.state.count + props }),

  minus: props => App.setState({ count: App.state.count - props }),

  items: props => App.setState({ items: props }),

  addItems: props => App.setState({ items: [...App.state.items, ...props] })
})

// ---------------------------------------------------
// Using the "Event emitter"
// ---------------------------------------------------

// If you included the "emitter", then any "actions" you define will emit its
// name as an event. You can listen to these with the "on" method.

// Example:
//  - Log the first time the "minus" action is called
//  - Log every time the "plus" and "addItems" actions are called

// Define a "listening" component
var Foo = new Component({})

Foo.once("minus", props => console.log("Foo: action 'minus'", props.count))
  .on("plus", props => console.log("Foo: action 'plus'", props.count))
  .on("addItems", props => console.log("Foo: action 'addItems'", props.items))

//
//
// ------------------------------------------------
// USAGE: Using the component
// ------------------------------------------------

console.log("")
console.log("App state:")
console.log(App.render())
console.log("")

// If you defined some "actions", you can use them
// to update specific parts of your state
App.plus(105)
App.minus(5)

Foo.off("plus")

// A components "actions" can be chained
App.minus(1)
  .minus(1)
  .minus(1)
  .plus(3)
  .addItems([{ name: "two" }, { name: "three" }])

//
//
// Now return the component...

// Returns the current view (and any App styles you
// defined) as a string, or a JS object
//
// (for demo purposes we console log it, so you can see
// the component rendered to the terminal)
console.log("")
console.log("App state:")
console.log(App.render())

// Or render the component as an HTTP response,
// using something like express.js:
//
// res.send(App.render())
