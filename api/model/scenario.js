/**
 * AIME-core Scenario Model
 * =========================
 *
 */
var async = require('async'),
    cache = require('../cache.js'),
    diff = require('../../lib/diff.js').scenario,
    db = require('../connection.js');

var MODECROSS_NODES = cache.nodes.modecross;

var model = {

  // Creating a scenario
  create: function(modecross, author, lang, title, items, callback) {
    var batch = db.batch();
console.log(arguments);
    var data = {
      lang: lang,
      type: 'scenario',
      title: title,
      status: 'private'
    };

    var scenarioNode = batch.save(data, 'Scenario');

    // Linking modecross
    batch.relate(scenarioNode, 'RELATES_TO', MODECROSS_NODES[modecross]);

    // Linking author
    batch.relate(scenarioNode, 'CREATED_BY', author.id);

    // Linking items
    items.forEach(function(item, i) {
      batch.relate(scenarioNode, 'HAS', item, {order: i});
    });

    // NOTE: override
    return callback();
    batch.commit(callback);
  },

  // Updating a scenario
  update: function() {

  },

  // Destroying an existing scenario
  destroy: function(id) {

  }
};

module.exports = model;
