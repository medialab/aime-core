/**
 * AIME-core API Helpers
 * ======================
 *
 * Miscellaneous helper functions.
 */
var _ = require('lodash'),
    types = require('typology');

// Treat nested cypher results returned by typical AIME queries
function treat(sub) {
  var item,
      children,
      k;

  // Leaf level
  if (sub.id)
    return _.extend({id: sub.id}, sub.properties, _.omit(sub, ['id', 'properties']));

  for (k in sub) {
    if (types.check(sub[k], 'object') && sub[k].id) {
      if (k === 'parent')
        continue;

      item = _.extend({id: sub[k].id}, sub[k].properties, _.omit(sub[k], ['id', 'properties']));

      if (sub.parent)
        item = _.extend({parent: treat(sub.parent)}, item);
    }
    else {
      children = {};
      children[k] = sub[k].map(treat);
    }
  }

  return _.extend(item, children);
}

function nested(rows) {
  return rows.map(function(r) { return r[0] }).map(treat);
}

// Reorder an array following the given order
function reorder(target, order, key) {
  var ordered = new Array(target.length);

  target.forEach(function(item) {
    ordered[order.indexOf(item[key])] = item;
  });

  return ordered;
}

function searchRegex(query) {
  return "(?i).*" + query + ".*";
}

// Exporting
module.exports = {
  nested: nested,
  reorder: reorder,
  searchRegex: searchRegex
};
