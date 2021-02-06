// persistent states for NodeJS:
//
// 1. Polyfill localStorage, then setup Component to use its "storage" add-on
// 2. Define your component
// 3. Call myComponent.render() to get the lastest saved state
// 4. Now you're ready - calling setState saves the state to persistent storage :)
//

// polyfill localStorage for NodeJS
const { LocalStorage } = require('node-localstorage');
const localStorage = new LocalStorage('storage/')

// attach the storage add-on to Component, so it'll get used
const { Component, storage } = require('../dist/index.min.js');
Component.storage = storage

// create our component
const Counter = new Component({ count: 0 });
// define a name for the store in which to keep the component state
Counter.store = "Counter"
// then get the saved state from localStorage
Counter.render()


// ...now we're ready - any state updates will be saved to local storage..

// update the state: add to the total count
Counter.setState({ count: Counter.state.count + 1 })

// now let's see the count total
console.log(Counter.state);


// Re-run this script lots of times - the counter total will increase each time:
//
// Command to run:
//
//    node -r node-localstorage/register examples/usage-persistant-state.js
//
