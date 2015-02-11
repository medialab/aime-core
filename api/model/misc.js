/**
 * AIME-core Misc Model
 * =====================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').search,
    nested = require('../helpers.js').nested,
    _ = require('lodash');

module.exports = {
  search: function(query, callback) {

    // Formatting query
    query = "(?i).*" + query + ".*";

    // Executing query
    db.rows(queries.searchAllModels, {query: query}, function(err, result) {
      if (err) return callback(err);

      return callback(null, result.map(function(e) {
        return e[0];
      }))
    });
  }
};
