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

console.log("App.state\n", App.state)
console.log("")

// give the state to tween to, with some tween options as the (optional) 2nd param

App.tweenState(
  // 1st param - object - the new state values to tween to...
  // pass in only the properties that you want to tween!
  { count: 200, foo: 10, bar: { zzz: 999 } },
  // 2nd param - object - the tween settings
  {
    delay: 0,
    duration: 350,
    ease: "linear",
    paused: false,
    // called on first frame:
    onStart: tweenProps => console.log("Start tween:"),
    // called on every frame:
    onUpdate: tweenProps => console.log(tweenProps.values),
    // called on last frame:
    onComplete: tweenProps => console.log("\nApp.state:\n", App.state),
    // called on every frame, choose to set state or not (return true or false)
    shouldSetState: tweenProps => tweenProps.frame % 2 > 0, // for example, this will set state only on odd frame numbers
    // called only on the frames where the state was updated:
    onSetState: tweenProps => tweenProps
  }
)
