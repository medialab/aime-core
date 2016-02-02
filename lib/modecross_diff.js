/**
 * AIME-core ModeCross Diff
 * =========================
 *
 * Simple function comparing two sets of modecross to compute the diff
 * between both.
 */
var _ = require('lodash');

/**
 * Helpers
 */
function set(array) {
  return array.reduce(function(index, m) {
    var s = m.split('-');

    index[m] = true;

    if (s.length > 1)
      index[s[1] + '-' + s[0]] = true;

    return index;
  }, {});
}

/**
 * Main
 */
module.exports = function diff(before, after) {
  var beforeSet = set(before),
      afterSet = set(after),
      additions = [],
      deletions = [];

  for (var k in beforeSet) {
    if (!afterSet[k])
      deletions.push(k);
  }

  for (var k in afterSet) {
    if (!beforeSet[k])
      additions.push(k);
  }

  return {
    additions: additions,
    deletions: deletions
  };
};
