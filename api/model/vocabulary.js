/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').vocabulary,
    helpers = require('../helpers.js'),
    _ = require('lodash');

module.exports = {
  getByIds: function(ids, callback) {

    // Casting to int for cypher to work
    ids = ids.map(function(id) {
      return +id;
    });

    // Executing query
    db.rows(queries.getByIds, {ids: ids}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = helpers.nested(result);

      return callback(null, helpers.reorder(data, ids, 'id'));
    });
  },
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
  }
};
