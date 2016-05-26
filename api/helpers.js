/**
 * AIME-core API Helpers
 * ======================
 *
 * Miscellaneous helper functions.
 */
var types = require('typology'),
    regexEscape = require('escape-regexp'),
    _ = require('lodash');


// Date-related helpers
function formatDate(date) {
  return date.toISOString().split('T')[0].replace(/-/g, '');
}

function now() {
  return formatDate(new Date());
}

function timestamp() {
  return (new Date()).toISOString();
}

// Treat nested cypher results returned by typical AIME queries
function treat(sub) {
  var item,
      children,
      k;

  // Leaf level
  if (sub.id || sub.id === 0)
    return _.extend({id: sub.id}, sub.properties, _.mapValues(_.omit(sub, ['id', 'properties']), function(o) {
      return (o || {}).id ? treat(o) : o;
    }));

  for (k in sub) {
    if (types.check(sub[k], 'object') && 'id' in sub[k]) {
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
  return rows.map(treat);
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
  return '(?ius).*' + regexEscape(query) + '.*';
}

// Exporting
module.exports = {
  formatDate: formatDate,
  nested: nested,
  now: now,
  reorder: reorder,
  searchRegex: searchRegex,
  timestamp: timestamp
};
