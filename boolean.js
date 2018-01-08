/*
布尔类型判断工具
*/
var hasOwnProperty = Object.prototype.hasOwnProperty;
/**
 * Check whether the object has the property.
 *
 * @param {Object} obj
 * @param {String} key
 * @return {Boolean}
 */
export function hasOwn(obj, key) {
  return hasOwnProperty.call(obj, key);
}

/**
 * Quick object check - this is primarily used to tell
 * Objects from primitive values when we know the value
 * is a JSON-compliant type.
 *
 * @param {*} obj
 * @return {Boolean}
 */

export function isObject(obj) {
  return obj !== null && typeof obj === 'object';
}
/**
 * Strict object type check. Only returns true
 * for plain JavaScript objects.
 *
 * @param {*} obj
 * @return {Boolean}
 */

var toString = Object.prototype.toString;
var OBJECT_STRING = '[object Object]';
export function isPlainObject(obj) {
  return toString.call(obj) === OBJECT_STRING;
}


/**
 * Function type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

export function isFunction(obj) {
  return obj !== null && typeof obj === 'function';
}
/**
 * Array type check.
 *
 * @param {*} obj
 * @return {Boolean}
 */

export const isArray = Array.isArray;
