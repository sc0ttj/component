/*
 * Based on Canvas Context2D Wrapper <http://github.com/millermedeiros/CanvasContext2DWrapper>
 *
 * With additions shamelessly stolen from:
 *
 * - https://gist.github.com/sc0ttj/0a0b7dcfffa3894eb3da8a4c731fb251
 * - https://github.com/reu/canvas-extensions
 * - https://github.com/sapiraz/ExtendedCanvas
 * - https://github.com/Martin-Pitt/canvas-plus
 * - https://github.com/pkorac/cardinal-spline-js
 * - https://github.com/ericdrowell/concrete/blob/master/src/concrete.js
 * - https://xosh.org/canvas-recorder/
 * - https://github.com/SMUsamaShah/CanvasRecorder
 * - https://github.com/straker/kontra
 * - https://github.com/rezoner/CanvasQuery/blob/master/canvasquery.js
 * - https://hmp.is.it/creating-chroma-key-effect-html5-canvas/
 * - https://github.com/kikemadrigalr/chromaKey/blob/master/main.js
 * -
 *
 *
 */

const ctxMethods = 'arc arcTo beginPath bezierCurveTo clearRect clip closePath createImageData createLinearGradient createRadialGradient createPattern drawFocusRing drawImage fill fillRect fillText getImageData isPointInPath lineTo measureText moveTo putImageData quadraticCurveTo rect restore rotate save scale setTransform stroke strokeRect strokeText transform translate'.split(' ');
const ctxProps = 'canvas fillStyle font globalAlpha globalCompositeOperation lineCap lineJoin lineWidth miterLimit shadowOffsetX shadowOffsetY shadowBlur shadowColor strokeStyle textAlign textBaseline'.split(' ');

/**
* Wrap function to enable method chaining.
* @param {Function} fn	Function to be modified.
* @param {Object} scope	Scope where function will be called.
* @param {Object} chainReturn	Object returned to enable chaining.
* @return {Function} Chainable function.
* @private
*/
function chainMethod(fn, scope, chainReturn) {
  return function() {
    	return fn.apply(scope, arguments) || chainReturn;
  };
}

/**
* Convert properties into getter/setter methods enabling chaining.
* @param {String} propName	Property name.
* @param {Object} scope	Object that contain original property.
* @param {Object} chainReturn	Object returned to enable chaining.
* @return {Function} Chainable getter/setter for properties.
* @private
*/
function chainProperty(propName, scope, chainReturn) {
  return function(value) {
  	if(typeof value === 'undefined') {
  		return scope[propName];
  	}else{
  		scope[propName] = value;
  		return chainReturn;
  	}
  };
}

const PIXEL_RATIO = (function () {
  return (window && window.devicePixelRatio) || 1;
})();

// calculate maths constants only once
const PI = Math.PI;
const PIx2 = PI * 2;
const PIo2 = PI / 2
const RAD2DEG = 180 / PI;
const DEG2RAD = PI / 180;

