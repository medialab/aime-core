/**
 * AIME-core Book Model
 * =====================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').book,
    nested = require('../helpers.js').nested,
    _ = require('lodash');

module.exports = {
  getAll: function(lang, callback) {

    // Executing query
    db.rows(queries.getAll, {lang: lang}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = nested(result);

      // Returning
      return callback(null, data);
    });
  }
};
