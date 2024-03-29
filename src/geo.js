// geo - a mapping addon
//
// Adapted from the following sources:
// - https://github.com/nunobaldaia/mercatormap/
// - https://github.com/wbrickner/NanoGeoUtil.js
// - https://blog.cppse.nl/x-y-to-lat-lon-for-google-maps
// - https://github.com/afar/robinson_projection


// some helpers
const degToRad = Math.PI/180;
//const radToDeg = 180/Math.PI;
const has = foo => typeof foo !== 'undefined';

/**
 * RobinsonMap
 *
 * Ported to Javascript by Nathan Manousos (nathanm@gmail.com) for AFAR Media (http://afar.com)
 *
 * Original ActionScript Code written and owned by Chris Youderian
 * All code is licensed under the GPLv2.
 * This means that any derivate works that you create using this code must be released under the same license.
 * If you wish to use this code in a product you want to resell, you need to ask for permission.
 * Contact form available at:  www.flashworldmap.com/contactus.php
 * See original posting at:    www.flashmap.org/robinson-projection-in-as3-gpl/
 *
 * Usage:
 *
 *    map = new Robinson(map_width, map_height);
 *    const [x,y] = map.latLongToPx(lat, lng);
 */
function RobinsonMap(mapWidth, mapHeight, offsetX, offsetY) {
  // map width and height are asked for because they are what the
  // earthRadius value relies upon. You can use either, as long as
  // the image is sized such that width = height*1.97165551906973
  // you can use either to do the calculation, but as of now I
  // require both and only use width. both are used in projectToCSS.
  this.mapWidth = mapWidth;
  this.mapHeight = mapHeight;
  this.earthRadius = (mapWidth/2.666269758)/2;

  // offsetX, offsetY are used to offset points, this is to calibrate
  // the points if they aren't showing up in the right place exactly
  this.offsetX = (typeof offsetX === 'undefined') ? 0 : offsetX;
  this.offsetY = (typeof offsetY === 'undefined') ? 0 : offsetY;

  // these tables are created by robinson and are what the projection is based upon
  this.AA = [0.8487,0.84751182,0.84479598,0.840213,0.83359314,0.8257851,0.814752,0.80006949,0.78216192,0.76060494,0.73658673,0.7086645,0.67777182,0.64475739,0.60987582,0.57134484,0.52729731,0.48562614,0.45167814];
  this.BB = [0,0.0838426,0.1676852,0.2515278,0.3353704,0.419213,0.5030556,0.5868982,0.67182264,0.75336633,0.83518048,0.91537187,0.99339958,1.06872269,1.14066505,1.20841528,1.27035062,1.31998003,1.3523];
};

RobinsonMap.prototype.latLongToPx = function(lat,lng){
  // returns the robinson projected point for a given lat/lng based on
  // the earth radius value determined in the contructor

  const roundToNearest = function(roundTo, value){
    return Math.floor(value/roundTo)*roundTo;  //rounds down
  };
  const getSign = function(value){
    return value < 0 ? -1 : 1;
  };

  const radian = 0.017453293; //pi/180
	const lngSign = getSign(lng);
	const latSign = 0-getSign(lat); // sc0ttj: needed to prepend `0-` to the value, in order to flip vertical points
	lng = Math.abs(lng);
	lat = Math.abs(lat); //all calculations positive
  let low = roundToNearest(5, lat-0.0000000001); //want exact numbers to round down
  low = (lat === 0) ? 0 : low; //except when at 0
  const high = low + 5;

  // indicies used for interpolation
  const lowIndex = low/5;
  const highIndex = high/5;
  const ratio = (lat-low)/5;

  // interpolation in one dimension
  const adjAA = ((this.AA[highIndex]-this.AA[lowIndex])*ratio)+this.AA[lowIndex];
	const adjBB = ((this.BB[highIndex]-this.BB[lowIndex])*ratio)+this.BB[lowIndex];

  //create point from robinson function
  const point = {
    x : (adjAA * lng * radian * lngSign * this.earthRadius) + this.offsetX,
    y : (adjBB * latSign * this.earthRadius) + this.offsetY
  };

  return [point.x, point.y];

};

RobinsonMap.prototype.pxToLatLong = function(x,y) {
  return 'TODO';
}


/**
 * Mercator Map
 * This is an adaptation to JavaScript of the original Java utility class MercatorMap by Till Nagel.
 *
 * Creates a new MercatorMap with dimensions and bounding box to convert between geo-locations and screen coordinates.
 *
 * @param mapWidth        Horizontal dimension of this map, in pixels.
 * @param mapHeight       Vertical dimension of this map, in pixels.
 * @param topLatitude     Northern border of this map, in degrees.
 * @param bottomLatitude  Southern border of this map, in degrees.
 * @param leftLongitude   Western border of this map, in degrees.
 * @param rightLongitude  Eastern border of this map, in degrees.
 */
