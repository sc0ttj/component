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

const reStyle = /style=("|')$/i,
      reDataAttr = /data-[a-z0-9\-_]+=("|')$/i,
      reEventAttr = / on[a-z0-9]+=("|')$/i,
      hasOwn = Object.prototype.hasOwnProperty;

const html = (strings, ...vals) => {
  html.funcs = [];
  html.i = 0;
  var output = strings.map((str, i) => {
    var v = vals[i] || '';
    if (typeof vals[i] === 'number') v = vals[i]
    var ctx = 'attr'
    if (str.match(reStyle)) {
      ctx = 'style'
    } else if (str.match(reDataAttr)) {
      ctx = 'dataAttr'
    } else if (typeof v === 'function' && v.uid && v.state && v.setState && v.render) {
      ctx = 'nestedComponent'
    } else if (typeof v === 'function' && ctx === 'attr' && str.match(reEventAttr)) {
      ctx = 'funcAttr'
    }

    if (v.nodeName && ctx === 'attr') {
      v = v.outerHTML;

    } else if (ctx === 'nestedComponent' && typeof v === 'function') {
      str += v.view(v.state)
      v=''

    } else if (ctx === 'funcAttr' && typeof v === 'function' && !v.uid) {
      if (Array.isArray(html.funcs)) html.funcs[html.i] = v;
      v='';
      str += html.i
    } else if (Array.isArray(v)) {
      if (v[0].nodeName) v = v.map(n => `${n.outerHTML}`)
      v = v.join('');

    } else if (typeof v === "object") {
      var s = '';
      if (ctx === 'dataAttr') {
        s += JSON.stringify(v).trim();
      } else {
        for (var p in v) {
          if (p && hasOwn.call(v, p) && typeof v[p] !== "object") {
            if (ctx === 'style') s += `${p}:${v[p]};`;
            if (ctx === 'attr')  s += ` ${p}="${v[p]}"`;
          }
        }
      }
      v = s
    }
    if (vals[i] === 0) v = "0"
    html.i += 1;
    return str ? str + (v || '') : '';
  }).join('');

  return output;
}

export default html
