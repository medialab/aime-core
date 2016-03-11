/**
 * AIME-core Jaccard Similarity
 * =============================
 *
 * Just a basic Jaccard similarity function.
 */
var _ = require('lodash');

module.exports = function jaccard(a, b) {
  return _.intersection(a, b) / _.union(a, b);
};
