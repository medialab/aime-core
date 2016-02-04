/**
 * AIME-core Scenario Model
 * =========================
 *
 */
var async = require('async'),
    cache = require('../cache.js'),
    queries = require('../queries.js').scenario,
    db = require('../connection.js'),
    _ = require('lodash');

var MODECROSS_NODES = cache.nodes.modecross,
    ITEM_REGEX = /(\w+)_(\d+)/;

var TYPES = {
  bsc: 'bsc',
  cont: 'doc',
  doc: 'doc',
  voc: 'voc'
};

/**
 * Helpers
 */
function parseItem(string) {
  var m = string.match(ITEM_REGEX);

  return {
    type: TYPES[m[1]],
    id: m[2]
  }
}

/**
 * Model functions
 */
var model = {

  // Creating a scenario
  create: function(modecross, author, lang, title, items, callback) {
    var batch = db.batch();

    var data = {
      lang: lang,
      type: 'scenario',
      title: title,

      // NOTE: really?
      status: 'public'
    };

    // Keep track of items' order
    var order = items.reduce(function(o, item, i) {
      o[item] = i;
      return o;
    }, {});

    // Processing items
    items = _(items)
      .map(parseItem)
      .groupBy('type')
      .mapValues(function(v) {
        return _.map(v, function(i) {
          return +i.id;
        });
      })
      .value();

    // Defaults
    items = _.extend({bsc: [], voc: [], doc: []}, items);

    var scenarioNode = batch.save(data);
    batch.label(scenarioNode, 'Scenario');

    // Linking modecross
    batch.relate(scenarioNode, 'RELATES_TO', MODECROSS_NODES[modecross]);

    // Linking author
    batch.relate(scenarioNode, 'CREATED_BY', author.id);

    // Linking items
    db.query(queries.getItems, items, function(err, rows) {
      if (err) return callback(err);

      rows.forEach(function(row) {
        batch.relate(scenarioNode, 'HAS', row.id, {order: order[row.slug_id]});
      });

      return batch.commit(callback);
    });
  },

  // Updating a scenario
  update: function(id, title, items, callback) {
    var batch = db.batch();

    // Do we need to update the title?
    if (title)
      batch.save(id, 'title', title);

    if (items) {

      // Keep track of items' order
      var order = items.reduce(function(o, item, i) {
        o[item] = i;
        return o;
      }, {});

      // Processing items
      items = _(items)
        .map(parseItem)
        .groupBy('type')
        .mapValues(function(v) {
          return _.map(v, function(i) {
            return +i.id;
          });
        })
        .value();

      // Defaults
      items = _.extend({bsc: [], voc: [], doc: []}, items);

      return async.waterfall([
        function getLinks(next) {
          db.query(queries.getLinks, {scenario: id}, next);
        },
        function getLinkedItems(links, next) {
          links.forEach(function(link) {
            batch.rel.delete(link.id);
          });

          db.query(queries.getItems, items, next);
        },
        function persistLinks(rows, next) {
          rows.forEach(function(row) {
            batch.relate(id, 'HAS', row.id, {order: order[row.slug_id]});
          });

          return batch.commit(next);
        }
      ], callback);
    }

    return batch.commit(callback);
  },

  // Destroying an existing scenario
  destroy: function(id, callback) {
    return db.delete(id, true, callback);
  }
};

module.exports = model;
