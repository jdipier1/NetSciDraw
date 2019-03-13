/**************************************
* Math Utility script
*
* -Jason Heller
**************************************/

/** Returns the normalized values of an array
 * 
 * @param {*} array 
 */
function _normalize(array) {
    var len = array[0]*array[0];

    for(var i = 1; i < array.length; i++) {
        len += array[i]*array[i];
    }

    for(var i = 0; i < array.length; i++) {
        array[i] *= 1.0/Math.sqrt(len);
    }

    return array;
}


function _roundDown(array, x) {
    for(var i = 0; i < array.length; i++) {
        array[i] = Math.floor(array[i] / x) * x;
    }

    return array;
}


/** Finds the dot product of A and B
 * 
 * @param {*} A
 * @param {*} B 
 */
function _dotProduct(A, B) {
    var dp = 0;

    for(var i = 0; i < A.length; i++) {
        dp += A[i]*B[i];
    }

    return dp;
}

function _distanceSquared(x1, y1, x2, y2) {
    var dx = x2-x1;
    var dy = y2-y1;

    return (dx*dx) + (dy*dy);
}

/** Calculates the direction of a line in radians
 * 
 * @param {*} x1
 * @param {*} y1 
 * @param {*} x2 
 * @param {*} y2 
 */
function _pointDirection(x1, y1, x2, y2) {
    var dx = x1-x2;
    var dy = y1-y2;

    return Math.atan2(dy,dx);
}

/** Distance formula
 * 
 * @param {*} x1 point 1's x position
 * @param {*} y1 point 1's y position
 * @param {*} x2 point 2's x position
 * @param {*} y2 point 2's y position
 */
function _distance(x1, y1, x2, y2) {
    return Math.sqrt(_distanceSquared(x1, y1, x2, y2));
}

/** Linear interpolation
 * 
 * @param {*} start the starting value
 * @param {*} end the end value
 * @param {*} amount the amount to interpolate between, within the range [0, 1]
 */
function _lerp(start, end, amount) {
    return start + (amount * (end - start));
}

/** Is Point in hull
 * 
 * Checked if x,y is within a convex hull with points [x1,y1 x2,y2, ...]
 * Points should be defined counter-clockwise
 * 
 * @param {*} x the x position of the point
 * @param {*} y the y position of the point
 * @param {*} points the points of the convex hull, defined counter-clockwise, as an array of reals (x1, y1, x2, y2, ...)
 * 
 * Note: points should be divisible by 2 and have a length grater than 3
 */
function _isPointInHull(x, y, points) {
    for(var i = 0; i < points.length+4; i += 2) {
        if (_signedDistanceTo(x,y, _toRelX(points[i]), _toRelY(points[i+1]), _toRelX(points[i+2]), _toRelY(points[i+3])) < 0) {
            return false;
        }
    }

    if (_signedDistanceTo(x,y, _toRelX(points[points.length-2]), _toRelY(points[points.length-1]), _toRelX(points[0]), _toRelY(points[1])) < 0) {
        return false;
    }

    return true;
}

function _signedDistanceTo(x, y, x1, y1, x2, y2) {
    return (x - x2) * (y1 - y2) - (x1 - x2) * (y - y2);
}