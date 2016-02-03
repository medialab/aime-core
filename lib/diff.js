/**
 * AIME-core Diff Algorithms
 * ==========================
 *
 * Simple diff functions used to compare modecross & scenarii.
 */
var _ = require('lodash');

/**
 * Helpers
 */
function modecrossSet(array) {
  return array.reduce(function(index, m) {
    var s = m.split('-');

    index[m] = true;

    if (s.length > 1)
      index[s[1] + '-' + s[0]] = true;

    return index;
  }, {});
}

/**
 * Modecross diffing
 */
exports.modecross = function(before, after) {
  var beforeSet = modecrossSet(before),
      afterSet = modecrossSet(after),
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

/**
 * Scenario diffing
 */
exports.scenario = function(before, after) {

};
