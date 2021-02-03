//
// Example applications  -  Note: apps don't need to be wrapped & returned
//                          in functions, as they're not intended to be
//                          "re-usable" like components.

// 1. "Counter" app

const Counter = new Component({ count: 1 });

const add = num => Counter({ count: Counter.state.count + num })

Counter.view = props => htmel
  `<div>
    <h1>Counter: ${props.count}</h1>
    <button onclick="${e => add(+1)}"> + </button>
    <button onclick="${e => add(-1)}"> - </button>
  </div>`;


// 2. "Todo" app

const Todo = new Component({ txt: '', list: [ "one" ] });

const setText = e => Todo({ txt: e.target.value });
const addItem = e => Todo({ list: [ ...Todo.state.list, Todo.state.txt ] });

Todo.view = props => htmel
  `<div>
    <h1>Todo</h1>
    <input  onkeyup="${setText}" value="${props.txt}" type="text" />
    <button onclick="${addItem}"> Add Note </button>
    <ul>
      ${props.list.map(i => `<li>${i}</li>`)}
    </ul>
  </div>`;


// -----------------------------------------------------------------------
//
//
// Examples of *re-usable* components:
//


// 1. Stateless components:
//    - These should be used in the `view` of your main (stateful) components.

// just a function that returns a string of HTML
const Header = props => `<h1>${props.title}</h1>`;

// just a function that returns anything, really...
const timesTen = props => props * 10;



// 2. Stateful components:
//
// These are "main" or "top-level" components.
//
// These are the same as the "apps" above except they're also wrapped
// in a function that creates then returns them.

// simplest possible re-usable component definition, ES6
const Foo = () => new Component({});

// simplest possible re-usable component definition, ES5 (old school JS)
function Foo() {
  return new Component({});
}

// very simple data component, with state validation
function Foo() {
  const state  = { count: 1 };
  const schema = { count: 'number' };
  const Foo = new Component(state, schema);

  return Foo;
}

// a stateful, re-usable HTML component - define a `view` that returns HTML
function Header() {
  const Header = new Component({ title: 'hey' });
  Header.view  = props => `<h1>${props.title}</h1>`;

  return Header;
}

// set a default state and schema
function Header() {
  const state  = { title: 'Hello world' };
  const schema = { title: 'string' };

  const Header = new Component(state, schema);
  Header.view  = props => `<h1>${props.title}</h1>`;

  return Header;
}

// allow user to set initial state
function Header(state) {
  const defaults  = { title: 'Hello world' };
  const schema = { title: 'string' };

  const Header = new Component({ ...defaults, ...state }), schema);
  Header.view  = props => `<h1>${props.title}</h1>`;

  return Header;
}

// allow user to set initial state and define their own schema!
function Header(state, schema) {
  const defaults  = { title: 'Hello world' };

  const Header = new Component({ ...defaults, ...state), schema);
  Header.view  = props => `<h1>${props.title}</h1>`;

  return Header;
}

// ...in all cases, you'd use these re-usable Components like so:
// (NOTE: state and schema can be passed in, even if not used)

const header1 = new Header(state, schema);
const header2 = new Header(state, schema);

header1.render('#some-elem1')
header1.render('#some-elem2')

header1({ title: "One!" })
header2({ title: "Two!" })


// -------------------------------------------------------------------------
// -------------------------------------------------------------------------

// You can use `html` or `htmel` standalone, without any Component stuff:

const foo = "Hello world"

const el = htmel`<h1>${foo}</h1>`

const string = html`<h1>${foo}</h1>`

// ..or in functions that return pre-defined HTML snippets from templates:

const para = data => htmel`<p>${data}</p>`

const list = data => htmel`<ul>${data.map(val => `<li>${val}</li>`)}</ul>`

// now generate the DOM elements
const p  = para("Put me in a paragraph.")
const ul = list([ "one", "two", "three" ])

