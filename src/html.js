/*
 * html`<div>...</div>`
 * - allows a cleaner, more powerful way to create HTML using JS Template literals:
 *   - auto joins arrays, without adding commas (so no need to keep using .join('') in your templates)
 *   - supports embedding real DOM nodes: Node Lists, HTML Collections, HTML Objects, Elements
 *   - supports embedding JS Objects as HTML attributes, CSS styles, and HTML data attributes:
 *     - `html` works out the context and converts the given object to an appropriate string
 *     - `html` ignores/strips nested child objects when converting to string
 *   - hides falsey stuff (instead of printing "false" [etc] in the output)
 *   - returns generated HTML as a string
 *
 * @param {Template Literal} representing a single HTML element
 * @return {String}
 */
var html = (strings, ...vals) => {
  var output = strings.map((str, i) => {
    var v = vals[i] || '';

    // workout our current "context" (either inside an HTML opening tag,
    // inside a style attribute, or inside a data-* attribute)
    var ctx = 'attr'
    if (str.match(/style=("|')$/i)) { //"
      ctx = 'style'
    }
    else if (str.match(/data-[a-z0-9\-_]+=("|')$/i)) { //"
      ctx = 'dataAttr'
    }

    // get the "type" of the current value (either an Element, HTML
    // Collection, Node List, String, Object, etc):

    // if current value to process (v) is an HTML Object of any kind,
    // gets its outer HTML and use that
    if (v.nodeName) {
      v = v.outerHTML;

    } else if (Array.isArray(v)) {
      // if we have a Node List or HTML Collection, convert its
      // items to strings
      if(v[0].nodeName) v = v.map(n => `${n.outerHTML}`)
      // now concat the array itself to string
      v = v.join('');

    } else if (typeof v === "object") {
      var s = ''; // the string to build from our object (if needed)
      if (ctx === 'dataAttr') {
        // if object is for a data attr, add it as JSON
        s += JSON.stringify(v).trim();
      } else {
        // gets the objects properties as strings,
        // while ignoring nested objects, arrays etc
        for (var p in v) {
          if (v.hasOwnProperty(p) && typeof v[p] !== "object") {
            // if inside a style attr, return `key: val;`
            // if inside an HTML tag, return ` key="val"`
            if (ctx === 'style') s += `${p}:${v[p]};`;
            if (ctx === 'attr')  s += ` ${p}="${v[p]}"`;
          }
        }
      }
      // now we've built the appropriate string, set it as the value to
      // add to our template
      v = s
    }
    // now we've converted `v` to a string version of whatever is was,
    // we can return the current string, with `v` appended, and then
    // move to next iteration
    return str ? str + (v || '') : '';
  }).join(''); // join it all together as a single string

  // return the compiled HTML as a string
  return output;
}

export default html
