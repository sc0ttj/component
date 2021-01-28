  /*
   * html`<div>...</div>`
   * - allows easier HTML in template literals:
   *   - auto joins arrays, without adding commas (so no need to keep using .join('') in your templates)
   *   - supports embedding HTML Objects (using the outerHTML attr)
   *   - supports embedding JS Objects (so you can use `style="${someObj}"`):
   *     - ignores/strips nested child objects when converting to string
   *   - hides falsey stuff (instead of printing "false" [etc] in the output)
   *   - returns generated HTML as a string
   *
   * @param {Template Literal} HTML representing a single element
   * @return {String}
   */
  var html = (strings, ...vals) => {
    var output = strings.map((str, i) => {
      var v = vals[i] || '';
      var s = '';
      if (v.nodeName) {
        // if we have an HTML Element, get its HTML as a string
        v = v.outerHTML;
      } else if (Array.isArray(v)) {
        // if we have HTML Collection, get all HTML as a string
        if(v[0].nodeName) v = v.map(n => `${n.outerHTML}`)
        v = v.join('');
      } else if (typeof v === "object") {
        // if we have an Object, gets its properties as a strings,
        // and ignore nested objects, arrays etc
        for (var p in v) {
          if (v.hasOwnProperty(p) && typeof v[p] !== "object") {
            s += `${p}:${v[p]};`;
          }
        }
        v = s;
      }
      // now we've converted `v` to a string version of whatever is was,
      // we can return the current string, with `v` appended
      return str ? str + (v || '') : '';
    }).join('');
    return output;
  }

  /**
   * @param {String} HTML representing a single element
   * @return {Element}
   */
  function htmlToElement(html) {
      var template = document.createElement('template');
      html = html.trim(); // Never return a text node of whitespace as the result
      template.innerHTML = html;
      return template.content.firstChild;
  }

  /**
   * htmel`<div>...</div>`
   * - allows easier HTML in template literals:
   *   - auto joins arrays, without adding commas (so no need to keep using .join('') in your templates)
   *   - supports embedding HTML Objects (using the outerHTML attr)
   *   - supports embedding JS Objects (so you can use `style="${someObj}"`):
   *     - ignores/strips nested child objects when converting to string
   *   - hides falsey stuff (instead of printing "false" [etc] in the output)
   *   - returns the generated HTML as an HTML Object (browser) or a string (NodeJS)
   *
   * @param {Template Literal} HTML representing a single element
   * @return {Element|String}
   */
  var htmel = (strings, ...vals) => {
    var out = html(strings, ...vals);
    return !!document ? htmlToElement(out) : out;
  }
