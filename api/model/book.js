/**
 * AIME-core Book Model
 * =====================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').book,
    helpers = require('../helpers.js'),
    _ = require('lodash');

module.exports = {
  getAll: function(lang, params, callback) {

    // Executing query
    db.rows(queries.getAll, {lang: lang}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = helpers.nested(result);

      // Returning
      return callback(null, data);
    });
  },
  getByModecross: function(lang, modecross, callback) {

    // Executing query
    db.rows(queries.getByModecross, {lang: lang, modecross: modecross}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = helpers.nested(result);

      // Returning
      return callback(null, data);
    });
  },
  search: function(lang, query, callback) {

    // Formatting query
    query = helpers.searchRegex(query);

    // Executing query
    db.rows(queries.search, {lang: lang, query: query}, callback);
  }
};