// display settings
//const maxWidth = 1920, maxHeight = 1200; // up to 1080p and 16:10
//const fixedWidth = 1280, fixedHeight = 720;  // 720p
//const fixedWidth = 1920, fixedHeight = 1080; // 1080p
//const fixedWidth = 128,  fixedHeight = 128;  // PICO-8
//const fixedWidth = 240,  fixedHeight = 136;  // TIC-80
/* TODO

- brushes:
  - presets for draw tool, fill and stroke styles
  - see https://github.com/jimschubert/brushes.js


- arrows:
  - line arrows
  - arc arrows


- responsive canvas:
  - auto resize on screen/orientation change
  - option to maintain aspect ratio
  - see https://github.com/Nelkor/ctx-2d/blob/master/index.js#L18

      const aspectRatio = canvas.maxWidth / canvas.maxHeight;
      const width  = canvas.clientWidth;
      const height = canvas.clientHeight;
      if (aspectRatio) {
        if (width / height < aspectRatio) {
          canvas.width = Math.min(width, canvas.maxWidth);
          canvas.height = canvas.width / aspectRatio;
        } else {
          canvas.height = Math.min(height, canvas.maxHeight);
          canvas.width = canvas.height * aspectRatio;
        }
      }

- various goodies: colour, maths, seeded randoms, vectors, engine objects/entities, etc
  - https://github.com/KilledByAPixel/LittleJS/blob/main/engine/engine.all.js

- undo/redo:
  - see https://github.com/jussi-kalliokoski/canvas-history.js


- play/replay:
  - https://github.com/despeset/ctxShark/blob/master/ctxShark.js


- maths:
    - plotting
      - http://javascripter.net/faq/plotafunctiongraph.htm
      - see https://github.com/d12/QuickPlotJS

    - https://github.com/mattdesl/canvas-sketch-util/blob/master/docs/math.md

    - interpolate colors and numbers: https://github.com/worksbyscott/Interpolator/blob/main/interpolator.js

    - lerp (linear interpolation) for single value

          function lerp(start, end, value) {
            return start + value * ( end - start );
          }

          console.log( lerp(10, 20, 0.5) );  // => 15
          console.log( lerp(10, 20, 2) );    // => 30

    - inverse lerp:

        function inverseLerp(start, end, value) {
          return (value - start) / (end - start);
        }

        console.log( inverseLerp(10, 20, 15) );  // => 0.5
        console.log( inverseLerp(10, 20, 30) );  // => 2


    - lerp for 2d coordinates

          function lerp2d([x0, y0] = [], [x1, y1] = [], t) {
            return [
              lerp(x0, x1, t),
              lerp(y0, y1, t),
            ];
          }
          // usage
          lerp2d([px,py], [x,y])


=== STUFF BELOW NEEDS ANIMATION LOOP ===


- particle emitter
  - https://gist.github.com/nickgs/104391ea388dde93610d27093533da64
  - https://gist.github.com/incompl/4125971
  - https://gist.github.com/fwon/29a7d67111c8105f9de82d45856910f8
  - https://gist.github.com/rlemon/5658113
  - https://gist.github.com/idettman/9ddd55250e8643b83aa22ee056c34cb6
  - https://github.com/KilledByAPixel/LittleJS/blob/main/engine/engineParticle.js
  - also see http://buildnewgames.com/particle-systems/  (repo: https://github.com/city41/particle.js)



- visual FX:
  - smoke: https://gist.github.com/Vayn/8909634
  - fire:
  - explosions:
  - fireworks: https://gist.github.com/shortercode/6647f2c11e0788ef940c82a82932d780
  - sparks:
  - water:


=== STUFF BELOW NEEDS INTERACTIVITY/EVENTS SYSTEM FIRST ===

- collision detection:
  - broad phase (narrowing it down):
    - quad trees
      - https://github.com/timohausmann/quadtree-js
    - spatial has maps
      - https://gist.github.com/troufster/710529
      - https://gist.github.com/sc0ttj/b46aefceacb47990e59b36cceb6a81ad
      - https://gist.github.com/sc0ttj/ec6d3faf1a77c2c8b366629a0f278f5d
  - narrow phase (actual detecting of collisions)
    - ?


- https://github.com/vasturiano/canvas-color-tracker
  - enables hover detection for canvas objects
  - uses same method as threeJS (colours as hit areas):
    - draws each object to shadow screen canvas, using a unique color
    - assigns that color to the drawn object
    - on mouse move,
      - gets the colour under mouse x,y (from shadow canvas)
      - looks up the object associated with that colour

      const tracker = new ColorTracker();
      const obj = { x,y,w,h,..etc };
      const objColor = tracker.register(myObject);
      // ...later
      const hoverColor = ctx.getImageData(x, y, 1, 1).data;
      const hoverObject = tracker.lookup(hoverColor);


- easy events

      const rr = ctx.create.roundedRect(x,y,w,h,r);  // caches and returns {x,y,w,h,r}
      rr.draw();
      rr.on('mouseover', function(e) {
        this // equals rr
        e    // equals event
      });


- map/background generator and tiler
    - https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps
    - https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Static_maps
    - https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Scrolling_maps
    - https://mozdevs.github.io/gamedev-js-tiles/  and  https://github.com/mozdevs/gamedev-js-tiles
    - https://github.com/basementuniverse/tily
    - https://github.com/yagl/tiledmap
    - https://www.redblobgames.com/grids/parts/ (lots of theory and algorithm)


- sprite (series of images, easy to setup and control/animate)
  - see http://buildnewgames.com/sprite-animation/


- shadow casting? :
    - https://ncase.me/sight-and-light/  and https://github.com/ncase/sight-and-light
    - or  https://github.com/kreldjarn/shadowjs/blob/master/shadow.js:

     var origin = {x: 100, y: 200};
     var rect = {
         lx: 300,
         ty: 350,
         w: 50,
         h: 200
     };

     // Cast a shadow of a rectangle from origin
     Shadow.castFromRectangle(
         ctx,
         origin,
         rect.lx,
         rect.ty,
         rect.w,
         rect.h
     );


- field of view
    - see https://legends2k.github.io/2d-fov/  and  https://github.com/legends2k/2d-fov


- mouse interactivity - add properties that can be used by a useControls() addon

     function getMousePos(event) {
        var rect = ctx.canvas.getBoundingClientRect();
        ctx.mousePos = {x:(event.clientX-rect.left)/ctx.canvas.scale, y:(event.clientY-rect.top)/ctx.canvas.scale};
      }

- node graph
  - see https://github.com/paulfears/Graphs

*/


