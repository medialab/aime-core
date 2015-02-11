/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').vocabulary,
    nested = require('../helpers.js').nested,
    _ = require('lodash');

module.exports = {
  getByIds: function(ids, lang, callback) {

    // Casting to int for cypher to work
    ids = ids.map(function(id) {
      return +id;
    });

    // Executing query
    db.rows(queries.getByIds, {ids: ids}, function(err, result) {

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
