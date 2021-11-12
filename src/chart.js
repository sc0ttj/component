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

const isFn = v => typeof v ==='function',
      isArray = v => Array.isArray(v),
      isAxisFlipped = range => isArray(range) ? range[0] > range[1] : false,
      axisMin  = range => isArray(range) ? isAxisFlipped(range)?range[1]:range[0] : 0,
      getRange = range => isArray(range) ? isAxisFlipped(range)?range[0]-range[1]:range[1]-range[0]: 0;


// returns the scaled value of the given position in the given range
//const scale = ({ range, scale, position }) => {
//  const [min, max] = range;
//  return min + (position - min) * scale;
//};


// returns the dimensions and sizings used by the chart/graph
function getDimensions(ctx) {
  const w = ctx.canvas.width-ctx.margin.right-ctx.margin.left;
  const h = ctx.canvas.height-ctx.margin.top-ctx.margin.bottom;
  const x = 0+ctx.margin.left;
  const y = ctx.margin.top+h;
  const { xRange, yRange, xScale, yScale, xLabels, yLabels, xTickDistance, yTickDistance } = ctx._d;
  return { x, y, w, h, margin: ctx.margin, xRange, yRange, xScale, yScale, xLabels, yLabels, xDistance: xTickDistance, yDistance: yTickDistance };
}

// draws the main line of the axis, used by xAxis and yAxis
function drawAxisLine(ctx, dimensions, whichAxis = 'x', pos, lineWidth = 0.5, strokeStyle = '#222') {
  const { w, h, x, y } = dimensions;
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = strokeStyle;
  ctx.beginPath();
  if (whichAxis === 'x') {
    let py = y-(h/100*pos);
    ctx.moveTo(x,py)
    ctx.lineTo(x+w,py)
  } else {
    let px = x+(w/100*pos);
    ctx.moveTo(px,y)
    ctx.lineTo(px,y-h)
  }
  ctx.closePath();
  ctx.stroke();
  ctx.restore()
}

