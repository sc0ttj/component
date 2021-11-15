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
      getRange = range => isArray(range) ? isAxisFlipped(range)?range[0]-range[1]:range[1]-range[0]: 0,
      deg2rad = deg => +deg*Math.PI/180,
      getSumTotal = (array, prop) => array.reduce((prev, cur) => prev + cur[prop], 0);


// clears a circular area on canvas, like clearRect, for circles
//const clearCircle = (ctx, x, y, r) => {
//    for(let i = 0; i < Math.round( Math.PI * r ); i++ ) {
//        let angle = ( i / Math.round( Math.PI * r )) * 360;
//        ctx.clearRect( x , y , Math.sin( angle * ( Math.PI / 180 )) * r , Math.cos( angle * ( Math.PI / 180 )) * r );
//    }
//}


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
  const { xRange, yRange, xScale, yScale, xLabels, yLabels, xDistance, yDistance } = ctx._d;
  return { x, y, w, h, margin: ctx.margin, xRange, yRange, xScale, yScale, xLabels, yLabels, xDistance, yDistance };
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
  const abs = Math.abs,
        autoLabel = flippedAxis
          ? range[1]+abs(pos*scale)
          : range[0]+abs(pos*scale);

  let tickLabel = (Array.isArray(labels) && typeof labels[pos]!=='undefined')
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
          xDistance = _d.xDistance,
          yDistance = _d.yDistance,
          xScale = _d.xScale,
          yScale = _d.yScale,
          data = isArray(this.d) ? { data: [ ...this.d ] } : { ...this.d },
          dataKeys = Object.keys(data),
          dataLength = dataKeys.length;

      // two helper funcs to get X,Y position of circle and line shapes,
      // used by drawCircle() and drawLines()
      const getX = (px, n) => xFlipped
        ? (px||px===0) ? x+w-(xDistance*px)-(xDistance*minXRange) : x+w-(xDistance*n)*xScale
        : (px||px===0) ? x+(xDistance*px)-(xDistance*minXRange) : x+(xDistance*n)*xScale;

      const getY = (py, n) => yFlipped
        ? (py||py===0) ? y-h+(yDistance*py)-(yDistance*minYRange) : y-h+(yDistance*n)*yScale
        : (py||py===0) ? y-(yDistance*py)+(yDistance*minYRange) : y-(yDistance*n)*yScale


      let lineCache = {},
          drawLines = () => {},
          stackedBarOffsets = {};

      dataKeys.forEach((key, i) => {
        const prevData = data[dataKeys[i-1]], // if needed
              nextData = data[dataKeys[i+1]]; // if needed

        let currentPieDeg = -90;

        stackedBarOffsets[i] = [];

        data[key].forEach((d, n) => {
          // Create our drawing methods here:
          //
          // @TODO - don't use `fill` etc, pass in `styles` object,
          //         each drawing method should use setStyle()

          const drawLine = (opts) => {
            lineCache[key] = lineCache[key] || [];
            lineCache[key].push(opts);
          }

          const drawCircle = ({ cx, cy, radius, start, end, rotate = 0, fill }) => {
            if (!cx && !cy) return;
            const paramX = getX(cx, n),  paramY = getY(cy, n);

            this.beginPath();
            this.arc(
              paramX,
              paramY,
              // radius
              radius||5,
              // start angle (in radians)
              deg2rad(start+rotate)||0,
              // end angle (in radians)
              deg2rad(end+rotate)||Math.PI*2
            );
            // go to center of circle, and _then_ close the path (creates
            // a "pie" or "pacman" shape, if degrees < 360)
            this.lineTo(paramX, paramY);
            this.closePath();
            this.stroke();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.closePath();
          };

          const drawPieSlice = ({ px, py, radius = w-(w/100*50), innerRadius = 0, slice = 0, fill }) => {
            // dont draw anything if blank data
            if (Object.keys(d).length < 4) return;
            const paramX = px||x+w/2,
                  paramY = py||y-h/2,
                  // get name of key/prop that "slice" represents:
                  // dumb method - just find a prop in `d` with a matching value
                  // @TODO fix: this breaks if data is "padded" (first object in data[key] is empty)
                  prop = Object.keys(d).find(k=>d[k]===slice),
                  // get the sum total in our dataset for that prop
                  sumTotal = getSumTotal(data[key], prop),
                  sliceAsPercOfTotal = slice/sumTotal*100,
                  sliceInDeg = sliceAsPercOfTotal*360/100;

            this.beginPath();
            this.arc(
              paramX,
              paramY,
              radius,
              // start angle (in radians)
              deg2rad(currentPieDeg),
              // end angle (in radians)
              deg2rad(currentPieDeg+sliceInDeg)
            );
            // go to center of circle, and _then_ close the path (creates a "pie"
            // or "pacman" shape, if degrees < 360)
            this.lineTo(paramX, paramY);
            this.closePath();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.stroke();
            if (innerRadius) {
              this.save();
              this.globalCompositeOperation = "destination-out";
              this.beginPath();
              this.arc(paramX, paramY, innerRadius, 0, Math.PI*2, false);
              this.moveTo(radius, 0);
              this.fill();
              this.globalCompositeOperation = "source-over";
              this.stroke();
              this.restore();
            }
            this.closePath();
            currentPieDeg += sliceInDeg;
          }

          const drawBar = ({ height, width, fill, stacked = false, padding = 12 }) => {
            const isVertical = (height||height===0);

            if (!(width||width===0) && !isVertical) return;

            const barPadding = isVertical ? xDistance/100*padding : yDistance/100*padding,
                  barWidth   = (isVertical ? xDistance : yDistance)/(stacked ? 1.25: dataLength)-(barPadding/2),
                  barHeight  = isVertical ? height : width,
                  centered   = barWidth*dataLength/2;

            // accumulate the previous bar heights
            let totalHeight = 0;
            Object.keys(stackedBarOffsets).forEach(key => {
              totalHeight += stackedBarOffsets[key][n-1]||0;
            });

            // set the stacked bar offset position
            let stackedBarOffset = prevData ? totalHeight*(isVertical ? yDistance : xDistance) : 0;

            this.beginPath();

            this.rect(
              // x
              xFlipped
                ? isVertical
                  ? stacked ? x+w-(xDistance*n)-(centered+(barPadding/2)) : x+w-(barWidth*i)-(xDistance*n)+(centered/2)
                  : x+w
                : isVertical
                  ? x+(xDistance*n)+(stacked ? barPadding-centered/2 : barWidth*i)-centered
                  : x+stackedBarOffset,
              // y
              yFlipped
                ? isVertical
                  ? y-h+(stacked ? stackedBarOffset : 0)
                  : y-h+(barWidth*i)+(yDistance*n)-(barWidth)
                : isVertical
                  ? y-(stacked ? stackedBarOffset : 0)
                  : stacked ? y-(yDistance*n)+barWidth/2 : y-barWidth*i-(yDistance*n)+centered,
              // w
              xFlipped
                ? isVertical
                  ? stacked ? xDistance-barPadding: barWidth
                  : -(xDistance*(stacked ? barHeight : width))+(xDistance*minXRange)
                : isVertical
                  ? stacked ? xDistance-barPadding: barWidth
                  : (xDistance*barHeight)-(xDistance*minXRange),
              // h
              yFlipped
                ? isVertical
                  ? yDistance*(stacked ? barHeight : height)-(stacked ? 0 : yDistance*minYRange)
                  : -barWidth
                : isVertical
                  ? -yDistance*(stacked ? barHeight : height)+(stacked ? 0 : yDistance*minYRange)
                  : -barWidth
            );
            // store all bar heights for this dataset
            if (stacked) stackedBarOffsets[i].push(barHeight);
            // draw it
            this.stroke();
            if (fill) {
              this.fillStyle = fill;
              this.fill();
            }
            this.closePath();
          }

          // @TODO - add more drawing methods:
          //
          // - candlesticks:                      .candle({ start, end, min, max, green, red, axis })
          // - svg file:                          .svg({ svg, x, y, h, w })
          // - rescaled svg:                      .svg({ svg, sx, sy, sh, sw, dx, dy, dh, dh })
          // - lines/polygons, drawn manually:    .poly({ x1,y1,x2,y2 })
          // - stacked lines (area chart)         .area({})
          // -


          // add drawing methods to `data[key][n][shape]`
          d['circle'] = drawCircle;
          d['bar'] = drawBar;
          d['pie'] = drawPieSlice;
          d['line'] = drawLine;
        });
        // now run the given func on the decorated data
        fn(data[key], key, i);
        //
      });

      drawLines = () => {
        const cachedLines = Object.keys(lineCache);
        if (cachedLines.length < 1) return;
        this.save();
        cachedLines.forEach(key => {
          this.beginPath();
          lineCache[key].forEach((line, l) => {
            const { px, py, lineWidth, stroke } = lineCache[key][l];
            if (!px && !py) return;
            if (lineWidth) this.lineWidth = lineWidth;
            if (stroke) this.strokeStyle = stroke;
            const paramX = getX(px, l);
            const paramY = getY(py, l)
            if (l === 0) this.moveTo(paramX, paramY);
            this.lineTo(paramX, paramY);
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

  setStyle: function(obj) {
    for(i in obj) {
      this[i] = obj[i];
    };
  },

  xAxis: function(range, scale = 1, yPos = 0, tickLength = 5, label = false, below = true, centered = false, tickLabels) {
    const { w, h, x, y } = getDimensions(this),
          flippedAxis = range[0] > range[1],
          theRange = getRange(range),
          distanceBetweenTicks = Math.abs(w / theRange),
          labelLength = label.length*6;

    this._d.xRange = range;
    this._d.xScale = scale;
    this._d.xDistance = distanceBetweenTicks;
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
    this._d.yDistance = distanceBetweenTicks;
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
