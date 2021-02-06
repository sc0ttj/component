import html from './html'

/**
 * htmel`<div>...</div>`
 * - allows a cleaner, more powerful way to create HTML using JS Template literals:
 *   - auto joins arrays, without adding commas (so no need to keep using .join('') in your templates)
 *   - supports embedding real DOM nodes: Node Lists, HTML Collections, HTML Objects, Elements
 *   - supports embedding JS Objects as HTML attributes, CSS styles, and HTML data attributes:
 *     - `html` works out the context and converts the given object to an appropriate string
 *     - `html` ignores/strips nested child objects when converting to string
 *   - supports embedding functions in event attributes:
 *     - `htmel` will attach them as callbacks to the relevant Event Listeners
 *   - hides falsey stuff (instead of printing "false" [etc] in the output)
 *   - returns the generated HTML as an HTML Object (browser) or a string (NodeJS)
 *
 * @param {Template Literal} HTML representing a single element
 * @return {Element|String}
 */
var htmel = (strings, ...vals) => {
  var out = html(strings, ...vals).trim(); // use .trim() so we never return a text node of whitespace as the result
  // if not in a browser, return the HTML as a string
  if (!document) return out;
  // else, return the HTML as a proper HTML Object
  var t = document.createElement('template');
  t.innerHTML = out;
  // get all elems inside our template
  var elems = t.content.firstChild.children;
  // for each elem, get its attributes
  for (var i = 0; i < elems.length; i++) {
    var attrs = elems[i].attributes;
    // for each attribute, check it starts with `on`
    for (var q = 0; q < attrs.length; q++) {
      var attr = attrs[q];
      if (attr.name.match(/^on/)) {
        // if attribute starts with "on", remove it
        elems[i].removeAttribute(attr.name);
        // and assign the function as a proper event listener instead
        elems[i].addEventListener(attr.name.replace(/^on/, ''), html.funcs[attr.value])
      }
    }
  }
  return t.content.firstChild;
}

export default htmel
