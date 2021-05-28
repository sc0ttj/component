const e=(e,t)=>{const n={cfg:{orig:e},replace(e,t=e){const n=document.createElement("template");n.innerHTML=t;const a=n.content.firstChild.nextElementSibling;a.nodeName===e.nodeName?this.loop(e,a):e.parentElement.replaceChild(a,e)},loop(t,n,a){(t||n)&&(this.checkNew(t,n,a),t&&n&&t.nodeName!==n.nodeName?this.checkNodeName(t,n):t&&n&&t.nodeName===n.nodeName&&(this.checkCtx(t,n),3!==t.nodeType&&8!==e.nodeType&&this.checkAttrs(t,n))),t&&n&&(t.childNodes&&n.childNodes?this.cfg.lengthDiff=[...e.childNodes,...n.childNodes]:this.cfg.lengthDiff=null,Array.apply(null,this.cfg.lengthDiff).forEach((e,a)=>{this.cfg.lengthDiff&&this.loop(t.childNodes[a],n.childNodes[a],t,n)}))},checkNodeName(e,t){const n=t.cloneNode(!0);e.parentElement.replaceChild(n,e)},checkAttrs(e,t){const n=e.attributes||[],a=Object.keys(n).map(e=>n[e]),o=t.attributes||[],i=Object.keys(o).map(e=>o[e]);a.forEach(n=>null!==t.getAttribute(n.name)?e.setAttribute(n.name,t.getAttribute(n.name)):e.removeAttribute(n.name)),i.forEach(n=>e.getAttribute(n.name)!==t.getAttribute(n.name)&&e.setAttribute(n.name,t.getAttribute(n.name)))},checkCtx(e,t){e.nodeValue!==t.nodeValue&&(e.textContent=t.textContent)},checkNew(e,t,n=this.cfg.orig){if(t&&void 0===e){const e=t.cloneNode(!0);3!==n.nodeType&&8!==n.nodeType&&n.appendChild(e)}else e&&void 0===t&&e.parentElement.removeChild(e)}};Object.create(n).replace(e,t)};function t(n,a){const o=function e(t,n){return e.setState(t,n),t?e:e.container},i=t,r=i.validator,s=i.emitter,c=i.tweenState,l=i.springTo,u=i.storage,d=i.useAudio,f=i.devtools,p=i.memo?i.memo:function(e){return e},h=Object,m=RegExp;let y,g,v,w,b;o.reactive=!0,o.immutable=!0,o.debug=!!f,o.scopedCss=!0,o.state=n,o.schema=a,o.i=(o.log=[{id:0,state:n,action:"init"}]).length,o.view=e=>e,o.middleware=[],o.uid=Math.random().toString(36).split(".")[1],(o.isNode="undefined"!=typeof process&&null!==process&&null!==process.versions&&null!==process.versions.node)||(g=window,v=document,w=requestAnimationFrame,(o.css=v.createElement("style")).id=o.uid,v.head.appendChild(o.css)),o.actions=e=>(o.actionsList=e,h.keys(e).forEach(t=>{if(void 0!==o[t])return!1;o[t]=n=>(o.action=t,e[t](n),o)}),o),o.freeze=p(e=>(h.isFrozen(e)||(h.keys(e).forEach(t=>o.freeze(e[t])),h.freeze(e)),e)),o.eq=p((e,t)=>{const n=h.keys,a=typeof e;return e&&t&&"object"===a&&a===typeof t?n(e).length===n(t).length&&n(e).every(n=>o.eq(e[n],t[n])):String(e)===String(t)}),o.setState=e=>{const t={...o.state,...e};if(u&&!o.done){const n=u.getItem(o,t);n&&(e={...e,...n})}if(o.done=!0,r&&o.schema){const e=p(r(t,o.schema)),n="State doesn't match schema:";if(e.length>0)throw console.error(n,"\n",e,"\n"),new Error(n+"\n"+JSON.stringify(e)+"\n")}if(o.prev=o.state,o.state={...o.state,...t},!o.eq(o.state,o.prev))return u&&o.done&&u.setItem(o,o.state),o.reactive&&o.render(o.container),b&&!o.isNode&&cancelAnimationFrame(b),o.debug&&!0!==o.tt&&(o.isNode&&(w=e=>setTimeout(()=>e(),1)),b=w(()=>{o.log.push({id:o.log.length,state:o.state,action:o.action||"setState"}),o.i=o.log.length-1})),o.immutable&&o.freeze(o.state),void 0!==s&&o.action&&s.emit(""+o.action,{...o.state}),o.middleware.forEach(e=>e({...o.state})),o.action=void 0,o},o.tweenState=(e,t)=>(void 0!==c?c(o,e,t):o(e),o),o.springTo=(e,t)=>(void 0!==l?l(o,e,t):o(e),o),o.useAudio=e=>(void 0!==d?d(e,o):o(e),o),o.on=(e,t)=>(void 0!==s&&s.on(e,t),o),o.once=(e,t)=>(void 0!==s&&s.on(e,n=>{t(n),s.off(e,t)}),o),o.off=(e,t)=>(void 0!==s&&s.off(e,t),o),o.go=function(e,t){let n;return n="f"===t?o.i+e:o.i-e,o.log[n]&&(o.i=n,o.tt=!0,o(o.log[n].state),o.tt=!1),o},o.rw=function(e){return e?o.go(e,"b"):(o.log[0]&&(o.tt=!0,o(o.log[0].state),o.tt=!1),o.i=0,o)},o.ff=function(e){return e?o.go(e,"f"):(o.log[o.log.length-1]&&(o.tt=!0,o(o.log[o.log.length-1].state),o.tt=!1),o.i=o.log.length-1,o)},o.setCss=function(){if(o&&!o.isNode&&o.css&&"function"==typeof o.style){let e=o.style(o.state);if(o.scopedCss){const t=o.container.id?"#":".";let n=o.container.id?o.container.id:o.container.className;n=n||o.uid;const a=new m(n+" ,\\s*\\.","gm"),i=new m(n+" ,\\s*#","gm"),r=new m(n+" ,\\s*([a-z\\.#])","gmi");e=p(((e,t,n)=>e.replace(/}/g,"}\n").replace(/\;\s*\n/g,";").replace(/{\s*\n/g,"{ ").replace(/^\s+|\s+$/gm,"\n").replace(/(^[\.#\w][\w\-]*|\s*,[\.#\w][\w\-]*)/gm,t+n+" $1").replace(a,", "+t+n+" ").replace(i,", "+t+n+" #").replace(r,", "+t+n+" $1").replace(/\n/g,"").replace(/\s\s+/g," "))(e,t,n))}const t=e.replace(/\n/g,"").replace(/\s\s+/g," ");o.css.innerHTML!==t&&(o.css.innerHTML=t)}};return o.toString=function(){let e=o.view(o.state),t="";if(!o.done&&u){const t=u.getItem(o,o.state);o(t),e="function"==typeof o.view?o.view(t):e}return"function"==typeof o.style&&(t=o.style(o.state).replace(/^ {4}/gm,"")),p(((e,t)=>{let n="";if(e.outerHTML)t&&(n=`<style>${t}\n</style>\n`),n+=(""+e.outerHTML).replace(/^ {4}/gm,"");else if("string"==typeof e)try{n=JSON.parse(e),n=JSON.stringify(n,null,2)}catch(a){t&&(n=`<style>${t}\n</style>\n`),n+=(""+e).replace(/^ {4}/gm,"")}else("object"==typeof e||Array.isArray(e))&&(n=JSON.stringify(e,null,2));return n})(e,t))},o.render=function(t){if(o.isNode)return o.toString();let n="function"==typeof o.view?o.view(o.state):null;if(!o.html&&u){const e=u.getItem(o,o.state);n="function"==typeof o.view?o.view(e):null,o(e)}return v&&!o.html&&(t=v.querySelector(t)),o.html=o.container=t,y&&cancelAnimationFrame(y),y=w(()=>{if(o.css&&o.style&&o.setCss(),o.container&&n)try{e(o.container.firstElementChild,n.outerHTML?n.outerHTML:n)}catch(e){n.outerHTML?(o.container.innerHTML="",o.container.append(n)):o.container.innerHTML=n}f&&o.container&&(o.container.firstChild.setAttribute("data-uid",o.uid),f.populateUI(o.container))}),o.container},o.isNode||(g.sjComponents=g.sjComponents||{},g.sjComponents[o.uid]=o),o}const n=(e,t)=>{const n={cfg:{orig:e},replace(e,t=e){const n=document.createElement("template");n.innerHTML=t;const a=n.content.firstElementChild;a.nodeName===e.nodeName?this.loop(e,a):e.parentElement.replaceChild(a,e)},loop(t,n,a){(t||n)&&(this.checkNew(t,n,a),t&&n&&t.nodeName!==n.nodeName?this.checkNodeName(t,n):t&&n&&t.nodeName===n.nodeName&&(this.checkCtx(t,n),3!==t.nodeType&&8!==e.nodeType&&this.checkAttrs(t,n))),t&&n&&(t.childNodes&&n.childNodes?this.cfg.lengthDiff=[...e.childNodes,...n.childNodes]:this.cfg.lengthDiff=null,Array.apply(null,this.cfg.lengthDiff).forEach((e,a)=>{this.cfg.lengthDiff&&this.loop(t.childNodes[a],n.childNodes[a],t,n)}))},checkNodeName(e,t){const n=t.cloneNode(!0);e.parentElement.replaceChild(n,e)},checkAttrs(e,t){const n=e.attributes||[],a=Object.keys(n).map(e=>n[e]),o=t.attributes||[],i=Object.keys(o).map(e=>o[e]);a.forEach(n=>null!==t.getAttribute(n.name)?e.setAttribute(n.name,t.getAttribute(n.name)):e.removeAttribute(n.name)),i.forEach(n=>e.getAttribute(n.name)!==t.getAttribute(n.name)&&e.setAttribute(n.name,t.getAttribute(n.name)))},checkCtx(e,t){e.nodeValue!==t.nodeValue&&(e.textContent=t.textContent)},checkNew(e,t,n=this.cfg.orig){if(t&&void 0===e){const e=t.cloneNode(!0);3!==n.nodeType&&8!==n.nodeType&&n.appendChild(e)}else e&&void 0===t&&e.parentElement.removeChild(e)}};Object.create(n).replace(e,t)};let a;const o=(e,t)=>{if(!window)return o;const o="function"==typeof e?e():e,i=document.querySelector(t);return a&&cancelAnimationFrame(a),a=requestAnimationFrame(()=>{i&&i.nodeName&&o&&n(i,o.outerHTML?o.outerHTML:`<${i.nodeName} ${i.id?`id="${i.id}"`:""} ${i.className?`class="${i.className}"`:""}>${o}</${i.nodeName}>`)}),i};for(var i=("undefined"!=typeof process&&"undefined"!=typeof require?require("perf_hooks").performance:window.performance).now,r="undefined"==typeof window?global:window,s=["moz","webkit"],c="AnimationFrame",l=r["request"+c],u=r["cancel"+c]||r["cancelRequest"+c],d=0;!l&&d<s.length;d++)l=r[s[d]+"Request"+c],u=r[s[d]+"Cancel"+c]||r[s[d]+"CancelRequest"+c];if(!l||!u){var f=0,p=0,h=[];l=function(e){if(0===h.length){var t=i(),n=Math.max(0,1e3/60-(t-f));f=n+t,setTimeout((function(){var e=h.slice(0);h.length=0;for(var t=0;t<e.length;t++)if(!e[t].cancelled)try{e[t].callback(f)}catch(e){setTimeout((function(){throw e}),0)}}),Math.round(n))}return h.push({handle:++p,callback:e,cancelled:!1}),p},u=function(e){for(var t=0;t<h.length;t++)h[t].handle===e&&(h[t].cancelled=!0)}}"undefined"!=typeof module&&(module.exports.raf=function(e){return l.call(r,e)},module.exports.cancel=function(){u.apply(r,arguments)},module.exports.polyfill=function(e){e||(e=r),e.requestAnimationFrame=l,e.cancelAnimationFrame=u});const m={linear:e=>e,inQuad:e=>e*e,outQuad:e=>e*(2-e),inOutQuad:e=>e<.5?2*e*e:(4-2*e)*e-1,inCubic:e=>e*e*e,outCubic:e=>--e*e*e+1,inOutCubic:e=>e<.5?4*e*e*e:(e-1)*(2*e-2)*(2*e-2)+1,inQuart:e=>e*e*e*e,outQuart:e=>1- --e*e*e*e,inOutQuart:e=>e<.5?8*e*e*e*e:1-8*--e*e*e*e,inQuint:e=>e*e*e*e*e,outQuint:e=>1+--e*e*e*e*e,inOutQuint:e=>e<.5?16*e*e*e*e*e:1+16*--e*e*e*e*e,inElastic:e=>(.04-.04/e)*Math.sin(25*e)+1,outElastic:e=>.04*e/--e*Math.sin(25*e),inOutElastic:e=>(e-=.5)<0?(.02+.01/e)*Math.sin(50*e):(.02-.01/e)*Math.sin(50*e)+1,inSin:e=>1+Math.sin(Math.PI/2*e-Math.PI/2),outSin:e=>Math.sin(Math.PI/2*e),inOutSin:e=>(1+Math.sin(Math.PI*e-Math.PI/2))/2,inExpo:e=>0===e?0:Math.pow(2,10*(e-1)),outExpo:function(e){return 1===e?1:1-Math.pow(2,-10*e)},inOutExpo:function(e){if(0===e||1===e)return e;var t=2*e,n=t-1;return t<1?.5*Math.pow(2,10*n):.5*(2-Math.pow(2,-10*n))},inBack:function(e,t){var n=void 0!==t?t:1.70158;return e*e*((n+1)*e-n)},outBack:function(e,t){var n=void 0!==t?t:1.70158,a=e/1-1;return a*a*((n+1)*a+n)+1},inOutBack:function(e,t=1.70158){var n=2*e,a=n-2,o=1.525*t;return n<1?.5*n*n*((o+1)*n-o):.5*(a*a*((o+1)*a+o)+2)}};var y="undefined"!=typeof process&&"undefined"!=typeof require?require("perf_hooks").performance:window.performance,g="undefined"!=typeof window&&void 0!==window.requestAnimationFrame?window.requestAnimationFrame:function(e){return l.call(r,e)},v=function(){},w=function(){return y&&y.now?y.now():Date.now()},b=function(){function e(e){this._c=e,this._c.ease=m[e.ease]||m[ease],this._c.onUpdate=e.onUpdate||v,this._c.onComplete=e.onComplete||v,this._c.delay=e.delay||0,this._c.duration=e.duration||200,e.paused||this.start()}var t=e.prototype;return t.start=function(){this._c.startTime=w(),function e(t){var n=t.delay,a=t.from,o=t.to,i=t.duration,r=t.startTime,s=t.ease,c=t.onUpdate,l=t.onComplete,u=w()-r;if(n>=u)t.frame=g((function(){return e(t)}))+1;else{var d=Math.min(1,(u-n)/i);t.progress=d;var f,p=a.length?a.map((function(e,t){var n=e+(o[t]-e)*s(d);return Number.isNaN(n)&&(n=e+(o[t]-e)*d),n})):(f=a+(o-a)*s(d),Number.isNaN(f)&&(f=a+(o-a)*d),f);c({...t,values:p}),1===d?l({...t,values:p}):t.frame=g((function(){return e(t)}))+1}}(this._c)},t.cancel=function(){cancelAnimationFrame(this._c.frame)},e}();const C=function(e,t){Object.keys(e).forEach((n,a)=>{if(void 0!==e[n]){if("object"!=typeof e[n])return void t.push(e[n]);C(e[n],t)}})},x=(e,t,n)=>{var a=n.onStart?n.onStart:v,o=n.onUpdate?n.onUpdate:v,i=n.onComplete?n.onComplete:v,r=!n.shouldSetState||n.shouldSetState,s=n.onSetState?n.onSetState:v;"boolean"==typeof r&&(r=()=>r),n.frame=1,n.frameTotal=Math.ceil(.06*(n.delay+n.duration))+2;var c=function(e,t){const n={};return Object.entries(e).forEach(e=>{const a=e[0],o=e[1];t[a]&&(n[a]=o)}),n}(e.state,t),l=[],u=[];return C(c,l),C(t,u),new b({from:l||0,to:u||1,paused:n.paused||!1,delay:n.delay||0,duration:n.duration||200,ease:n.ease||"linear",frame:1,frameTotal:n.frameTotal||1,onUpdate:n=>{var i,c,l=(i=t,c=[...n.values],Object.entries(i).reduce((function e(t,[n,a]){return t[n]=a,"number"==typeof a?t[n]=c.shift():"object"==typeof a&&(t[n]=Object.entries(a).reduce(e,{})),t}),{}));return 1===n.frame&&a(n),r(n)&&(e.setState(l),s(n)),o({...n,tweenedState:l})},onComplete:n=>(e.setState(t),i(n))})},S={on:function(e,t){this._evs=this._evs||{},this._evs[e]=this._evs[e]||[],this._evs[e].push(t)},off:function(e,t){if(this._evs=this._evs||{},e in this._evs==!1)return!1;this._evs[e].splice(this._evs[e].indexOf(t),1)},emit:function(e){if(this._evs=this._evs||{},e in this._evs==!1)return!1;for(var t=0;t<this._evs[e].length;t++)this._evs[e][t].apply(this,Array.prototype.slice.call(arguments,1))}},k=(e,...t)=>(k.funcs=k.funcs||[],e.map((e,n)=>{k.i=k.i||n;var a=t[n]||"";"number"==typeof t[n]&&(a=t[n]);var o="attr";if(e.match(/style=("|')$/i)?o="style":e.match(/data-[a-z0-9\-_]+=("|')$/i)?o="dataAttr":"function"==typeof a&&a.uid&&a.state&&a.setState&&a.render?o="nestedComponent":"function"==typeof a&&"attr"===o&&e.match(/ on[a-z0-9]+=("|')$/i)&&(o="funcAttr"),a.nodeName&&"attr"===o)a=a.outerHTML;else if("nestedComponent"===o&&"function"==typeof a)e+=a.view(a.state),a="";else if("funcAttr"!==o||"function"!=typeof a||a.uid){if(Array.isArray(a))a[0].nodeName&&(a=a.map(e=>""+e.outerHTML)),a=a.join("");else if("object"==typeof a){var i="";if("dataAttr"===o)i+=JSON.stringify(a).trim();else for(var r in a)r&&a&&a.hasOwnProperty(r)&&"object"!=typeof a[r]&&("style"===o&&(i+=`${r}:${a[r]};`),"attr"===o&&(i+=` ${r}="${a[r]}"`));a=i}}else Array.isArray(k.funcs)&&(k.funcs[k.i]=a),a="",e+=k.i;return 0===t[n]&&(a="0"),k.i+=1,e?e+(a||""):""}).join("")),N=(e,...t)=>{var n=k(e,...t).trim();if(!document)return n;var a=document.createElement("template");a.innerHTML=n;for(var o=a.content.firstChild.children.length>0?a.content.firstChild.children:a.content.firstChild,i=0;i<o.length;i++)for(var r=o[i].attributes,s=0;s<r.length;s++){var c=r[s];c.name.match(/^on/)&&(o[i].removeAttribute(c.name),o[i].addEventListener(c.name.replace(/^on/,""),k.funcs[c.value]))}return a.content.firstChild},E={getItem:(e,t)=>{if(!e.store)return t;const n=JSON.parse(localStorage.getItem(e.store));return n?{...t,...n}:t},setItem:(e,t)=>{if(!e.store)return t;!e.isNode&&Component.syncTabs&&(window.syncTab=window.syncTab||[],window.syncTab[e.uid]||Component.syncTabs(e)),localStorage.setItem(e.store,JSON.stringify(t))}},A=function(e){!e.isNode&&window&&(window.addEventListener("storage",(function(t){if(t.key===e.store){let n=JSON.parse(t.newValue);e.setState({...e.state,...n})}})),window.syncTab[e.uid]=!0)},T=function(e,t){if(!document||!window||"object"!=typeof e)return;const n=Array.isArray,a=function(){},o=window.AudioContext||window.webkitAudioContext;window.audioCtx=window.audioCtx?window.audioCtx:new o,audioCtx.createGain||(audioCtx.createGain=audioCtx.createGainNode),audioCtx.createDelay||(audioCtx.createDelay=audioCtx.createDelayNode);const i={};let r=null,s=null,c=!1;const l=["gain","panning","reverb","equalizer","lowpass","lowshelf","peaking","notch","highpass","highshelf","bandpass","allpass","compression","analyser"],u={};window.totalFiles=window.totalFiles?window.totalFiles:0,window.totalFiles+=Object.keys(e).length,window.loadedFiles=window.loadedFiles?window.loadedFiles:0;const d=(e,t)=>{u[r]=p(e),i[r]=h(t),i.settings=(e,t)=>(Object.keys(i).forEach(t=>{i[t]&&"settings"!==t&&i[t].settings&&i[t].settings(e)}),"function"==typeof t&&t(i[audioObj].state),i),f(),!0===i[r].autoplay&&i[r].play()},f=()=>{window.loadedFiles+=1,window.totalFiles===window.loadedFiles&&document.dispatchEvent(new CustomEvent("audioLoaded",{detail:i}))},p=e=>{let t=audioCtx.createBuffer(e?e.numberOfChannels:2,e?e.length:0,e?e.sampleRate:audioCtx.sampleRate);for(var n=0,a=e.numberOfChannels;n<a;++n){let a=t.getChannelData(n),o=e.getChannelData(n);a.set(o,0)}return t},h=e=>{const t={name:r,src:s,play:C,playFrom:N,pause:k,fadeIn:O,fadeOut:F,rapidFire:S,stop:E,mute:A,unmute:T,connectTo:M,onPlay:e[1].onPlay||a,onPause:e[1].onPause||a,onResume:e[1].onResume||a,onStop:e[1].onStop||a,onChange:e[1].onChange||a,input:audioCtx.createBufferSource(),output:audioCtx.destination,audioNodes:[],state:{isPlaying:!1,volume:e[1].volume||1,muted:e[1].muted||!1,autoplay:e[1].autoplay||!1,loop:e[1].loop||!1,playbackRate:e[1].playbackRate||1,startTime:e[1].startTime||0,startOffset:e[1].startOffset||0},settings:function(e,n){return Object.keys(e).forEach(n=>{-1!==l.indexOf(n)&&g(t.state[n])!==g(e[n])&&(t.state={...t.state,...e},t.audioNodes=v(t),x(t),t.state.isPlaying&&t.playFrom(audioCtx.currentTime))}),t.state={...t.state,...e},m(t),y(t),"function"==typeof n&&n(t.state),t.onChange(t.state),t}};return t.audioNodes=v(t),t},m=e=>{const t=e.state;if("object"==typeof t.randomization){const n=t.randomization;n.volume&&(t.volume=t.volume+Math.random()*n.volume),n.playbackRate&&(t.playbackRate=t.playbackRate+Math.random()*n.playbackRate),n.startOffset&&(t.startOffset=t.startOffset+1*(.01+Math.random()*n.startOffset)),n.delay&&q(e,"delay")&&(t.delay=t.delay*(.01+Math.random()*n.delay))}},y=e=>{const t=e.state;e.input.loop=t.loop,e.input.playbackRate.value=t.playbackRate,Object.keys(t).forEach(n=>{let a=q(e,"volume"===n?"gain":n);a&&!g(t[n])&&b(e,a,t[n])})},g=e=>null==e||!1===e,v=e=>{const t=[e.input],a={},o={gain:e.state.volume,...c,...e.state};return Object.keys(o).forEach(t=>{const n=o[t];if(g(n))return;a[t]=w(e,t,n);const i="gain"===t?"volume":t;e.state[i]=n,a[t]&&b(e,a[t],n)}),l.forEach(o=>{a[o]&&"equalizer"!==o?t.push(a[o]):"equalizer"===o&&n(e.eq)&&e.eq.forEach(e=>t.push(e))}),t.push(e.output),t},w=(e,t,n)=>{let a=void 0;switch(t){case"gain":case"volume":a=audioCtx.createGain();break;case"panning":a=audioCtx.createStereoPanner?audioCtx.createStereoPanner():audioCtx.createPanner();break;case"delay":a=audioCtx.createDelay();break;case"lowpass":case"highpass":case"bandpass":case"allpass":case"lowshelf":case"highshelf":case"peaking":case"notch":a=audioCtx.createBiquadFilter();break;case"equalizer":a={type:"equalizer"},e.eq=[],n.forEach((t,a)=>{const o=audioCtx.createBiquadFilter();0===a?o.type="lowpass":a===n.length-1?o.type="highpass":o.type="peaking",e.eq.push(o)});break;case"reverb":a=audioCtx.createConvolver();break;case"analyser":a=audioCtx.createAnalyser();break;case"compression":a=audioCtx.createDynamicsCompressor()}return a&&(a.type=t),a},b=(e,t,a)=>{const o=t.type,i=audioCtx.currentTime,r=e=>"number"==typeof a||"number"==typeof a[e],s=(e,n)=>t[e].setValueAtTime(n,i);switch(o){case"volume":case"gain":let o=a<=0?1e-5:a;!0===e.state.mute&&(o=1e-5),t.gain.setValueAtTime(o,i);break;case"panning":if(audioCtx.createStereoPanner)s("pan","number"==typeof a?a:0);else{const e=0,n=1-Math.abs(a);t.setPosition(a,e,n),t.panValue=a}break;case"delay":s("delayTime","number"==typeof a?a:0);break;case"lowpass":case"highpass":case"bandpass":case"allpass":case"lowshelf":case"highshelf":case"peaking":case"notch":r("freq")&&t.frequency.setValueAtTime(a.freq,i),r("gain")&&t.gain.setValueAtTime(a.gain,i),r("q")&&t.Q.setValueAtTime(a.q,i);break;case"reverb":if(a){const n={duration:1,decay:1,reverse:!1,...e.state.reverb,...a};t.buffer=function(e,t,n){const a=audioCtx.sampleRate*e,o=audioCtx.createBuffer(2,a,audioCtx.sampleRate),i=o.getChannelData(0),r=o.getChannelData(1);let s;if(n)for(let e=0;e<a;e++){s=a-e;let n=Math.pow(1-s/a,t);i[s]=.5*Math.random()*n,r[s]=.5*Math.random()*n}else for(let e=0;e<a;e++){s=e;let n=Math.pow(1-s/a,t);i[e]=.5*Math.random()*n,r[e]=.5*Math.random()*n}return o}(n.duration,n.decay,n.reverse),e.state.reverb=n}else t.buffer=null;break;case"equalizer":n(e.eq)&&a.forEach((t,n)=>{const a=e.eq[n];"number"==typeof t.freq&&(a.frequency.value=t.freq),"number"==typeof t.gain&&(a.gain.value=t.gain),"number"==typeof t.q&&(a.Q.value=t.q)});break;case"analyser":r("fftSize")&&(t.fftSize=a.fftSize),r("minDecibels")&&(t.minDecibels=a.minDecibels),r("maxDecibels")&&(t.maxDecibels=a.maxDecibels),r("smoothingTimeConstant")&&(t.smoothingTimeConstant=a.smoothingTimeConstant),e.state.visualiser=t;break;case"compression":r("threshold")&&s("threshold",a.threshold),r("knee")&&s("knee",a.knee),r("ratio")&&s("ratio",a.ratio),r("attack")&&s("attack",a.attack),r("release")&&s("release",a.release)}},C=()=>{const e=i[r],t=e.state,a=audioCtx.createBufferSource();a.buffer=p(u[r]),m(e),a.loop=t.loop,a.playbackRate.value=t.playbackRate,e.input=a,e.audioNodes=v(e),x(e),y(e),a.start||(a.start=a.noteOn),a.start(t.startTime,t.startOffset%a.buffer.duration),t.isPlaying=!0,n(e.attachedSounds)&&e.attachedSounds.forEach(e=>{e.state.isPlaying||e.playFrom(audioCtx.currentTime)}),"number"==typeof t.fadeIn&&t.fadeIn>0&&O(t.fadeIn),0===t.startOffset&&e.onPlay(t),t.startOffset>0&&e.onResume(t)},x=e=>{e.audioNodes.forEach((t,n)=>{const a=t,o=e.audioNodes[n+1],i=n>0?e.audioNodes[n-1]:null;a&&o&&a.connect&&("equalizer"===o.type?(a.connect(e.eq[0]),e.eq.forEach((t,n)=>{e.eq[n]&&e.eq[n+1]&&e.eq[n].connect(e.eq[n+1])})):i&&"equalizer"===i.type?(e.eq[e.eq.length-1].connect(a),a.connect(o)):a.connect(o))})},S=(e,t)=>{const n=e||3,a=t||200;for(let e=0;e<n;e++){const e=i[r].state.loop;i[r].state.loop=!1,setTimeout(C,a),i[r].state.loop=e}},k=()=>{i[r].state.isPlaying&&(i[r].state.startOffset=audioCtx.currentTime-i[r].state.startTime,i[r].input.stop(0),i[r].state.isPlaying=!1,i[r].onPause(i[r].state),n(i[r].attachedSounds)&&i[r].attachedSounds.forEach(e=>{e.state.isPlaying&&e.pause()}))},N=e=>{try{i[r].input.stop(0)}catch(e){}i[r].state.startOffset=e,i[r].play()},E=()=>{i[r].state.isPlaying&&(i[r].input.stop(0),i[r].state.isPlaying=!1,i[r].state.startOffset=0,i[r].onStop(i[r].state),n(i[r].attachedSounds)&&i[r].attachedSounds.forEach(e=>{e.state.isPlaying&&e.stop()}))},A=()=>{i[r].state.prevVol=i[r].state.volume,i[r].settings({volume:0,muted:!0}),n(i[r].attachedSounds)&&i[r].attachedSounds.forEach(e=>{e.state.isPlaying&&e.mute()})},T=()=>{i[r].settings({volume:i[r].state.prevVol,prevVol:void 0,muted:!1}),n(i[r].attachedSounds)&&i[r].attachedSounds.forEach(e=>{e.state.isPlaying&&e.unmute()})},M=e=>{e.attachedSounds=e.attachedSounds||[],e.attachedSounds.push(i[r]),i[r].onChange(i[r].state)},q=(e,t)=>{if(e.audioNodes)return e.audioNodes.filter(e=>e.type===t)[0]},O=function(e,t){i[r].state.isPlaying||i[r].play(),I(t||1,e)},F=function(e){I(1e-5,e)},I=function(e,t){const n=q(i[r],"gain"),a=audioCtx.currentTime,o=i[r].state;n.gain.value=o.volume,o.isPlaying&&(n.gain.setValueAtTime(o.volume,a),n.gain.exponentialRampToValueAtTime(e,a+t),o.volume=e)};return Object.entries(e).forEach(e=>{const t="object"==typeof e[1]&&"object"==typeof e[1].filters;r=e[1].name||e[0],s=e[1].src||e[1],c=t?e[1].filters:void 0,i[r]=null,u[r]=null,((e,t)=>{if(u[r])return void d(u[r]);const n=new XMLHttpRequest;n.open("GET",e),n.responseType="arraybuffer",n.onload=function(){let e=n.response;audioCtx.decodeAudioData(e,(function(e){d(e,t)}))},n.onprogress=function(t){let n=0;return t.lengthComputable&&(n=t.loaded/t.total*100),document.dispatchEvent(new CustomEvent("audioProgress",{detail:{percent:n,url:e}})),n},n.send()})(s,e)}),t&&(t.audio=i),i};var M="undefined"!=typeof globalThis?globalThis:"undefined"!=typeof window?window:"undefined"!=typeof global?global:"undefined"!=typeof self?self:{};var q=function(e,t,n){return e(n={path:t,exports:{},require:function(e,t){return function(){throw new Error("Dynamic requires are not currently supported by @rollup/plugin-commonjs")}(null==t&&n.path)}},n.exports),n.exports}((function(e){var t,n;t=M,n=function(){var e=new WeakMap,t=[];return{useHooks:function(...e){return(e=e.map((function(e){return a.reset=function(){t.push(a);var e=n();try{for(let t of e.cleanups)"function"==typeof t&&t()}finally{t.pop(),e.stateSlots.length=0,e.effects.length=0,e.cleanups.length=0,e.memoizations.length=0,e.nextStateSlotIdx=0,e.nextEffectIdx=0,e.nextMemoizationIdx=0}},a;function a(...o){t.push(a);var i=n();i.nextStateSlotIdx=0,i.nextEffectIdx=0,i.nextMemoizationIdx=0;try{return e.apply(this,o)}finally{try{!function(e){for(let[t,[n,a]]of e.effects.entries())try{"function"==typeof n&&n()}finally{e.effects[t][0]=void 0}}(i)}finally{t.pop()}}}}))).length<2?e[0]:e},useState:a,useReducer:o,useEffect:function(e,...t){t.length>0?1==t.length&&Array.isArray(t[0])&&(t=t[0]):t=void 0;var a=n();if(!a)throw new Error("useEffect() only valid inside an Articulated Function or a Custom Hook.");{a.nextEffectIdx in a.effects||(a.effects[a.nextEffectIdx]=[]);let n=a.nextEffectIdx,o=a.effects[n];i(o[1],t)&&(o[0]=function(){if("function"==typeof a.cleanups[n])try{a.cleanups[n]()}finally{a.cleanups[n]=void 0}var t=e();"function"==typeof t&&(a.cleanups[n]=t)},o[1]=t),a.nextEffectIdx++}},useMemo:r,useCallback:function(e,...t){if(n())return r((function(){return e}),...t);throw new Error("useCallback() only valid inside an Articulated Function or a Custom Hook.")},useRef:function(e){if(n()){var[t]=a({current:e});return t}throw new Error("useRef() only valid inside an Articulated Function or a Custom Hook.")},useDeferred:function(){if(n()){const[e]=a(function(){let e,t;return{pr:new Promise((n,a)=>{e=n,t=a}),resolve:e,reject:t}}());return e}throw new Error("useDeferred() only valid inside an Articulated Function or a Custom Hook.")},useThrottle:function(e,t,...o){if(!e)throw new TypeError("useThrottle() requires a function argument");if(!t)throw new TypeError("useThrottle() requires a timer argument");if(n()){const[n]=a({fn:e,timer:t,lastExecute:0});return o.length>0&&1===o.length&&Array.isArray(o[0])&&(o=o[0]),n.throttledFn&&!i(n.guards,o)||(n.guards=o,n.timer=t,n.fn=e,n.throttledFn=function(...e){const{fn:t,timer:a,lastExecute:o}=n,i=Date.now();if(o+a<i)try{t.apply(this,e)}finally{n.lastExecute=i}}),n.throttledFn}throw new Error("useThrottle() only valid inside an Articulated Function or a Custom Hook.")}};function n(){if(t.length>0){let n,a=t[t.length-1];return e.has(a)||(n={nextStateSlotIdx:0,nextEffectIdx:0,nextMemoizationIdx:0,stateSlots:[],effects:[],cleanups:[],memoizations:[]},e.set(a,n)),e.get(a)}}function a(e){if(n())return o((function(e,t){return"function"==typeof t?t(e):t}),e);throw new Error("useState() only valid inside an Articulated Function or a Custom Hook.")}function o(e,t,...a){var o=n();if(o){if(!(o.nextStateSlotIdx in o.stateSlots)){let n=["function"==typeof t?t():t,function(t){n[0]=e(n[0],t)}];o.stateSlots[o.nextStateSlotIdx]=n,a.length>0&&o.stateSlots[o.nextStateSlotIdx][1](a[0])}return[...o.stateSlots[o.nextStateSlotIdx++]]}throw new Error("useReducer() only valid inside an Articulated Function or a Custom Hook.")}function i(e,t){if(void 0===e||void 0===t)return!0;if(e.length!==t.length)return!0;for(let[n,a]of e.entries())if(!Object.is(a,t[n]))return!0;return!1}function r(e,...t){t.length>0?1==t.length&&Array.isArray(t[0])&&(t=t[0]):t=[e];var a=n();if(a){a.nextMemoizationIdx in a.memoizations||(a.memoizations[a.nextMemoizationIdx]=[]);let n=a.memoizations[a.nextMemoizationIdx];if(i(n[1],t))try{n[0]=e()}finally{n[1]=t}return a.nextMemoizationIdx++,n[0]}throw new Error("useMemo() only valid inside an Articulated Function or a Custom Hook.")}},e.exports?e.exports=n():Object.assign(t,n())})).hooks;export{t as Component,S as emitter,q as hooks,N as htmel,k as html,o as render,E as storage,A as syncTabs,x as tweenState,T as useAudio};
//# sourceMappingURL=index.esm.js.map
