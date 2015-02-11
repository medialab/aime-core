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
    return _.extend({id: sub.id}, sub.properties);

  for (k in sub) {
    if (types.check(sub[k], 'object') && sub[k].id) {
      item = _.extend({id: sub[k].id}, sub[k].properties);
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

// Exporting
module.exports = {
  nested: nested
};
