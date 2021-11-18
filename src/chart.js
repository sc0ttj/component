/*
 * Based on Canvas Context2D Wrapper <http://github.com/millermedeiros/CanvasContext2DWrapper>
 *
 */

  // @TODO - fixes and improvements
  //
  // - refactor: dont cache lines, draw them in the same func as the other shapes
  // - fix: use `clip` to remove inner circle of doughnuts/arcs, to it doesn't remove bits of the other shapes
  //    - fix: once `clip` fix is working, allow setting stroke lines on pie/doughnut/arc arc shapes

  // @TODO - more drawing methods:
  //
  // - candlesticks:  .candle({ open, close, low, high, green, red, whichAxis })`
  // - draw svg:      .svg({ x, y, w, h , data })  ..where `data` is { '.a-selector': { 'fill':  data.foo }

  // @TODO - more chart types
  //
  // - spider charts           https://yangdanny97.github.io/blog/2019/03/01/D3-Spider-Chart
  // - parallell coords plot:  multiple Y axes, implicit/invisible X axis: https://datavizcatalogue.com/methods/parallel_coordinates.html

  // @TODO - a radial axis, that draws a circle, ticks extending inwards/outwards from the outside edge
  //
  // - see https://github.com/vasturiano/d3-radial-axis
  // - x axis rotates around the circle
  // - y axis reaches from centre to each tick on x axis
  // - avail axes are:
  //  - degrees around edge (x axis)
  //  - distance from centre (y axis)
  //  - number of rotations
  //  - direction of rotation



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
      getSumTotal = (array, prop) => array.filter(item => item[prop]).reduce((prev, cur) => prev + cur[prop], 0);


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


const setStyle = (ctx, obj) => {
  let fixedProp;
  for(let prop in obj) {
    fixedProp = prop;
    if (prop === 'fill') fixedProp = 'fillStyle';
    if (prop === 'stroke') fixedProp = 'strokeStyle';
    ctx[fixedProp] = obj[prop];
  };
};

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
  ctx.restore();
}

