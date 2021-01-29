import html from './html'

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
   *   - hides falsey stuhff (instead of printing "false" [etc] in the output)
   *   - returns the generated HTML as an HTML Object (browser) or a string (NodeJS)
   *
   * @param {Template Literal} HTML representing a single element
   * @return {Element|String}
   */
  var htmel = (strings, ...vals) => {
    var out = html(strings, ...vals);
    return !!document ? htmlToElement(out) : out;
  }

export default htmel