// helper funcs

function getVideoMimeType() {
  let supportedType = null;
  let types = [
    "video/webm",
    'video/webm\;codecs=vp9',
    'video/vp8',
    "video/webm\;codecs=vp8",
    "video/webm\;codecs=daala",
    "video/webm\;codecs=h264",
    "video/mp4",
    "video/mpeg"
  ];
  for (let i in types) {
    if (MediaRecorder.isTypeSupported(types[i])) {
      supportedType = types[i];
      break;
    }
  }
  return supportedType;
}

// create a link to a blob, simulates clicking it, which triggers
// a download of the blob in a browser
function downloadBlobAs(blob, name) {
  let a  = document.createElement('a'),
      url = URL.createObjectURL(blob),
      fileName = name || `canvas-${new Date().valueOf()}`,
      e;

  // set attributes
  a.target = '_blank';
  a.href = url;
  a.download = fileName;
  a.click();
  window.URL.revokeObjectURL(url);
}

// define extra methods to add/bind to our extended 2d canvas context
const extraMethods = {

  // general helper funcs
  clear: function(resetTransform) {
    if (resetTransform === true) this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width * PIXEL_RATIO, this.canvas.height * PIXEL_RATIO);
  },
  fullscreen: function() {
    if (!document.fullscreenElement) this.canvas.requestFullscreen();
    else document.exitFullscreen();
  },
  isClean: function() {
    try {
        const pixel = this.getImageData(0, 0, 1, 1);
        return true;
    } catch(err) {
        return false;
    }
  },

  size: function(w, h, a) {
    if (this.w === w && this.h === h) return; // if no new size, just return
    // if width or height not given, get them from aspect ratio
    this.w = w ? w : h * a;
    this.h = h ? h : w * a;
    // respect device pixel ratio
    this.canvas.width = this.w * PIXEL_RATIO;
    this.canvas.height = this.h * PIXEL_RATIO;
    // update the CSS too
    this.canvas.style.width = this.w + 'px';
    this.canvas.style.height = this.h + 'px';
    this.canvas.style.objectFit = a ? 'contain' : null;
    // adjust scale for pixel ratio
    if (this.contextType === '2d' && PIXEL_RATIO !== 1) {
      this.scale(PIXEL_RATIO, PIXEL_RATIO);
    }
  },

  // a simple "camera"
  camera: function(x = 0, y = 0, scale = 1, degrees = 0) {
    this.resetTransform();
    this.translate(x, y);
    this.rotate(degrees * DEG2RAD);
    this.scale(scale, scale);
    this.translate(-x, -y);
  },

  // replace green (by default) pixels with transparent ones
  chromaKey: function(tolerance = 150, color = [0,255,0]) {
    const t = tolerance > 250 ? 250 : tolerance; // more than 255 produces weird results
    const imageData = this.getImageData(0, 0, this.canvas.width, this.canvas.height);
    const d = imageData.data;
    let diff;

    // for each pixel, get its diff from cache, or calculate it
    // NOTE: we have separate routines for green, and other colours
    // see next note

    // if user wants to remove green
    if (color[1] > color[0] && color[1] > color[2]) {
      for (let i = 0, l = d.length; i < l; i += 4) {
        if (d[i+1] > 50 && d[i+1] > d[i] && d[i+1] > d[i+2]) d[i+3] = 0;
      }
    // if user wants to remove anything else
    } else {
      for (let i = 0, l = d.length; i < l; i += 4) {
        diff = Math.abs(color[0] - d[i+0]) +
               Math.abs(color[1] - d[i+1]) +
               Math.abs(color[2] - d[i+2]);
        // NOTE: this bit doesn't work well if removing green (hence routine above)
        if (diff < t) d[i+3] = (diff*diff)/t;
      }
    }
    this.putImageData(imageData, 0, 0);
  },

  //getPixels: function() {
  //  return this.getImageData(0, 0, this.canvas.width, this.canvas.height).data
  //},

  // new drawing method & shapes
  line: function(px, py, x, y, dashPattern = []) {
    this.beginPath();
    this.save();
    this.setLineDash(dashPattern);
    this.moveTo(px, py);
    this.lineTo(x, y);
    this.closePath();
    this.fill();
    this.stroke();
    this.restore(); // use this cos we used setLineDash()
  },
  circle: function(x,y,r,deg = 360,antiClockwise) {
    this.beginPath();
    this.arc(x, y, r, 0, deg*DEG2RAD, antiClockwise);
    // go to center of circle, and _then_ close the path (creates a "pie"
    // or "pacman" shape, if degrees < 360)
    this.lineTo(x, y);
    this.closePath();
  },
  fillCircle: function(x,y,radius,deg) {
    extraMethods.circle.apply(this, [x,y,radius,deg])
    this.fill();
  },
  strokeCircle: function(x,y,radius,deg) {
    extraMethods.circle.apply(this, [x,y,radius,deg])
    this.stroke();
  },
  ellipse: function(x, y, width, height) {
    let kappa, ox, oy, xe, xm, ye, ym;
    kappa = .5522848;
    ox = (width / 2) * kappa;
    oy = (height / 2) * kappa;
    xe = x + width;
    ye = y + height;
    xm = x + width / 2;
    ym = y + height / 2;
    this.moveTo(x, ym);
    this.bezierCurveTo(x, ym - oy, xm - ox, y, xm, y);
    this.bezierCurveTo(xm + ox, y, xe, ym - oy, xe, ym);
    this.bezierCurveTo(xe, ym + oy, xm + ox, ye, xm, ye);
    this.bezierCurveTo(xm - ox, ye, x, ym + oy, x, ym);
  },
  fillEllipse: function(x, y, width, height) {
    this.beginPath();
  	extraMethods.ellipse.apply(this, [x, y, width, height])
    this.closePath();
    this.fill();
  },
  strokeEllipse: function(x, y, width, height) {
    this.beginPath();
  	extraMethods.ellipse.apply(this, [x, y, width, height])
    this.closePath();
    this.stroke();
  },
  ring: function(x, y, innerRadius, outerRadius) {
    this.beginPath();
    this.arc(x, y, innerRadius, 0, PIx2, false);
    this.moveTo(outerRadius, 0);
    this.arc(x, y, outerRadius, PIx2, 0, true);
    this.closePath();
  },
  fillRing: function(x, y, innerRadius, outerRadius) {
  	extraMethods.ring.apply(this, [x, y, innerRadius, outerRadius]);
    this.fill();
  },
  strokeRing: function(x, y, innerRadius, outerRadius) {
  	extraMethods.ring.apply(this, [x, y, innerRadius, outerRadius]);
    this.stroke();
  },
  gradientCircle: function(x, y, r, r2, offsetX = 0, offsetY = 0, fillSteps) {
    const fillGradient = this.createRadialGradient(x + offsetX, y + offsetY, r2, x + offsetX, y + offsetY, r)
    for (let i = 0; i < fillSteps.length; i++) {
      fillGradient.addColorStop(fillSteps[i][0], fillSteps[i][1]);
    }
    this.fillStyle = fillGradient;
    extraMethods.circle.apply(this, [x,y,r2])
    this.fill();
    this.closePath();
  },
  gradientRect: function(x, y, w, h, fillSteps, horiz = true) {
    if (fillSteps) {
      const fillGradient = horiz
        ? this.createLinearGradient(x, y, x, y+h)
        : this.createLinearGradient(x, y, x+w, y);
      for (let i = 0; i < fillSteps.length; i++) {
        fillGradient.addColorStop(fillSteps[i][0], fillSteps[i][1]);
      }
      this.fillStyle = fillGradient;
      this.fillRect(x, y, w, h);
      this.closePath();
    }
  },
  roundedRect: function(x, y, w, h, r) {
  	this.moveTo(x + r, y);
  	this.arcTo(x + w, y, x + w, y + r, r);
  	this.arcTo(x + w, y + h, x + w - r, y + h, r);
  	this.arcTo(x, y + h, x, y + h - r, r);
  	this.arcTo(x, y, x + r, y, r);
    this.closePath();
  },
  fillRoundedRect: function(x, y, w, h, r) {
    this.beginPath();
  	extraMethods.roundedRect.apply(this, [x, y, w, h, r])
    this.fill();
  },
  strokeRoundedRect: function(x, y, w, h, r) {
    this.beginPath();
  	extraMethods.roundedRect.apply(this, [x, y, w, h, r])
    this.stroke();
  },
  polygon: function(points, dashPattern = [], restore = true) {
    this.beginPath();
    if (restore) this.save();
    this.setLineDash(dashPattern);
    const x = points[0][0];
    const y = points[0][1];
    this.moveTo(x, y);
    points.shift(); // remove first element, we just went there
    points.forEach(point => this.lineTo(point[0], point[1]));
    this.closePath();
    if (restore) this.restore(); // use this cos we used setLineDash()
  },
  fillPolygon: function (points, dashPattern = []) {
    extraMethods.polyshape.apply(this, [points, dashPattern, false]);
    this.fill();
    this.restore(); // use this cos we used setLineDash() in polygon()
  },
  strokePolygon: function (points, dashPattern = []) {
    extraMethods.polyshape.apply(this, [points, dashPattern, false]);
    this.stroke();
    this.restore(); // use this cos we used setLineDash() in polygon()
  },
  polyshape: function(x,y,radius,s,a) {
    const position 	= {x,y};
    const sides 		= s ? s : 6;
    const angle			= a ? a : 0;
    this.translate(position.x,position.y);
    this.rotate(angle * DEG2RAD);
    this.beginPath();
    this.moveTo(radius, 0);
    for(var j = 0; j <= PIx2; j += PI / (sides/2)) {
      this.lineTo(radius * Math.cos(j), radius * Math.sin(j));
    }
    this.closePath();
    this.rotate(-angle * DEG2RAD);
    this.translate(-position.x,-position.y);
  },
  fillPolyshape: function(x,y,radius,s,a) {
    extraMethods.polyshape.apply(this, [x,y,radius,s,a])
    this.fill();
  },
  strokePolyshape: function(x,y,radius,s,a) {
    extraMethods.polyshape.apply(this, [x,y,radius,s,a])
    this.stroke();
  },
  star: function(x,y,radius,s,a) {
    const position 	= {x,y};
    const sides 		= (s ? s : 5) * 2;
    const angle			= -90 - (a ? a : 0);
    this.translate(position.x,position.y);
    this.rotate(angle * DEG2RAD);
    this.beginPath();
    this.moveTo(radius, 0);
    let wobble = 2;
    for(var j = 0; j <= PIx2; j += PI / (sides/2)) {
    	wobble = wobble == 1 ? 2 : 1;
      this.lineTo(((radius / (wobble)) * Math.cos(j)),((radius / (wobble)) * Math.sin(j)));
    }
    this.closePath();
    this.rotate(-angle * DEG2RAD);
    this.translate(-position.x,-position.y);
  },
  fillStar: function(x,y,radius,s,a) {
    extraMethods.star.apply(this, [x,y,radius,s,a])
    this.fill();
  },
  strokeStar: function(x,y,radius,s,a) {
    extraMethods.star.apply(this, [x,y,radius,s,a])
    this.stroke();
  },
  square: function(x,y,w) {
    this.beginPath();
    this.rect(x, y, w, w);
    this.closePath();
  },
  triangle: function(x,y,radius,angle) {
  	extraMethods.polyshape.apply(this, [x,y,radius,3,angle ? angle : -90])
  },
  fillTriangle: function(x,y,radius,angle) {
    extraMethods.polyshape.apply(this, [x,y,radius,3,angle ? angle : -90])
    this.fill();
  },
  strokeTriangle: function(x,y,radius,angle) {
    extraMethods.polyshape.apply(this, [x,y,radius,3,angle ? angle : -90])
    this.stroke();
  },
  curve: function(points, tension, numOfSeg, close) { // also see a simpler alternative here: https://stackoverflow.com/a/49371349
  	// options or defaults
  	tension = (typeof tension === 'number') ? tension : 0.5;
  	numOfSeg = numOfSeg ? numOfSeg : 20;
    // set some vars
  	let pts;// clone point array
  	let res = [];
  	let l = points.length;
  	let i;
  	let cache = new Float32Array((numOfSeg+2)*4);
  	let cachePtr = 4;

  	// begin..
  	pts = points.slice(0);
  	if (close) {
  		pts.unshift(points[l - 1]); // insert end point as first point
  		pts.unshift(points[l - 2]);
  		pts.push(points[0], points[1]); // first point as last point
  	}
  	else {
  		pts.unshift(points[1]);	// copy 1. point and insert at beginning
  		pts.unshift(points[0]);
  		pts.push(points[l - 2], points[l - 1]);	// duplicate end-points
  	}
  	// cache inner-loop calculations as they are based on t alone
  	cache[0] = 1;
  	for (i = 1; i < numOfSeg; i++) {
  		let st = i / numOfSeg,
  			st2 = st * st,
  			st3 = st2 * st,
  			st23 = st3 * 2,
  			st32 = st2 * 3;

  		cache[cachePtr++] =	st23 - st32 + 1;	// c1
  		cache[cachePtr++] =	st32 - st23;		// c2
  		cache[cachePtr++] =	st3 - 2 * st2 + st;	// c3
  		cache[cachePtr++] =	st3 - st2;			// c4
  	}
  	cache[++cachePtr] = 1;

  	// the parser func
  	function parse(pts, cache, l) {
  		for (let i = 2; i < l; i += 2) {
  			let pt1 = pts[i],
  				pt2 = pts[i+1],
  				pt3 = pts[i+2],
  				pt4 = pts[i+3],
  				t1x = (pt3 - pts[i-2]) * tension,
  				t1y = (pt4 - pts[i-1]) * tension,
  				t2x = (pts[i+4] - pt1) * tension,
  				t2y = (pts[i+5] - pt2) * tension;

  			for (let t = 0; t <= numOfSeg; t++) {
  				const c = t * 4;
  				res.push(cache[c] * pt1 + cache[c+1] * pt3 + cache[c+2] * t1x + cache[c+3] * t2x,
  						 cache[c] * pt2 + cache[c+1] * pt4 + cache[c+2] * t1y + cache[c+3] * t2y);
  			}
  		}
  	}

  	// calculate/parse the points
  	parse(pts, cache, l);

  	if (close) {
  		pts = [];
  		pts.push(points[l - 4], points[l - 3], points[l - 2], points[l - 1]); // second last and last
  		pts.push(points[0], points[1], points[2], points[3]); // first and second
  		parse(pts, cache, 4);
  	}
  	// add lines to path
  	for(i = 0, l = res.length; i < l; i += 2) {
  		this.lineTo(res[i], res[i+1]);
    }

  	return res;
  },

  // grids
  drawGridBox(x, y, w, h, size, lineWidth = 0.1, color = '#444') {
    this.save();
    this.lineWidth = lineWidth;
    this.strokeStyle = color;
    this.moveTo(x,y)
    this.lineTo(x+w,y)
    this.lineTo(x+w,y+h)
    this.lineTo(x,y+h)
    this.lineTo(x,y)
    // draw vertical lines
    for (let i=1; i < w/size; i++) {
      this.moveTo(x+size*i, y);
      this.lineTo(x+size*i, y+h);
    }
    // draw horizontal lines
    for (let i=1; i < h/size; i++) {
      this.moveTo(x, y+size*i);
      this.lineTo(x+w, y+size*i);
    }
    this.stroke();
    this.closePath();
    this.restore();
  },
  drawGrid(size, lineWidth = 0.1, strokeColor = '#444') {
    extraMethods.drawGridBox.apply(this, [0,0,this.canvas.width,this.canvas.height,size,lineWidth,strokeColor])
  },
  checkerboard: function(x, y, w, h, gridSize, colorA, colorB) {
    const tx = w / gridSize | 0;
    const ty = h / gridSize | 0;
    let color;
    this.save();
    this.rect(x, y, w, h);
    for (var i = 0; i <= tx; i++) {
      for (var j = 0; j <= ty; j++) {
        if (j % 2) {
          color = i % 2 ? colorA : colorB;
        }
        else {
          color = i % 2 ? colorB : colorA;
        }
        this.fillStyle = color;
        this.fillRect(x + i * gridSize, y + j * gridSize, gridSize, gridSize);
      }
    }
    this.restore();
  },

  // helper function - creates an img element, caches it, then sets the
  // onload method up to draw the image, and returns the image element - all
  // that is left to do to it is set the src elsewhere
  cacheImg: function(url, x, y, w, h, dx, dy, dWidth, dHeight) {
    if (this.cache[url]) return this.cache[url];
    this.cache[url] = new Image();
    this.cache[url].onload = () => {
      this.cache[url].width = w;
      this.cache[url].height = h;
      return dx
        ? this.drawImage(this.cache[url], x, y, w, h, dx, dy, dWidth, dHeight)
        : this.drawImage(this.cache[url], x, y, w, h);
    }
    this.cache[url].crossOrigin = 'anonymous';
    return this.cache[url];
  },

  // for explanation of params,see https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage/canvas_drawimage.jpg
  drawImg: function(url, x, y, w, h, dx, dy, dWidth, dHeight) {
    // draw now, if available
    if (url.outerHTML) return dx
      ? this.drawImage(url, x, y, w, h, dx, dy, dWidth, dHeight)
      : this.drawImage(url, x, y, w, h);
    if (!this.cache) this.cache = {};
    if (this.cache[url] && this.cache[url].src) {
      return dx
      ? this.drawImage(this.cache[url], x, y, w, h, dx, dy, dWidth, dHeight)
      : this.drawImage(this.cache[url], x, y, w, h);
    }
    // or load it and cache it first, *then* set it's src attribute to trigger
    // the 'onload' event, which will then draw the image to the canvas
    extraMethods.cacheImg.apply(this, [url, x, y, w, h, dx, dy, dWidth, dHeight]).src = !url.includes('<svg')
          ? url
          : "data:image/svg+xml; charset=utf8," + encodeURIComponent(url);
  },

  // styling helpers
  setStyle: function(obj) {
    for(i in obj) {
      this[i] = obj[i];
    };
  },

  // maths helpers
  angleFromPoints: function(x1, x2, y1, y2) {
    return Math.atan2(y2 - y1, x2 - x1) // returns radians
    // see https://stackoverflow.com/a/1707251
    // The * DEG2RAD converts radians to degrees,
    // the + 180 makes sure its always positive i.e. 0-360 deg,
    // rather than -180 to 180 deg
    return Math.atan2(y2 - y1, x2 - x1) * DEG2RAD + 180;
  },
  angleToTarget: function (x, y, x1, y1) {
    // atan2 returns the counter-clockwise angle in respect to the x-axis, but
    // the canvas rotation system is based on the y-axis (rotation of 0 = up).
    // so we need to add a quarter rotation to return a counter-clockwise
    // rotation in respect to the y-axis
    return Math.atan2(y1 - y, x1 - x) + PIo2;
  },
  clamp: function(x, min, max) {
    return Math.min(Math.max(min, x), max);
  },
  distance: function(x2, x1, y2, y1) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  },
  seededRandom: function (str) {
    // see https://stackoverflow.com/a/47593316/2124254
    // see https://github.com/bryc/code/blob/master/jshash/PRNGs.m
    // based on the above references, this was the smallest code yet decent
    // quality seed random function (from https://github.com/straker/kontra/blob/main/src/helpers.js)#
    //
    // first create a suitable hash of the seed string using xfnv1a
    // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#addendum-a-seed-generating-functions
    for (var i = 0, h = 2166136261 >>> 0; i < str.length; i++) {
      h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    }
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    let seed = (h += h << 5) >>> 0;
    // then return the seed function and discard the first result
    // @see https://github.com/bryc/code/blob/master/jshash/PRNGs.md#lcg-lehmer-rng
    let rand = () => ((2 ** 31 - 1) & (seed = Math.imul(48271, seed))) / 2 ** 31;
    rand();
    return rand;
  },
  random: function(min, max, decimal) {
    if (decimal) return Math.random() * (max - min) + min;
    return Math.floor(Math.random() * (max - min+1)) + min;
  },
  randomFrom(arr) {
    return extraMethods.random.apply(this, [1, arr.length])
  },
  rotateAt: function(x, y, deg) {
    this.translate(x, y);
    this.rotate(deg * DEG2RAD);
    this.translate(-x, -y);
  },
  toRad: function(deg) { // degrees to radians
    return deg * DEG2RAD;
  },
  toDeg: function(rad) { // radians to degrees
    return rad * RAD2DEG;
  }
};

