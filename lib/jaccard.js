/**
 * AIME-core Jaccard Similarity
 * =============================
 *
 * Just a basic Jaccard similarity function.
 */
var _ = require('lodash');

module.exports = function jaccard(a, b) {
  if (a === b)
    return 1;

  a = a.split('');
  b = b.split('');

  return _.intersection(a, b).length / _.union(a, b).length;
};
