/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').document,
    helpers = require('../helpers.js'),
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
      var data = helpers.nested(result);

      return callback(null, helpers.reorder(data, ids, 'slug_id'));
    });
  },
  getAll: function(lang, params, callback) {
    params = _.extend({}, {lang: lang}, {
      offset: +params.offset || 0,
      limit: +params.limit || 100000
    });

    // Executing query
    db.rows(queries.getAll, params, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = helpers.nested(result);

      return callback(null, data);
    });
  },
  search: function(lang, query, callback) {

    // Formatting query
    query = helpers.searchRegex(query);

    // Executing query
    db.rows(queries.search, {lang: lang, query: query}, function(err, result) {
      if (err) return callback(err);

      return callback(null, helpers.nested(result));
    });
  }
};
