/**
 * AIME-core Scenario Model
 * =========================
 *
 */
var async = require('async'),
    queries = require('../queries.js'),
    db = require('../connection.js');

var model = {

  // Creating a scenario
  create: function(modecross, author, lang, title, items, callback) {

    async.waterfall([
      function retrieveModecross(next) {
        db.query(queries.misc.getModecross, {modecross: modecross}, function(err, nodes) {
          if (err) return next(err);

          return next(null, nodes[0]);
        });
      },
      function createScenario(modecrossNode, next) {
        var batch = db.batch();

        var data = {
          lang: lang,
          type: 'scenario',
          title: title,

          // NOTE: should we?
          status: 'public'
        };

        var scenarioNode = batch.save(data, 'Scenario');

        // Linking modecross
        batch.relate(scenarioNode, 'RELATES_TO', modecrossNode);

        // Linking author
        batch.relate(scenarioNode, 'CREATED_BY', author.id);

        // Linking items
        items.forEach(function(item, i) {
          batch.relate(scenarioNode, 'HAS', item, {order: i});
        });

        // NOTE: override
        return next();
        batch.commit(next);
      }
    ], callback);
  }
};

module.exports = model;
