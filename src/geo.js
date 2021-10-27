// geo - a mapping addon
//
// adapted from the following sources:
//
// - https://github.com/nunobaldaia/mercatormap/
// - https://github.com/wbrickner/NanoGeoUtil.js
// - https://blog.cppse.nl/x-y-to-lat-lon-for-google-maps
//

const has = foo => typeof foo !== 'undefined';


/**
 * Mercator Map
 * This is an adaptation to JavaScript of the original Java utility class MercatorMap by Till Nagel.
 *
 * Creates a new MercatorMap with dimensions and bounding box to convert between geo-locations and screen coordinates.
 *
 * @param mapScreenWidth Horizontal dimension of this map, in pixels.
 * @param mapScreenHeight Vertical dimension of this map, in pixels.
 * @param topLatitude Northern border of this map, in degrees.
 * @param bottomLatitude Southern border of this map, in degrees.
 * @param leftLongitude Western border of this map, in degrees.
 * @param rightLongitude Eastern border of this map, in degrees.
 */
function MercatorMap(mapScreenWidth, mapScreenHeight, topLatitude, bottomLatitude, leftLongitude, rightLongitude) {
  this.mapScreenWidth = mapScreenWidth;
  this.mapScreenHeight = mapScreenHeight;
  this.topLatitudeRelative = this.getScreenYRelative(topLatitude);
  this.bottomLatitudeRelative = this.getScreenYRelative(bottomLatitude);
  this.leftLongitudeRadians = this.degToRadians(leftLongitude);
  this.rightLongitudeRadians = this.degToRadians(rightLongitude);

  // An array of "locations" - each location should be an object containing
  // at least the following properties:
  //  { lat, long, id }
  // ..any other props can be added like "name", "radius", "population", etc
  this.locations = [];
}

/**
 * Projects the geo location to Cartesian coordinates, using the Mercator projection.
 *
 * @param latitudeInDegrees: latitude in degrees.
 * @param longitudeInDegrees: longitude in degrees.
 * @returns The screen coordinates with [x, y].
 */
MercatorMap.prototype.latLongToPixels = function(latitudeInDegrees, longitudeInDegrees) {
  return [this.getScreenX(longitudeInDegrees), this.getScreenY(latitudeInDegrees)];
}

MercatorMap.prototype.getScreenY = function(latitudeInDegrees) {
  return this.mapScreenHeight*(this.getScreenYRelative(latitudeInDegrees) - this.topLatitudeRelative)/(this.bottomLatitudeRelative - this.topLatitudeRelative);
}

MercatorMap.prototype.getScreenX = function(longitudeInDegrees) {
  const longitudeInRadians = this.degToRadians(longitudeInDegrees);
  return this.mapScreenWidth*(longitudeInRadians - this.leftLongitudeRadians)/(this.rightLongitudeRadians - this.leftLongitudeRadians);
}

MercatorMap.prototype.getScreenYRelative = function(latitudeInDegrees) {
  return Math.log(Math.tan(latitudeInDegrees/360.0*Math.PI + Math.PI/4));
}

MercatorMap.prototype.degToRadians = function(deg) {
  return deg*Math.PI/180;
}

/*
 * Add new methods here, based on https://blog.cppse.nl/x-y-to-lat-lon-for-google-maps
 */

MercatorMap.prototype.pixelsToLatLong = function (x, y){
  return [ this.yToLat(y), this.xToLon(x) ];
}

MercatorMap.prototype.xToLon = function(x) {
    return -180 + 0.0000006705522537 * x;
}

MercatorMap.prototype.yToLat = function(y) {
    const e = 2.7182818284590452353602875;
    const a = 268435456;
    const b = 85445659.4471;
    const c = 0.017453292519943;
    return Math.asin(Math.pow(e,(2*a/b-2*y/b))/(Math.pow(e,(2*a/b-2*y/b))+1)-1/(Math.pow(e,(2*a/b-2*y/b))+1))/c;
}

/*
 * Add new methods here, based on NanoGeoUtil.js
 */

//MercatorMap.prototype.euclidDistance = function (xA, yA, xB, yB) {
//    const dx = xB - xA;
//    const dy = yB - yA;
//    return Math.sqrt(dx*dx + dy*dy);
//},


// get distance in Km between two lat longs (takes into account curvature of the earth)
MercatorMap.prototype.getDistance = function(latA, lonA, latB, lonB) {
    const degToRad = Math.PI / 180;
    const dLat = (latB - latA) * degToRad;
    const dLon = (lonB - lonA) * degToRad;
    const num = 12742 * Math.asin(Math.sqrt(0.5 - Math.cos(dLat)/2 + Math.cos(latA * degToRad) * Math.cos(latB * degToRad) * (1 - Math.cos(dLon))/2));
    return Math.round(num * 100) / 100;
}

MercatorMap.prototype.kmToMiles = function(km) {
    return km * 0.621371192;
}

MercatorMap.prototype.milesToKm = function(mi) {
    return mi * 1.609344;
}

// add some more...

MercatorMap.prototype.addLocation = function(obj) {
  if (has(obj.lat) && has(obj.long) && has(obj.id)) {
    this.locations.push(obj);
    return true;
  }
  return false;
}

MercatorMap.prototype.getNearest = function (obj) {
  if (has(obj.lat) && has(obj.long) && has(obj.id)) {
    const sortedLocations = [...this.locations].sort((a,b) => {
      // get the distance between [a.lat,a.long] and [lat,long]
      const d1 = this.getDistance(obj.lat, obj.long, a.lat, a.long)
      // get the distance between [b.lat,b.long] and [lat,long]
      const d2 = this.getDistance(obj.lat, obj.long, b.lat, b.long)
      // return whichever is closest
      return d1 - d2;
    })
    sortedLocations.shift(); // remove first item as it's the place we're checking
    return sortedLocations;
  } else {
    throw Error ('Supply an object with "lat" and "long" properties');
  }
}

// earths radius
MercatorMap.rkm = 20000/Math.PI;
MercatorMap.rmiles = 20000/(1.609344*Math.PI);


/*
 * Geo() - the main function to export, returns a MercatorMap
 *
 * Usage:
 *
 *   const map = new Geo({
 *     // dimensions (size in pixels)
 *     height:  800,
 *     width:   600,
 *     // bounds (in lat/long)
 *     top:    -85,
 *     bottom:  85,
 *     left:   -180,
 *     right:   180,
 *  });
 *
*/
const Geo = function (options) {
  // from  https://newbedev.com/maximum-lat-and-long-bounds-for-the-world-google-maps-api-latlngbounds
  const worldBounds = {
      lat: { min: -85.05115,  max: 85.05115  },
      lng: { min: -180, max: 180 },
  };
  const ctxWidth = options.width || options.ctx.canvas.width || 300;
  const ctxHeight = options.height || options.ctx.canvas.height || 150;

  return new MercatorMap(
    ctxWidth,
    ctxHeight,
    options.top || worldBounds.lat.max,
    options.bottom || worldBounds.lat.min,
    options.left || worldBounds.lng.min,
    options.right || worldBounds.lng.max,
  );
}

export default Geo;
