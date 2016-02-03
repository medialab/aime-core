/**
 * AIME-core Scenario Model
 * =========================
 *
 */
var async = require('async'),
    cache = require('../cache.js'),
    diff = require('../../lib/diff.js').scenario,
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

    items = _(items)
      .map(parseItem)
      .groupBy('type')
      .mapValues(function(v) {
        return _.map(v, function(i) {
          return +i.id;
        });
      })
      .value();

    var scenarioNode = batch.save(data);
    batch.label(scenarioNode, 'Scenario');

    // Linking modecross
    batch.relate(scenarioNode, 'RELATES_TO', MODECROSS_NODES[modecross]);

    // Linking author
    batch.relate(scenarioNode, 'CREATED_BY', author.id);

    // Linking items
    db.query(queries.getItems, items, function(err, data) {
      if (err) return callback(err);

      _.map(data, 'id').forEach(function(id, i) {
        batch.relate(scenarioNode, 'HAS', id, {order: i});
      });

      return batch.commit(callback);
    });
  },

  // Updating a scenario
  update: function() {

  },

  // Destroying an existing scenario
  destroy: function(id) {

  }
};

module.exports = model;