// draws the ticks along the axis, used by xAxis and yAxis
function drawAxisTicks(ctx, dimensions, whichAxis = 'x', pos, tickLength, tickCentered, distanceBetweenTicks, scale, lineWidth = 0.5, strokeStyle = '#bbb') {
  const { w, h, x, y } = dimensions,
        max = (whichAxis === 'x') ? w : h,
        centered = tickCentered ? 0 : distanceBetweenTicks/2;

  if (tickLength !== 0) {
    ctx.save();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;
    for (let i=0, p=0; i<=max+(tickCentered ? distanceBetweenTicks/4 : 0); i+=distanceBetweenTicks*scale){
      ctx.beginPath();
      if (whichAxis === 'x' && x+i+centered <= x+w) {
        const px = x+i+centered,
              py = pos < 50 ? y : y-h;
        ctx.moveTo(px,py);
        ctx.lineTo(px,py-(tickLength/100*h))
      } else if (y-i-centered >= y-h) {
        const px = pos < 50 ? x : x+w,
              py = y-i-centered;
        ctx.moveTo(px,py);
        ctx.lineTo(px+(tickLength/100*w),py);
      }
      ctx.stroke();
      ctx.closePath();
    }
    ctx.restore();
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

const getTextWidth  = (ctx, t) => ctx.measureText(t).width;

const getTextHeight = (ctx, t) => {
  const metrics = ctx.measureText(t);
  return metrics.fontBoundingBoxAscent + metrics.fontBoundingBoxDescent;
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

  useData: function(data) {
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
    if (!this.d) return;

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
        stackedBarOffsets = {},
        stackedLineOffsets = {};

    // Now loop over the users data:
    // 'dataKeys' is the top-level keys in our data, (usually categories, countries, etc)
    //
    dataKeys.forEach((key, i) => {
      const prevData = data[dataKeys[i-1]], // if needed
            nextData = data[dataKeys[i+1]]; // if needed

      let currentPieDeg = -90;

      stackedBarOffsets[i] = [];

      // Now loop over this dataset, and prepare drawing functions for each
      // data point in the set.
      //
      data[key].forEach((d, n) => {
        // Lets create our drawing methods here:
        //
        // In d3, to make it assume shape x/y/w/h defaults, you join your data
        // to an attr, but must often explictly define the other attrs as defaults.
        //
        // Let's make it easier - only define the attrs you wanna join to your data:

        // Drawing lines:
        // - just cache the line points, we'll draw them later
        const drawLine = (opts) => {
          lineCache[key] = lineCache[key] || [];
          lineCache[key].push(opts);
        }

        // Drawing circles
        // - give either cx or cy, plus any other params you wanna set
        const drawCircle = ({ cx, cy, radius, start, end, rotate = 0, style }) => {
          if (!cx && !cy) return;
          const paramX = getX(cx, n),  paramY = getY(cy, n);
          if (style) {
            this.save();
            setStyle(this, style);
          }
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
          this.fill();
          this.closePath()
          if (style) this.restore();
        };

        // Drawing pie slices
        // - just pass in the slice, all others are optional
        const drawPieSlice = ({ slice = 0, totalDegrees = 360, px, py, radius = w-(w/100*50), innerRadius = 0, rotation = 0, style }) => {
          // dont draw anything if blank data
          if (Object.keys(d).length <= 5) return;

          const paramX = px||x+w/2,
                paramY = py||y-h/2,
                // get name of key/prop that "slice" represents:
                // dumb method - just find a prop in `d` with a matching value
                prop = Object.keys(d).find(k=>d[k]===slice),
                // get the sum total in our dataset for that prop
                sumTotal = getSumTotal(data[key], prop),
                sliceAsPercOfTotal = slice/(sumTotal)*100,
                sliceInDeg = sliceAsPercOfTotal*totalDegrees/100;

          if (style) {
            this.save();
            setStyle(this, style);
          }
          this.beginPath();
          this.arc(
            paramX,
            paramY,
            radius,
            // start angle (in radians)
            deg2rad(currentPieDeg-rotation),
            // end angle (in radians)
            deg2rad(currentPieDeg+sliceInDeg-rotation),
          );
          // go to center of circle, and _then_ close the path (creates a "pie"
          // or "pacman" shape, if degrees < 360)
          this.lineTo(paramX, paramY);
          this.fill();
          this.closePath();
          if (innerRadius) {
            this.save();
            this.globalCompositeOperation = "destination-out";
            this.beginPath();
            this.arc(paramX, paramY, innerRadius, 0, Math.PI*2);
            this.moveTo(radius, 0);
            this.fill();
            this.restore();
          }
          currentPieDeg += sliceInDeg;
          if (style) this.restore();
        }

        // Drawing arc/gauge slices
        // - just pass in the slice, all others are optional
        // - a wrapper around pieSlice, with different defaults
        const drawArcSlice = ({
          slice = 0,
          totalDegrees = 180,
          px,
          py,
          radius,
          innerRadius = 50,
          rotation = 90,
          style,
        }) => {
          drawPieSlice({
            slice,
            totalDegrees,
            px,
            py,
            radius,
            innerRadius,
            rotation,
            style,
          });
        };

        // Draw bars
        // - pass in either height or width, not both!
        //   - pass in height to draw vertical bars
        //   - pass in width to draw horizontal bars
        // - bars are grouped side by side, by default, but can be stacked
        const drawBar = ({ height, width, stacked = false, padding = 12, style }) => {
          const isVertical = (height||height===0);

          const barPadding = isVertical ? xDistance/100*padding : yDistance/100*padding,
                barWidth   = (isVertical ? xDistance : yDistance)/(stacked ? 1.25: dataLength)-(barPadding/2),
                barHeight  = isVertical ? height : width,
                centered   = barWidth*dataLength/2;

          // accumulate the previous bar heights
          let totalHeight = 0;
          if (stacked) {
            Object.keys(stackedBarOffsets).forEach(k => {
              // account for "padded" data when grabbing previous bar heights:
              // @TODO - work out why this startNum check even works...
              //       - and double check it actually does!
              const startNum = stackedBarOffsets[k].length === 0 ? n-1 : n;
              totalHeight += stackedBarOffsets[k][startNum]||0;
            });
          }
          // set the stacked bar offset position
          let stackedBarOffset = prevData ? totalHeight*(isVertical ? yDistance : xDistance) : 0;

          if (style) {
            this.save();
            setStyle(this, style);
          }
          this.beginPath();
          this.fillRect(
            // x
            xFlipped
              ? isVertical
                ? stacked ? x+w-(xDistance*n)-(barWidth+barPadding)/2 : x+w-(barWidth*i)-(xDistance*n)+(centered/2)
                : stacked ? x+w-stackedBarOffset : x+w
              : isVertical
                ? stacked ? x+(xDistance*n)-(barWidth+barPadding)/2 : x+(xDistance*n)+(barWidth*i)-centered
                : x+stackedBarOffset,
            // y
            yFlipped
              ? isVertical
                ? y-h+(stacked ? stackedBarOffset : 0)
                : stacked ? y-h+(yDistance*n)+barWidth/2 : y-h+(barWidth*i)+(yDistance*n)-(barWidth)
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
                : (xDistance*barHeight)-(stacked ? 0 : xDistance*minXRange),
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
          this.stroke();
          this.closePath();
          if (style) this.restore();
        }

        // add drawing methods to `data[key][n][shape]`
        d['circle'] = drawCircle;
        d['bar'] = drawBar;
        d['pie'] = drawPieSlice;
        d['arc'] = drawArcSlice;
        d['line'] = drawLine;
      });
      // now run the given func on the decorated data
      fn(data[key], key, i);
      //
    });

    // Draw lines
    // - draws the lines that were merely cached by .line()
    // - takes its the x,y point to draw from the lineCache object
    drawLines = () => {
      const cachedKeys = Object.keys(lineCache);
      if (cachedKeys.length < 1) return;
      let paramX, paramY, isStacked, areaFill;
      this.save();
      cachedKeys.forEach((key, i) => {
        stackedLineOffsets[key] = [];
        lineCache[key].forEach((line, l) => {
          const { px, py, stacked, smooth, style } = line;
          // styling
          if (style) setStyle(this, style);
          // accumulate the previous line heights
          let totalHeight = 0;
          let nextTotalHeight = 0;
          if (stacked) {
            Object.keys(stackedLineOffsets).forEach(k => {
              totalHeight += stackedLineOffsets[k][l]||0;
              nextTotalHeight += stackedLineOffsets[k][l+1]||0;
            });
          }
          paramX = getX(px, l);
          paramY = getY(stacked ? py+totalHeight : py, l);
          areaFill = style.fillStyle||style.fill;
          isStacked = stacked;
          if (l === 0) {
            this.beginPath();
            if (areaFill) {
              xFlipped
                ? this.moveTo(x+w, yFlipped ? y-h : y)
                : this.moveTo(paramX, paramY);
            }
          }
          if (px||py) {
            if (smooth) {
              const nextLine = lineCache[key][l+1];
              if (nextLine) {
                const nextPx = getX(nextLine.px, l+1),
                      nextPy = getY(nextLine.py+nextTotalHeight, l+1),
                      x_mid = (paramX + nextPx) / 2,
                      y_mid = (paramY + nextPy) / 2,
                      cp_x1 = (x_mid + paramX) / 2,
                      cp_x2 = (x_mid + nextPx) / 2;

                this.quadraticCurveTo(cp_x1, paramY, x_mid,  y_mid);
                this.quadraticCurveTo(cp_x2, nextPy, nextPx, nextPy);
              }
            } else {
              this.lineTo(paramX, paramY);
            }
          }
          // store all line heights for this dataset
          if (stacked) stackedLineOffsets[key].push(py);
        });
        this.stroke();
        // if filling the area under the line
        if (areaFill) {
          this.save();
          this.lineTo(paramX, yFlipped ? y-h : y);
          if (!xFlipped) this.lineTo(x,yFlipped ? y-h : y);
          if (isStacked) this.globalCompositeOperation = "destination-over"
          this.globalAlpha = 0.75;
          this.fill();
          this.restore();
        }
        // always close path
        this.closePath();
      });

      this.restore();
      lineCache = {};
    }
    drawLines();
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
    setStyle(this, obj);
  },

  xAxis: function({ range, scale = 1, yPos = 0, tickLength = 5, label = false, labelBelow = true, tickLabelCentered = false, tickCentered = true, tickLabels }) {
    const { w, h, x, y } = getDimensions(this),
          flippedAxis = range[0] > range[1],
          theRange = getRange(range),
          distanceBetweenTicks = Math.abs(w / theRange),
          labelLength = getTextWidth(this, label),
          labelHeight = getTextHeight(this, label);

    this._d.xRange = range;
    this._d.xScale = scale;
    this._d.xDistance = distanceBetweenTicks;
    this._d.xLabels = [];

    drawAxisTicks(this, { w, h, x, y }, 'x', yPos, yPos <= 50 ? tickLength : -tickLength, tickCentered, distanceBetweenTicks, scale);
    drawAxisLine(this,  { w, h, x, y }, 'x', yPos);

    for (let i=0, p=0; i<=(w+distanceBetweenTicks/2); i+=distanceBetweenTicks*scale) {
      const tickLabel = getTickLabel(range, flippedAxis, p, scale, tickLabels),
            tickLabelLength = getTextWidth(this, tickLabel),
            py = yPos <= 50 ? (y+labelHeight+(labelHeight/2))-(h/100*yPos) : y-(h/100*yPos)-labelHeight,
            px = flippedAxis
              ? tickLabelCentered ? x+w-i-(tickLabelLength/2) : x+w-i
              : tickLabelCentered ? x+i-(tickLabelLength/2) : x+i;

      this._d.xLabels.push(tickLabel);
      this.fillText(tickLabel, px, py);
      p++;
    }

    if (label) {
      this.fillText(
      //text
      label,
      //x
      (x+w/2)-(labelLength/2),
      //y
      labelBelow
        ? y+(labelHeight*3)
        : y-h-(labelHeight*2)-(labelHeight/2)
      );
    }
  },

  yAxis: function({ range, scale = 1, xPos = 0, tickLength = 5, label = false, labelLeft = true, tickCentered = true, tickLabels }) {
    const { w, h, x, y } = getDimensions(this),
          flippedAxis = range[0] > range[1],
          theRange = getRange(range),
          distanceBetweenTicks = Math.abs(h / theRange),
          labelWidth = getTextWidth(this, label),
          labelHeight = getTextHeight(this, label);

    let maxLabelWidth = 0;

    this._d.yRange = range;
    this._d.yScale = scale;
    this._d.yDistance = distanceBetweenTicks;
    this._d.yLabels = [];

    drawAxisTicks(this, { w, h, x, y }, 'y', xPos, xPos <= 50 ? tickLength : -tickLength, tickCentered, distanceBetweenTicks, scale);
    drawAxisLine(this,  { w, h, x, y }, 'y', xPos);

    for (let i=0, p=0; i<=h; i+=distanceBetweenTicks*scale){
      const tickLabel = getTickLabel(range, flippedAxis, p, scale, tickLabels),
            tickLabelWidth = getTextWidth(this, tickLabel),
            py = !flippedAxis ? y-i+4 : (y-h)+i+2,
            px = (xPos <= 50)
              ? x-labelHeight-(tickLabelWidth)+(w/100*xPos)
              : x+(w/100*xPos)+labelHeight;

      if (tickLabelWidth >= maxLabelWidth) maxLabelWidth = tickLabelWidth;
      this._d.yLabels.push(tickLabel);
      this.fillText(tickLabel, px, py);
      p++;
    }

    if (label) {
      this.fillText(
        // text
        label,
        // x
        labelLeft
          ? x-labelWidth-(labelHeight*2)-(maxLabelWidth)
          : xPos <= 50 ? x+w+labelHeight : x+w+(labelHeight*2)+(maxLabelWidth),
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
