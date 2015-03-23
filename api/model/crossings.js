/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').crossings,
    _ = require('lodash');

module.exports = {
  getInfo: function(lang, callback) {
    db.rows(queries.getInfo, {lang: lang}, function(err, results) {
      if (err) return callback(err);

      return callback(null, {
        modes: _.indexBy(results[0][0], 'name'),
        cross: _.indexBy(results[1][0], 'name'),
        maxCount: {
          modes: _.max(results[0][0], 'count').count,
          cross: _.max(results[1][0], 'count').count
        }
      });
    });
  },
  getRelatedToModecross: function(mode, lang, callback) {
    db.rows(queries.modecross, {name: mode, lang: lang}, callback);
  }
};
