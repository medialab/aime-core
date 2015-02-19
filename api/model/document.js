/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').document,
    nested = require('../helpers.js').nested,
    _ = require('lodash');

module.exports = {
  getBySlugIds: function(ids, callback) {

    // Casting to int for cypher to work
    ids = ids.map(function(id) {
      return +id.replace(/\w+_/, '');
    });

    // Executing query
    db.rows(queries.getBySlugIds, {slug_ids: ids}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = nested(result);

      return callback(null, data);
    });
  },
  getAll: function(lang, callback) {

    // Executing query
    db.rows(queries.getAll, {lang: lang}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = nested(result);

      return callback(null, data);
    });
  }
};