const extraMethodNames = Object.keys(extraMethods);

/**
* @class Canvas Context2D Wrapper.
* @param {CanvasRenderingContext2D} origCtx	Canvas Context2D that will be wrapped.
* @param {Component} c	the @scottjarvis/component to which the ctx is attached (optional)
*/
window.Ctx = function(origCtx, c) {
  let n = ctxMethods.length;
  let curProp;
  let chunks;
  const supportedType = getVideoMimeType();

  /**
   * Reference to Canvas Rendering Context 2D.
   * @type CanvasRenderingContext2D
   */
  this.context = origCtx;

  //wrap methods
  while(n--) {
  	curProp = ctxMethods[n];
  	this[curProp] = chainMethod(origCtx[curProp], origCtx, this);
  }

  // wrap the extra methods
  n = extraMethodNames.length;
  while(n--) {
  	curProp = extraMethodNames[n];
  	this[curProp] = chainMethod(extraMethods[curProp], origCtx, this);
  }

  //convert properties into methods (getter/setter)
  n = ctxProps.length;
  while(n--) {
  	curProp = ctxProps[n];
  	this[curProp] = chainProperty(curProp, origCtx, this);
  }

  // the above code replaces context properties with methods in our new
  // context, so put back the reference to the canvas element, cos we want it
  this.canvas = origCtx.canvas;

  // add more methods to the extended context - they're added here cos they're
  // grouped/namespaced under ctx.image.* and ctx.video.* and the above
  // loops that make methods chainable don't handle this

  this.image = {
    // download canvas as an image file, called ${name}
    saveAs: function(name) {
      this.canvas.toBlob(blob => downloadBlobAs(blob, name));
    },
    // pass the canvas an <img> to the given callback
    toElement: function(cb) {
      const img = new Image();
      const { w, h } = this;
      // once image is loaded, pass it into the callback
      img.onload = function() {
        img.width = w;
        img.height = h;
        cb(img);
      };
      img.crossOrigin = 'anonymous';
      // set the src to trigger img.onload
      img.src = this.canvas.toDataURL('image/png');
    },
  };

  this.video = {

    // record canvas to video data
    record: (fps, mimeType = supportedType, audioBitsPerSecond = 128000, videoBitsPerSecond = 2500000) => {
      if (this.isRecording === true) return true;
      const framesPerSecond = (fps > 0 && fps <=60) ? fps : 24;
      chunks = [];
      // set media recorder options
      const opts = {
        audioBitsPerSecond,
        videoBitsPerSecond,
        mimeType
      };
      // set the stream to record
      const stream = this.canvas.captureStream(framesPerSecond);
      //if (!stream) throw Error('No stream!');
      // create the recorder
      this.rec = new MediaRecorder(stream, opts);
      //if (!this.rec) throw Error('No MediaRecorder.');
      // set callbacks
      this.rec.ondataavailable = function(e) {
        // save the video data (received in chunks)
        chunks.push(e.data);
      };
      this.rec.onstop = (e) => {
        // when the recording stops, save and return the combined blob
        this.videoBlob = new Blob(chunks, { type: mimeType });
        chunks = [];
        this.isRecording = false;
        this.rec = null;
        return this.videoBlob;
      };
      this.rec.onstart = (e) => this.isRecording = true;
      this.rec.onresume = (e) => this.isRecording = true;
      this.rec.onpause = (e) => {
        this.isRecording = false;
        this.videoBlob = new Blob(chunks, { type: mimeType });
      }
      // begin recording
      this.rec.start();
    },
    // stop recording canvas to video
    stop: () => {
      if (!this.isRecording) throw Error('No video is recording');
      return this.rec.stop();
    },
    // download the recorded video data as a video file
    saveAs: (filename) => {
      setTimeout(() => {
        if (this.isRecording) this.rec.stop();
        if (!this.videoBlob) throw Error('No video to save');
        downloadBlobAs(this.videoBlob, filename) // this.rec.stop() returns the final video as a blob;
        this.videoBlob = null;
      }, 64);
    },
    // pass the recorded canvas as a <video> to the given callback
    toElement: (cb) => {
      setTimeout(() => {
        if (!this.videoBlob) throw Error('No video to export');
        const video = document.createElement('video');
        const { w, h }  = this;
        video.width = w;
        video.height = h;
        video.crossOrigin = 'anonymous';
        video.src = URL.createObjectURL(this.videoBlob);
        video.load();
        cb(video);
      }, 64);
    }
  };

  return;
};


export default Ctx;