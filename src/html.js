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

const html = (strings, ...vals) => {
  // create a property in which to save event attribute funcs, which we'll
  // later attach to their elements as proper event listeners
  html.funcs = html.funcs || [];
  // start: loop over the template content
  var output = strings.map((str, i) => {
    html.i = html.i || i;
    var v = vals[i] || '';
    // dont ignore zeros
    if (typeof vals[i] === 'number') v = vals[i]
    var ctx = 'attr'
    // workout our current "context" (either inside an HTML opening tag,
    // inside a style attribute, or inside a data-* attribute)
    if (str.match(/style=("|')$/i)) { //"
      ctx = 'style'
    }
    // check if dealing with a html `data-*` attribute
    else if (str.match(/data-[a-z0-9\-_]+=("|')$/i)) { //"
      ctx = 'dataAttr'
    }

    // check for a nested component
    else if (typeof v === 'function' && v.uid && v.state && v.setState && v.render) {
      ctx = 'nestedComponent'
    }
    // check for event attributes like `onclick="{someFunc}"` etc
    else if (typeof v === 'function'
        && ctx === 'attr'
        && str.match(/ on[a-z0-9]+=("|')$/i)) //"
    {
      ctx = 'funcAttr'
    }


    // check for either an Element, HTML Collection, Node List, String,
    // Object, etc):
    // if current value to process (v) is an HTML Object of any kind,
    // gets its outer HTML and use that
    if (v.nodeName && ctx === 'attr') {
      v = v.outerHTML;

    } else if (ctx === 'nestedComponent' && typeof v === 'function') {

      // *Important* ..We have a nested component, with its own state and
      // render loop, but without a container.. We don't need or want it to
      // setState and re-render, we just want it's latest "view", which is
      // also much faster to get than doing a whole setState + re-render
      str += v.view(v.state)
      v=''

    } else if (ctx === 'funcAttr' && typeof v === 'function' && !v.uid) {
      // keep the function for later, but dont include it in output
      if (Array.isArray(html.funcs)) html.funcs[html.i] = v;
      // replace `onclick="..." with onclick="${i}" - we'll reference
      // it later, once it's a real Element, so we can attach funcs[i] to
      // it, as a proper event listener method
      v='';
      str += html.i
    } else if (Array.isArray(v)) {
      // if we have a Node List or HTML Collection, convert its
      // items to strings
      if (v[0].nodeName) v = v.map(n => `${n.outerHTML}`)
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
          if (p && v && v.hasOwnProperty(p) && typeof v[p] !== "object") {
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
    // fix not returning zeros (JS treats them as "falsey")
    if (vals[i] === 0) v = "0"
    // now we've converted `v` to a string version of whatever is was,
    // we can return the current string, with `v` appended, and then
    // move to next iteration

    html.i += 1;
    return str ? str + (v || '') : '';
  }).join('');

  // return the compiled HTML as a string
  return output;
}

export default html
