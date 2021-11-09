/*
 * Based on Canvas Context2D Wrapper <http://github.com/millermedeiros/CanvasContext2DWrapper>
 *
 * With additions shamelessly stolen from:
 *
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

const PIXEL_RATIO = (function () {
  return typeof window !== 'undefined'
    ? (window && window.devicePixelRatio) || 1
    : 1;
})();


// helper funcs

// used by xAxis and yAxis, returns the scaled value of the given position in the given range
const scale = ({ range, scale, position }) => {
  const [min, max] = range;
  return min + (position - min) * scale;
};


// returns the dimensions of the chart/graph axes, taking margins into account
function getAxisDimensions(obj) {
  const w = obj.canvas.width-obj.margin.right-obj.margin.left;
  const h = obj.canvas.height-obj.margin.top-obj.margin.bottom;
  const x = 0+obj.margin.left;
  const y = obj.margin.top+h;
  return { x, y, w, h };
}

// draws the main line of the axis, used by xAxis and yAxis
function drawAxisLine(ctx, dimensions, whichAxis = 'x', lineWidth = 0.5, strokeStyle = '#222') {
  const { w, h, x, y } = dimensions;
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  ctx.moveTo(x,y);
  whichAxis === 'x'
    ? ctx.lineTo(x,y-h)
    : ctx.lineTo(x+w,y);
  ctx.closePath();
  ctx.stroke();
  ctx.restore()
}

// draws the ticks along the axis, used by xAxis and yAxis
function drawAxisTicks(ctx, dimensions, whichAxis = 'x', tickLength, distanceBetweenTicks, scale, lineWidth = 0.5, strokeStyle = '#bbb') {
  const { w, h, x, y } = dimensions;
  const max = whichAxis === 'x' ? w : h;

  if (tickLength !== 0) {
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;

    for (let i=0, p=0; i<=max; i+=distanceBetweenTicks*scale){
      ctx.beginPath();
      if (whichAxis === 'x'){
        ctx.moveTo(x+i,y);
        ctx.lineTo(x+i,y-(tickLength/100*h))
      } else {
        ctx.moveTo(x,y-i);
        ctx.lineTo(x+(tickLength/100*w),y-i);
      }
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore()
  }
}


// Now define the extra methods to add/bind to our extended 2d canvas context
const extraMethods = {

  // general helper funcs
  clear: function(resetTransform) {
    if (resetTransform === true) this.setTransform(1, 0, 0, 1, 0, 0);
    this.clearRect(0, 0, this.canvas.width * PIXEL_RATIO, this.canvas.height * PIXEL_RATIO);
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

  // charts and graphs
  //
  // @TODO  add one of these
  // - https://github.com/si-mikey/cartesian
  // - https://github.com/phenax/graph-plotting
  // - https://github.com/frago12/graph.js

  data: function(data) {
    this.prevData = this.d;
    this.d = data;
    this._d = this._d || {};
  },


  // This function is super important - it maps over the data give in data(),
  // then "decorates" it, so it's easier to draw that data to the chart area.
  //
  each: function(fn) {
    const { w, h, x, y } = getAxisDimensions(this);
    if (this.d) {
      const isXFlipped = this._d.xRange[0] > this._d.xRange[1];
      const isYFlipped = this._d.yRange[0] > this._d.yRange[1];
      const minXRange = isXFlipped ? this._d.xRange[1] : this._d.xRange[0];
      const minYRange = isYFlipped ? this._d.yRange[1] : this._d.yRange[0];
      const data = { ...this.d };
      const dataKeys = Object.keys(data);
      let lineCache = {};
      let drawLines = () => {};

      dataKeys.forEach((key, i) => {
        data[key].forEach((item, n) => {
          // decorate the data with pre-defined x, y, w, h, r (etc) values,
          // to make drawing the data easier
          // scales
          item.w = w/dataKeys.length*this._d.xScale // 8 is padding
          item.h = h/dataKeys.length*this._d.yScale // 8 is padding
          item.r = 5
          // positions
          item.x = x+((this._d.xTickDistance*n)*this._d.xScale);
          item.y = y-((this._d.yTickDistance*n)*this._d.yScale);

          // Create our drawing methods here:
          //
          // NOTE: if scaling by 2 props, scale the circles, squares, etc,
          // by the __square root__ of the value passed in.
          // That makes the area scale linearly with the given value.

          const drawLine = (opts) => {
            lineCache[key] = lineCache[key] || [];
            lineCache[key].push(opts);
          }

          const drawCircle = ({ cx, cy, cr, fill }) => {
            this.beginPath();
            this.arc(
              (cx||cx===0) ? x+this._d.xTickDistance*cx-(this._d.xTickDistance*minXRange) : item.x,
              (cy||cy===0) ? y-this._d.yTickDistance*cy+(this._d.yTickDistance*minYRange) : item.y,
              cr||item.r,
              0, Math.PI*2
            );
            this.stroke();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.closePath();
          }

          const drawBar = ({ height, width, fill }) => {
            this.beginPath();
            this.rect(
              (height||height===0) ? x+(this._d.xTickDistance*n)-this._d.xTickDistance/4 : x,
              (height||height===0) ? y : y-(this._d.yTickDistance*n)+this._d.yTickDistance/2-this._d.yTickDistance/4,
              (width ||width===0)  ? (this._d.xTickDistance*width)-(this._d.xTickDistance*minXRange)   : this._d.xTickDistance/2,
              (height||height===0) ? -this._d.yTickDistance*height+(this._d.yTickDistance*minYRange) : -this._d.yTickDistance/2
            );
            this.stroke();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.closePath();
          }

          // add drawing methods to `this.d[key][datum][method]`
          item['circle'] = drawCircle;
          item['bar'] = drawBar;
          item['line'] = drawLine;
        });
        // now run the given func on the decorated data
        fn(data[key], key, i);
      });

      drawLines = () => {
        const cachedLines = Object.keys(lineCache);
        if (cachedLines.length < 1) return;
        this.save();
        cachedLines.forEach(key => {
          const firstLine = lineCache[key][0];
          if (firstLine.lineWidth) this.lineWidth = firstLine.lineWidth;
          if (firstLine.stroke) this.strokeStyle = firstLine.stroke;
          this.beginPath();
          this.moveTo(
            (firstLine.px||firstLine.px===0) ? x+this._d.xTickDistance*firstLine.px-(this._d.xTickDistance*minXRange) : x+((this._d.xTickDistance*1)*this._d.xScale),
            (firstLine.py||firstLine.py===0) ? y-this._d.yTickDistance*firstLine.py+(this._d.yTickDistance*minYRange) : y-((this._d.yTickDistance*1)*this._d.yScale),
          );
          lineCache[key].forEach((line, i) => {
            this.lineTo(
              (line.px||line.px===0) ? x+this._d.xTickDistance*line.px-(this._d.xTickDistance*minXRange) : x+((this._d.xTickDistance*(i+1))*this._d.xScale),
              (line.py||line.py===0) ? y-this._d.yTickDistance*line.py+(this._d.yTickDistance*minYRange) : y-((this._d.yTickDistance*(i+1))*this._d.yScale),
            );
            this.stroke();
          });
          this.closePath();
        });
        this.restore();
        lineCache = {};
      }

      drawLines();
    }
  },

  margin: function(t,b,l,r){
    this.margin = {
      top: t,
      bottom: b,
      left: l,
      right: r,
    }
  },

  xAxis: function(range, scale = 1, tickLength = 5, label = false, centered = false, below = true) {
    const { w, h, x, y } = getAxisDimensions(this);
    const isFlipped = range[0] > range[1];
    const theRange = isFlipped ? range[0]-range[1] : range[1]-range[0];
    const distanceBetweenTicks = Math.abs(w / theRange);

    this._d.xRange = range;
    this._d.xScale = scale;
    this._d.xTickDistance = distanceBetweenTicks;

    drawAxisLine(this,  { w, h, x, y }, 'x');
    drawAxisTicks(this, { w, h, x, y }, 'x', tickLength, distanceBetweenTicks, scale);

    if (label) {
      const labelLength = label.length*6;
      for (let i=0, p=0; i<=w; i+=distanceBetweenTicks*scale){
        let name = typeof this.d[p] !== 'undefined'
          ? this.d[p][label.toLowerCase()]*scale
          : '';
        if (this.d.length-1 !== theRange) {
          name = isFlipped ? range[1]+Math.abs(p*scale) : range[0]+Math.abs(p*scale);
        }
        if (!isFlipped) {
          this.moveTo(x+i,y);
          this.fillText(name, centered ? x+i-(labelLength/2) : x+i, y+16+8, labelLength);
        } else {
          this.moveTo(x+w-i,y);
          this.fillText(name, centered ? x+w-i-(labelLength/2) : x+w-i, y+16+8, labelLength);
        }
        p++;
      }
      this.fillText(label, (x+w/2)-(labelLength/2), below ? y+(16*3) : y-16, labelLength);
    }
  },

  yAxis: function(range, scale = 1, tickLength = 5, label = false, leftLabel = true) {
    const { w, h, x, y } = getAxisDimensions(this);
    const isFlipped = range[0] > range[1];
    const theRange = isFlipped ? range[0]-range[1] : range[1]-range[0];
    const distanceBetweenTicks = Math.abs(h / theRange);

    this._d.yRange = range;
    this._d.yScale = scale;
    this._d.yTickDistance = distanceBetweenTicks;

    drawAxisLine(this,  { w, h, x, y }, 'y');
    drawAxisTicks(this, { w, h, x, y }, 'y', tickLength, distanceBetweenTicks, scale);

    let nameWidth;
    let maxNameWidth = 0;
    if (label) {
      for (let i=0, p=0; i<=h; i+=distanceBetweenTicks*scale){
        let name = typeof this.d[p] !== 'undefined'
          ? this.d[p][label.toLowerCase()]*scale
          : '';
        if (this.d.length-1 !== theRange) {
          name = isFlipped ? range[1]+Math.abs(p*scale) : range[0]+Math.abs(p*scale);
        }
        nameWidth = `${name}`.length;
        if (nameWidth >= maxNameWidth) maxNameWidth = nameWidth;
        const xPos = x-(nameWidth*6)-16;
        if (!isFlipped) {
          this.moveTo(x,y-i);
          this.fillText(name, xPos, y-i+4);
        } else {
          this.moveTo(x,y-h-i);
          this.fillText(name, xPos, (y-h)+i+2);
        }
        p++;
      }
      this.fillText(label, leftLabel ? x-(`${label}`.length*6)-32-(maxNameWidth*6) : x+16, y+4-(h/2));
    }
  },
};

const extraMethodNames = Object.keys(extraMethods);


// ...Now the main function to export

/**
* @class Canvas Context2D Wrapper.
* @param {CanvasRenderingContext2D} origCtx	Canvas Context2D that will be wrapped.
* @param {Component} c	the @scottjarvis/component to which the ctx is attached (optional)
*/
const Chart = function(origCtx, c) {
  let n = ctxMethods.length;
  let curProp;

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
  // nested/namespaced under ctx.image.* and ctx.video.* and the above
  // loops that make methods chainable don't handle nested objects

  this.context.margin = {
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  return;
};


export default Chart;
