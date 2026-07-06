import html from './html'

const reEventAttr = /^on/;
const onAttr = attr => attr.nodeName && attr.nodeName.match(reEventAttr);

const htmel = (strings, ...vals) => {
  var out = html(strings, ...vals).trim();
  if (!document) return out;
  var t = document.createElement('template');
  t.innerHTML = out;
  var root = t.content.firstChild;
  if (!root) return out;
  // attach event listeners recursively to all elements
  var all = root.querySelectorAll('*');
  for (var i = 0; i < all.length; i++) {
    var el = all[i];
    var attr;
    for (var q = 0; q < el.attributes.length; q++) {
      attr = el.attributes[q];
      if (onAttr(attr)) {
        var fn = html.funcs[attr.value];
        if (typeof fn === 'function') {
          el.removeAttribute(attr.nodeName);
          el.addEventListener(attr.nodeName.replace(reEventAttr, ''), fn);
        }
      }
    }
  }
  return root;
}

export default htmel
