// import the component library as usual
var { Component, tweenState } = require("../dist/index.min.js")
Component.tweenState = tweenState

// ------------------------------------------------
// USAGE: Defining components
// ------------------------------------------------

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

// return the state itself (pure headless, data-only component)
App.view = props => props

//
// ------------------------------------------------
// Tween (animate) from one state to the next
//

console.log("App.state", App.state)
console.log("")
console.log("Tweening of the 'count', 'foo' and 'bar.zzz' properties, start:\n")

// give the state to tween to, with some tween options as the (optional) 2nd param

App.tweenState(
  // 1st param - object - the new state values to tween to...
  // pass in only the properties that you want to tween!
  { count: 200, foo: 10, bar: { zzz: 999 } },
  // 2nd param - object - the tween settings
  {
    delay: 0,
    duration: 500,
    ease: "linear",
    onUpdate: tweenProps => console.log(tweenProps.values),
    onComplete: tweenProps => console.log("\nApp.state:\n", App.state),
    paused: false
  }
)