// draws the ticks along the axis, used by xAxis and yAxis
function drawAxisTicks(ctx, dimensions, whichAxis = 'x', pos, tickLength, distanceBetweenTicks, scale, lineWidth = 0.5, strokeStyle = '#bbb') {
  const { w, h, x, y } = dimensions,
        max = (whichAxis === 'x') ? w : h;

  if (tickLength !== 0) {
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;

    for (let i=0, p=0; i<=max; i+=distanceBetweenTicks*scale){
      ctx.beginPath();
      if (whichAxis === 'x'){
        const py = pos < 50 ? y : y-h;
        ctx.moveTo(x+i,py);
        ctx.lineTo(x+i,py-(tickLength/100*h))
      } else {
        const px = pos < 50 ? x : x+w;
        ctx.moveTo(px,y-i);
        ctx.lineTo(px+(tickLength/100*w),y-i);
      }
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore()
  }
}

// returns either a default tick label, generated from the given range, or
// taken `labels` if an array, or the default is passed in `labels` if it's
// a function, and whatever is returned is used
const getTickLabel = (range, flippedAxis, pos, scale, labels) => {
  const autoLabel = flippedAxis
    ? range[1]+Math.abs(pos*scale)
    : range[0]+Math.abs(pos*scale);

  let tickLabel = (typeof labels[pos]!=='undefined')
    ? labels[pos]
    : autoLabel;

  if (isFn(labels)) {
    tickLabel = labels(autoLabel, pos)
  }

  return tickLabel;
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
    const c = this.canvas;
    c.width = this.w * PIXEL_RATIO;
    c.height = this.h * PIXEL_RATIO;
    // update the CSS too
    c.style.width = this.w + 'px';
    c.style.height = this.h + 'px';
    c.style.objectFit = a ? 'contain' : null;
    // adjust scale for pixel ratio
    if (this.contextType === '2d' && PIXEL_RATIO !== 1) {
      this.scale(PIXEL_RATIO, PIXEL_RATIO);
    }
  },

  dimensions: function() {
    return getDimensions(this);
  },

  // charts and graphs
  //
  // @TODO  add one of these
  // - https://github.com/si-mikey/cartesian
  // - https://github.com/phenax/graph-plotting
  // - https://github.com/frago12/graph.js

  data: function(data) {
    this.prevData = this.d;
    // If `data` if a func, run it, passing in the previous data (which
    // might be useful), else, just set the given data.
    this.d = isFn(data) ? data(this.prevData) : data;
    // internal chart data, used to calculate positions, sizes, etc
    this._d = this._d || {};
  },


  // This function is super important - it maps over the data give in data(),
  // then "decorates" it, so it's easier to draw that data to the chart area.
  //
  drawEach: function(fn) {
    if (this.d) {
      const { w, h, x, y } = getDimensions(this),
          _d = this._d,
          minXRange = axisMin(_d.xRange),
          minYRange = axisMin(_d.yRange),
          xFlipped = isAxisFlipped(_d.xRange),
          yFlipped = isAxisFlipped(_d.yRange),
          xDistance = _d.xTickDistance,
          yDistance = _d.yTickDistance,
          xScale = _d.xScale,
          yScale = _d.yScale,
          data = isArray(this.d) ? { data: [ ...this.d ] } : { ...this.d },
          dataKeys = Object.keys(data),
          dataLength = dataKeys.length;

      let lineCache = {},
          drawLines = () => {};

      dataKeys.forEach((key, i) => {
        data[key].forEach((d, n) => {
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
            const useCx = (cx||cx===0),
                  useCy = (cy||cy===0);

            if (!useCx && !useCy) return;

            this.beginPath();
            this.arc(
              // x
              xFlipped
                ? useCx
                  // if user passed in cx
                  ? (x+w)-((xDistance*cx)-(xDistance*minXRange))
                  // if user didn't pass in cx
                  : x+w-(xDistance*n)*xScale
                : useCx
                  ? x+(xDistance*cx)-(xDistance*minXRange)
                  : x+(xDistance*n)*xScale,
              // y
              yFlipped
                ? useCy
                  // if user passed in cy
                  ? ((y-h)+(yDistance*cy))-(yDistance*minYRange)
                  // if user didn't pass in cy
                  : y-h+(yDistance*n)*yScale
                : useCy
                  // if user passed in cy
                  ? y-(yDistance*cy)+(yDistance*minYRange)
                  // if user didn't pass in cy
                  : y-(yDistance*n)*yScale,
              // radius
              cr||5,
              // start angle, end angle (in radians)
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
            const useHeight = (height||height===0),
                  useWidth = (width||width===0);

            if (!useWidth && !useHeight) return;

            this.beginPath();
            this.rect(
              // x
              xFlipped
                ? useHeight
                  ? x+w-(xDistance*n)-xDistance/4
                  : x+w
                : useHeight
                  ? x+(xDistance*n)-xDistance/4
                  : x,
              // y
              yFlipped
                ? useHeight
                  ? y-h
                  : (y-h)+(yDistance*n)+yDistance/2-yDistance/4
                : useHeight
                  ? y
                  : y-(yDistance*n)+yDistance/2-yDistance/4,
              // w
              xFlipped
                ? useWidth
                  ? -(xDistance*width)+(xDistance*minXRange)
                  : xDistance/2
                : useWidth
                  ? (xDistance*width)-(xDistance*minXRange)
                  : xDistance/2,
              // h
              yFlipped
                ? useHeight
                  ? yDistance*height-(yDistance*minYRange)
                  : -yDistance/2
                : useHeight
                  ? -yDistance*height+(yDistance*minYRange)
                  : -yDistance/2
            );
            this.stroke();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.closePath();
          }

          // add drawing methods to `data[key][n][shape]`
          d['circle'] = drawCircle;
          d['bar'] = drawBar;
          d['line'] = drawLine;
        });
        // now run the given func on the decorated data
        fn(data[key], key, i);
      });

      drawLines = () => {
        const cachedLines = Object.keys(lineCache);
        if (cachedLines.length < 1) return;
        this.save();
        cachedLines.forEach(key => {
          this.beginPath();
          lineCache[key].forEach((line, i) => {
            const { px, py, lineWidth, stroke } = lineCache[key][i],
                  usePx = (px||px===0),
                  usePy = (py||py===0);

            if (!usePx && !usePy) return;
            if (lineWidth) this.lineWidth = lineWidth;
            if (stroke) this.strokeStyle = stroke;

            const paramsX = xFlipped
              ? usePx ? x+w-xDistance*px+(xDistance*minXRange) : (x+w)-((xDistance*(i))*xScale)
              : usePx ? x+xDistance*px-(xDistance*minXRange) : x+((xDistance*(i))*xScale);

            const paramsY = yFlipped
              ? usePy ? (y-h)+(yDistance*py)-(yDistance*minYRange) : (y-h)+((yDistance*(i))*yScale)
              : usePy ? y-yDistance*py+(yDistance*minYRange) : y-((yDistance*(i))*yScale)

            if (i === 0) this.moveTo(paramsX, paramsY);
            this.lineTo(paramsX, paramsY);
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

  xAxis: function(range, scale = 1, yPos = 0, tickLength = 5, label = false, below = true, centered = false, tickLabels) {
    const { w, h, x, y } = getDimensions(this),
          flippedAxis = range[0] > range[1],
          theRange = getRange(range),
          distanceBetweenTicks = Math.abs(w / theRange),
          labelLength = label.length*6;

    this._d.xRange = range;
    this._d.xScale = scale;
    this._d.xTickDistance = distanceBetweenTicks;
    this._d.xLabels = [];

    drawAxisTicks(this, { w, h, x, y }, 'x', yPos, yPos <= 50 ? tickLength : -tickLength, distanceBetweenTicks, scale);
    drawAxisLine(this,  { w, h, x, y }, 'x', yPos);

    for (let i=0, p=0; i<=w; i+=distanceBetweenTicks*scale) {
      const tickLabel = getTickLabel(range, flippedAxis, p, scale, tickLabels);
      this._d.xLabels.push(tickLabel)
      const py = yPos <= 50 ? (y+16+8)-(h/100*yPos) : y-(h/100*yPos)-16;
      if (!flippedAxis) {
        this.fillText(
          // text
          tickLabel,
          // x
          centered ? x+i-(labelLength/2) : x+i,
          // y
          py);
      } else {
        this.fillText(
          // text
          tickLabel,
          // x
          centered ? x+w-i-(labelLength/2) : x+w-i,
          // y
          py
        );
      }
      p++;
    }

    if (label) {
      this.fillText(
      //text
      label,
      //x
      (x+w/2)-(labelLength/2),
      //y
      below
        ? y+(16*3)
        : y-h-(16*2)-8
      );
    }
  },

  yAxis: function(range, scale = 1, xPos = 0, tickLength = 5, label = false, leftLabel = true, tickLabels) {
    const { w, h, x, y } = getDimensions(this),
          flippedAxis = range[0] > range[1],
          theRange = getRange(range),
          distanceBetweenTicks = Math.abs(h / theRange);

    let maxLabelWidth = 0;

    this._d.yRange = range;
    this._d.yScale = scale;
    this._d.yTickDistance = distanceBetweenTicks;
    this._d.yLabels = [];

    drawAxisTicks(this, { w, h, x, y }, 'y', xPos, xPos <= 50 ? tickLength : -tickLength, distanceBetweenTicks, scale);
    drawAxisLine(this,  { w, h, x, y }, 'y', xPos);

    for (let i=0, p=0; i<=h; i+=distanceBetweenTicks*scale){

      const tickLabel = getTickLabel(range, flippedAxis, p, scale, tickLabels);

      const tickLabelWidth = `${tickLabel}`.length;

      if (tickLabelWidth >= maxLabelWidth) maxLabelWidth = tickLabelWidth;
      this._d.yLabels.push(tickLabel);

      const px = (xPos <= 50)
        ? x-16-(tickLabelWidth*6)+(w/100*xPos)
        : x+(w/100*xPos)+16;

      if (!flippedAxis) {
        this.fillText(tickLabel, px, y-i+4);
      } else {
        this.fillText(tickLabel, px, (y-h)+i+2);
      }
      p++;
    }

    if (label) {
      this.fillText(
        // text
        label,
        // x
        leftLabel
          ? x-(`${label}`.length*6)-32-(maxLabelWidth*6)
          : xPos <= 50 ? x+w+16 : x+w+32+(maxLabelWidth*6),
        // y
        y+4-(h/2)
      );
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