function MercatorMap(mapWidth, mapHeight, topLatitude, bottomLatitude, leftLongitude, rightLongitude) {
  this.mapWidth = mapWidth;
  this.mapHeight = mapHeight;
  this.topLatitudeRelative = this.getScreenYRelative(topLatitude);
  this.bottomLatitudeRelative = this.getScreenYRelative(bottomLatitude);
  this.leftLongitudeRadians = this.degToRadians(leftLongitude);
  this.rightLongitudeRadians = this.degToRadians(rightLongitude);
}

MercatorMap.prototype.latLongToPx = function(latitudeInDegrees, longitudeInDegrees) {
  return [this.getScreenX(longitudeInDegrees), this.getScreenY(latitudeInDegrees)];
}

MercatorMap.prototype.getScreenY = function(latitudeInDegrees) {
  return this.mapHeight*(this.getScreenYRelative(latitudeInDegrees) - this.topLatitudeRelative)/(this.bottomLatitudeRelative - this.topLatitudeRelative);
}

MercatorMap.prototype.getScreenX = function(longitudeInDegrees) {
  const longitudeInRadians = this.degToRadians(longitudeInDegrees);
  return this.mapWidth*(longitudeInRadians - this.leftLongitudeRadians)/(this.rightLongitudeRadians - this.leftLongitudeRadians);
}

MercatorMap.prototype.getScreenYRelative = function(latitudeInDegrees) {
  return Math.log(Math.tan(latitudeInDegrees/360.0*Math.PI + Math.PI/4));
}

MercatorMap.prototype.degToRadians = function(deg) {
  return deg * degToRad;
}

/*
 * add additional methods, based on https://blog.cppse.nl/x-y-to-lat-lon-for-google-maps
 */

MercatorMap.prototype.pxToLatLong = function (x, y){
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
 * define more methods, used by BOTH maps, based on NanoGeoUtil.js
 */

const getDistanceInKm = function(latA, lonA, latB, lonB) {
    // return  distance in Km between two lat longs (takes into account curvature of the earth)
    const dLat = (latB - latA) * degToRad;
    const dLon = (lonB - lonA) * degToRad;
    const num = 12742 * Math.asin(Math.sqrt(0.5 - Math.cos(dLat)/2 + Math.cos(latA * degToRad) * Math.cos(latB * degToRad) * (1 - Math.cos(dLon))/2));
    return Math.round(num * 100) / 100;
}

const getDistanceInPx = function (latA, lonA, latB, lonB) {
  const [x1, y1] = this.latLongToPx(latA, lonA);
  const [x2, y2] = this.latLongToPx(latB, lonB);
  const dx = x1 - x2;
  const dy = y2 - y2;
  return Math.round((Math.sqrt(dx * dx + dy * dy)) * 100) / 100;
}

const getNearestTo = function (obj, arr) {
  const fn = this.getDistanceInKm;
  if (has(obj.lat) && has(obj.long)) {
    const sortedLocations = [...arr].sort((a,b) => {
      // get the distance between [a.lat,a.long] and [lat,long]
      const d1 = fn(obj.lat, obj.long, a.lat, a.long)
      // get the distance between [b.lat,b.long] and [lat,long]
      const d2 = fn(obj.lat, obj.long, b.lat, b.long)
      // return whichever is closest
      return d1 - d2;
    });
    return sortedLocations;
  } else {
    throw Error ('Supply an object with "lat" and "long" properties');
  }
}

const kmToMiles = function(km) {
    return km * 0.621371192;
}

const milesToKm = function(mi) {
    return mi * 1.609344;
}


const arr = [RobinsonMap, MercatorMap];
// add methods defined above to BOTH map prototypes
arr.forEach(map => {
  const m = map.prototype;
  m.getDistanceInKm  = getDistanceInKm;
  m.getDistanceInPx  = getDistanceInPx;
  m.getNearestTo = getNearestTo
  m.kmToMiles    = kmToMiles;
  m.milesToKm    = milesToKm;
});


/*
 * Geo() - the main function to export, returns a RobinsonMap or MercatorMap
 *
*/
const Geo = function (options) {
  const width = options.width || 300;
  const height = options.height || 150;
  const proj = options.projection.toLowerCase();
  let map;

  if (!options.projection || proj !== 'robinson') {
    // from  https://newbedev.com/maximum-lat-and-long-bounds-for-the-world-google-maps-api-latlngbounds
    const worldBounds = {
        lat: { min: -85.05115,  max: 85.05115  },
        lng: { min: -180, max: 180 },
    };
    map = new MercatorMap(
      width,
      height,
      options.top || worldBounds.lat.max,
      options.bottom || worldBounds.lat.min,
      options.left || worldBounds.lng.min,
      options.right || worldBounds.lng.max,
    );
  } else {
    map = new RobinsonMap(
      width,
      height,
      options.offsetX || 0,
      options.offsetY || 0,
    );
  }

  // add projection
  map.projection = proj;
  map.height = height;
  map.width = width;
  // earths radius
  map.rKm = 6366.197723675814    // 20000/Math.PI;
  map.rMiles = 3955.771869579042 // 20000/(1.609344*Math.PI);

  return map;
}

export default Geo;
