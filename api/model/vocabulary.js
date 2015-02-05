/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').vocabulary,
    _ = require('lodash');

module.exports = {
  getAll: function(lang, callback) {

    // Executing query
    db.rows(queries.getAll, {lang: lang}, function(err, result) {

      // On typical error
      if (err) return callback(err);

      // Treating incoming data
      var data = _(result)
        .map(function(line) {
          var v = line.row[0],
              rv = _.extend({id: v.id}, v.properties);

          rv.children = line.row[1].map(function(p) {
            return _.extend({id: p.id}, p.properties);
          });

          return rv;
        })
        .value();

      return callback(null, data);
    });
  }
};
