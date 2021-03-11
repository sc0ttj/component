;("use strict")

// t = target
// s = source
const domDiff = (t, s) => { // from https://codepen.io/tevko/pen/LzXjKE?editors=0010
  const job = {
    cfg: {
      orig: t
    },
    // t = target
    // s = source
    replace(t, s = t) {
      const v = document.createElement("template")
      v.innerHTML = s
      const vHTML = v.content.firstElementChild
      if (vHTML.nodeName !== t.nodeName) {
        t.parentElement.replaceChild(vHTML, t)
        return
      }
      this.loop(t, vHTML)
    },
    // tn = target Node
    // sn = source Node
    loop(tn, sn, tOrig) {
      if (tn || sn) {
        this.checkNew(tn, sn, tOrig)
        if (
          tn &&
          sn &&
          tn.nodeName !== sn.nodeName
        ) {
          this.checkNodeName(tn, sn)
        } else if (
          tn &&
          sn &&
          tn.nodeName === sn.nodeName
        ) {
          this.checkCtx(tn, sn)
          tn.nodeType !== 3 &&
            t.nodeType !== 8 &&
            this.checkAttrs(tn, sn)
        }
      }
      if (tn && sn) {
        if (tn.childNodes && sn.childNodes) {
          this.cfg.lengthDiff = [
            ...t.childNodes,
            ...sn.childNodes
          ]
        } else {
          this.cfg.lengthDiff = null
        }
        Array.apply(null, this.cfg.lengthDiff).forEach(
          (node, idx) => {
            this.cfg.lengthDiff &&
              this.loop(
                tn.childNodes[idx],
                sn.childNodes[idx],
                tn,
                sn
              )
          }
        )
      }
    },
    checkNodeName(tn, sn) {
      const n = sn.cloneNode(true)
      tn.parentElement.replaceChild(n, tn)
    },
    checkAttrs(tn, sn) {
      const attrs = tn.attributes || []
      const filteredAttrs = Object.keys(attrs).map(n => attrs[n])
      const attrsNew = sn.attributes || []
      const filteredAttrsNew = Object.keys(attrsNew).map(
        n => attrsNew[n]
      )
      filteredAttrs.forEach(o => {
        return sn.getAttribute(o.name) !== null
          ? tn.setAttribute(o.name, sn.getAttribute(o.name))
          : tn.removeAttribute(o.name)
      })
      filteredAttrsNew.forEach(a => {
        return (
          tn.getAttribute(a.name) !== sn.getAttribute(a.name) &&
          tn.setAttribute(a.name, sn.getAttribute(a.name))
        )
      })
    },
    checkCtx(tn, sn) {
      if (tn.nodeValue !== sn.nodeValue) {
        tn.textContent = sn.textContent
      }
    },
    checkNew(tn, sn, tParent = this.cfg.orig) {
      if (sn && tn === undefined) {
        const newNode = sn.cloneNode(true)
        tParent.nodeType !== 3 &&
          tParent.nodeType !== 8 &&
          tParent.appendChild(newNode)
      } else if (tn && sn === undefined) {
        tn.parentElement.removeChild(tn)
      }
    }
  }
  // t = target
  // s = source
  Object.create(job).replace(t, s)
}

let timeout;

const render = (view, sel) => {
  if (!window) return v

  const v = typeof view === 'function' ? view() : view
  const c = document.querySelector(sel)

  if (timeout) cancelAnimationFrame(timeout)

  timeout = requestAnimationFrame(() => {
    if (c && c.nodeName && v) {
      domDiff(
        c,
        v.outerHTML ? v.outerHTML : `<${c.nodeName} ${c.id ? `id="${c.id}"` : ''} ${c.className ? `class="${c.className}"` : ''}>${v}</${c.nodeName}>`
      )
      //console.log('diffed DOM')
    }
  });

  return c
}

export default render;
