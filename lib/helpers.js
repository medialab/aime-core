/**
 * AIME-core Helpers
 * ==================
 *
 * Miscellaneous helper functions.
 */

// Retrieving nested values according to given path
function getIn(object, path) {
  path = path || [];

  var c = object,
      i,
      l;

  for (i = 0, l = path.length; i < l; i++) {
    if (!c)
      return;
    c = c[path[i]];
  }

  return c;
}

// Exporting
module.exports = {
  getIn: getIn
};
