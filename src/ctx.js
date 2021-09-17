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
 * -
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

// calculate these constants only once
const PIx2 = Math.PI * 2;
const PIo180 = Math.PI / 180;
const PIXEL_RATIO = (function () {
  return (window && window.devicePixelRatio) || 1;
})();



/* TODO

- steal ideas from: https://github.com/mattdesl/canvas-sketch
  - set size to 'a3', 'a4', PAL, NTSC, 480p, 720p, 1080p, etc
  - export as other formats

 - ctx.color('red')  // set stroke and fill colours at once
 - ctx.fullscreen()  // method for easily toggling fullscreen
 - ctx.square(x,y,w) // quicker than using rect

 - improve triangles:
      equilateral triangle: .triangle(x, y, w)
      right-angle triangle: .triangle(x, y, w, h)
      custom triangle:      .triangle(x1, y1, x2, y2, x3, y3)

 - improve polygons:
      stars, hexagons, etc: .polygon(x,y,radius,numSides,angle)
      custom polygon:       .polygon([x1,y1,x2,y2,..]):

                            .polygon([10,200,  10,200,   10,30,    10,30]);

- linear gradient filled rectangle:

      .gradientRect(100, 100, 50, 50, [
        [ 0.0, "green" ],
        [ 0.5, "blue"  ],
        [ 1.0, "red"   ]
      ]);

- radial gradient filled circle:

      .gradiantCircle(x,y,r, [
        [ 0.0, "red"   ],
        [ 0.1, "blue"  ],
        [ 1.0, "green" ],
      ]);

 - text(txt, x, y)  // Draws text txt in position x and y
 - clearArc(x, y, radius, startAngle, endAngle, anticlockwise)
 - wrapper func for SVG to canvas (https://tristandunn.com/journal/rendering-svg-on-canvas/  ..doesn't work in Safari or iOS)
 - wrapped text

 - save as video (write each rendered frame to webm video if ctx.record=true)
    - see https://xosh.org/canvas-recorder/
    - see https://github.com/SMUsamaShah/CanvasRecorder/blob/master/CanvasRecorder.js
    - see https://medium.com/@amatewasu/how-to-record-a-canvas-element-d4d0826d3591

 - camera (pan & zoom)

      const cameraViewport = {
        width: 128,
        height: 128,
        originx: 64,
        originy: 64,
      };

      function camera(x = 0, y = 0, rotation = 0, scale = 1) {
        const rads = ctx.toRadians(rotation);
        ctx.resetTransform();
        ctx.translate(cameraViewport.originx, cameraViewport.originy);
        ctx.rotate(rads);
        ctx.scale(scale, scale);
        ctx.translate(-cameraViewport.originx, -cameraViewport.originy);
        ctx.translate(-x, -y);
      }
      // usage
      camera(offsetx, offsety, angle, scale);

      function worldToScreen(x, y) {
        return {x: x - camera.x, y: y - camera.y};
      }

      function screenToWorld(x,y) {
        return {x: x + camera.x, y: y + camera.y};
      }


- lerp (linear interpolation)

      const lerp = (start, end, t) => {
        return (1-t)*start + t*end;
      };

- mouse interactivity

   function getMousePos(event) {
      var rect = ctx.canvas.getBoundingClientRect();
      ctx.mousePos = {x:(event.clientX-rect.left)/ctx.canvas.scale, y:(event.clientY-rect.top)/ctx.canvas.scale};
    }

- easily center drawing point:

    gotoCenter: function() {
      ctx.translate(ctx.canvas.width / 2, ctx.canvas.width / 2); // center everything
    }

 - image filters:  https://www.html5rocks.com/en/tutorials/canvas/imagefilters/

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

 - map/background generator and tiler
    - https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Static_maps
    - https://mozdevs.github.io/gamedev-js-tiles/  and  https://github.com/mozdevs/gamedev-js-tiles
    - https://github.com/basementuniverse/tily
    - https://github.com/yagl/tiledmap


 - sprite (series of images, easy to setup and control/animate)

 - drawGrid(gridWidth, showLabels)
    - see https://github.com/younglaker/EasyCanvas/blob/master/EasyCanvas.js

      ctx
        .lineWidth(2)
        .strokeColor('black')
        .drawGrid(20, true)

 - node graph (see https://github.com/paulfears/Graphs)


 - easy events

      const rr = ctx.create.roundedRect(x,y,w,h,r);  // returns rr
      ctx.draw(rr);

      rr.on('mouseover', function(e) {
        this // equals rr
        e    // equals event
      });

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
  // simulate click
  //if (document.createEvent) {
  //  e = document.createEvent('MouseEvents');
  //  e.initEvent('click', true, true);
  //  a.dispatchEvent(e);
  //}
  //else if (a.click) {
    a.click();
  //}
  window.URL.revokeObjectURL(url);
}

// define extra methods to add/bind to our extended 2d canvas context
const extraMethods = {

  // general helper funcs
  clear: function(resetTransform) {
    if (resetTransform) this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width * PIXEL_RATIO, this.canvas.height * PIXEL_RATIO);
  },
  size: function(w, h) {
    this.width = w;
    this.height = h;
    this.canvas.width = w * PIXEL_RATIO;
    this.canvas.height = h * PIXEL_RATIO;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    if (this.contextType === '2d' && PIXEL_RATIO !== 1) {
      this.context.scale(PIXEL_RATIO, PIXEL_RATIO);
    }
  },
  // new drawing method & shapes
  line: function(px, py, x, y) {
    this.beginPath();
    this.moveTo(px, py);
    this.lineTo(x, y);
    this.closePath();
    this.fill();
    this.stroke();
  },
  circle: function(x, y, radius) {
    this.beginPath();
    this.arc(x, y, radius, 0, PIx2, true);
    this.closePath();
  },
  fillCircle: function(x,y,radius) {
    extraMethods.circle.apply(this, [x,y,radius])
    this.fill();
  },
  strokeCircle: function(x,y,radius) {
    extraMethods.circle.apply(this, [x,y,radius])
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
  roundedRect: function(x, y, w, h, r) {
  	this.moveTo(x + r, y);
  	this.arcTo(x + w, y, x + w, y + r, r);
  	this.arcTo(x + w, y + h, x + w - r, y + h, r);
  	this.arcTo(x, y + h, x, y + h - r, r);
  	this.arcTo(x, y, x + r, y, r);
  },
  fillRoundedRect: function(x, y, w, h, r) {
    this.beginPath();
  	extraMethods.roundedRect.apply(this, [x, y, w, h, r])
    this.closePath();
    this.fill();
  },
  strokeRoundedRect: function(x, y, w, h, r) {
    this.beginPath();
  	extraMethods.roundedRect.apply(this, [x, y, w, h, r])
    this.closePath();
    this.stroke();
  },
  polygon: function(x,y,radius,s,a) {
    const position 	= {x,y};
    const sides 		= s ? s : 6;
    const angle			= a ? a : 0;
    this.translate(position.x,position.y);
    this.rotate(angle * PIo180);
    this.beginPath();
    this.moveTo(radius, 0);
    for(var j = 0; j <= PIx2; j += Math.PI / (sides/2)) {
      this.lineTo(radius * Math.cos(j), radius * Math.sin(j));
    }
    this.closePath();
    this.rotate(-angle * PIo180);
    this.translate(-position.x,-position.y);
  },
  fillPolygon: function(x,y,radius,s,a) {
    const sides 		= s ? s : 6;
    const angle			= a ? a : 0;
    extraMethods.polygon.apply(this, [x,y,radius,sides,angle])
    this.fill();
  },
  strokePolygon: function(x,y,radius,s,a) {
    const sides 		= s ? s : 6;
    const angle			= a ? a : 0;
    extraMethods.polygon.apply(this, [x,y,radius,sides,angle])
    this.stroke();
  },
  star: function(x,y,radius,s,a) {
    const position 	= {x,y};
    const sides 		= (s ? s : 5) * 2;
    const angle			= -90 - (a ? a : 0);
    this.translate(position.x,position.y);
    this.rotate(angle * PIo180);
    this.beginPath();
    this.moveTo(radius, 0);
    let wobble = 2;
    for(var j = 0; j <= PIx2; j += Math.PI / (sides/2)) {
    	wobble = wobble == 1 ? 2 : 1;
      this.lineTo(((radius / (wobble)) * Math.cos(j)),((radius / (wobble)) * Math.sin(j)));
    }
    this.closePath();
    this.rotate(-angle * PIo180);
    this.translate(-position.x,-position.y);
  },
  fillStar: function(x,y,radius,s,a) {
    const sides = s ? s : 5;
    const angle = a ? a : 0;
    extraMethods.star.apply(this, [x,y,radius,sides,angle])
    this.fill();
  },
  strokeStar: function(x,y,radius,s,a) {
    const sides = s ? s : 5;
    const angle = a ? a : 0;
    extraMethods.star.apply(this, [x,y,radius,sides,angle])
    this.stroke();
  },
  triangle: function(x,y,radius,angle) {
  	extraMethods.polygon.apply(this, [x,y,radius,3,angle ? angle : -90])
  },
  fillTriangle: function(x,y,radius,angle) {
    extraMethods.polygon.apply(this, [x,y,radius,3,angle ? angle : -90])
    this.fill();
  },
  strokeTriangle: function(x,y,radius,angle) {
    extraMethods.polygon.apply(this, [x,y,radius,3,angle ? angle : -90])
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

  // styling helpers
  setStyle: function(obj) {
    for(i in obj) {
      this[i] = obj[i];
    };
  },

  // maths helpers
  rotateAt: function(x, y, a) {
    this.translate(x, y);
    this.rotate(a);
    this.translate(-x, -y);
  },
  distance: function(x2, x1, y2, y1) {
    return Math.sqrt(Math.pow(x2-x1, 2) + Math.pow(y2-y1, 2));
  },
  angleFromPoints: function(x1, x2, y1, y2) {
    return Math.atan2(y2-y1, x2-x1);
  },
  toRadians: function(angle) {
    return angle * PIo180;
  },
  random: function(min, max, decimal) {
    if (decimal) {
      return Math.random() * (max - min) + min;
    }
    return Math.floor(Math.random() * (max - min+1)) + min;
  },

};

const extraMethodNames = Object.keys(extraMethods);

/**
* @class Canvas Context2D Wrapper.
* @param {CanvasRenderingContext2D} origCtx	Canvas Context2D that will be wrapped.
*/
window.Ctx = function(origCtx) {
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

  // the above code replace context properties with methods in our new context,
  // so put back the reference to the canvas element, so we want it
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
      // set the src to trigger img.onload
      img.src = this.canvas.toDataURL('image/png');
    },
  };

  this.video = {
    // record canvas to video data
    record: (fps, mimeType = supportedType, audioBitsPerSecond = 128000, videoBitsPerSecond = 2500000) => {
      if (this.isRecording === true) return;
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
        video.src = URL.createObjectURL(this.videoBlob);
        video.load();
        cb(video);
      }, 64);
    }
  };

  return;
};


export default Ctx;
