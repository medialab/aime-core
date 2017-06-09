/**
 * AIME-core Abstract Model
 * =========================
 *
 * Collection of methods used by most of AIME-core models.
 */
var db = require('../connection.js'),
    helpers = require('../helpers.js'),
    _ = require('lodash');

module.exports = function(queries, sortFunction) {

  sortFunction = sortFunction || _.identity;

  return {
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
    getByModecross: function(lang, modecross, callback) {
      db.rows(queries.getByModecross, {modecross: modecross, lang: lang}, function(err, result) {

        // On typical error
        if (err) return callback(err);

        return callback(null, sortFunction(helpers.nested(result)));
      });
    },
    getAll: function(user, lang, params, callback) {
      console.log(user)
      params = _.extend({}, {lang: lang}, {
        offset: +params.offset || 0,
        limit: +params.limit || 100000,
        user_id: user.id,
        is_admin: user.role && user.role === 'superAdmin'
      });

      // Executing query
      db.rows(queries.getAll, params, function(err, result) {

        // On typical error
        if (err) return callback(err);

        // Treating incoming data
        var data = helpers.nested(result);

        return callback(null, sortFunction(data));
      });
    },
    search: function(user, lang, query, callback) {

      // Formatting query
      query = helpers.searchRegex(query);

      var params = {
        lang: lang,
        query: query,
        user_id: user.id
      };

      // Executing query
      db.rows(queries.search, params, function(err, result) {
        if (err) return callback(err);

        return callback(null, sortFunction(helpers.nested(result)));
      });
    }
  };
};
