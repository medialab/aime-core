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
function compare(m1, m2) {
  var s1 = m1.split('-'),
      s2 = m2.split('-');

  if (s1.length !== s2.length)
    return false;

  return _.union(s1, s2).length === s1.length;
}

function set(array) {
  return array.reduce(function(index, item) {
    index[item] = true;
    return index;
  }, {});
}

/**
 * Modecross diffing
 */
exports.modecross = function(before, after) {
  var beforeSet = set(before),
      afterSet = set(after),
      additions = [],
      deletions = [];

  del:
  for (var k in beforeSet) {
    for (var j in afterSet) {
      if (compare(k, j))
        continue del;
    }

    deletions.push(k);
  }

  add:
  for (var k in afterSet) {
    for (var j in beforeSet) {
      if (compare(k, j))
        continue add;
    }

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
