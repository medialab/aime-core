/**
 * AIME-core Vocabulary Model
 * ===========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').vocabulary,
    _ = require('lodash');

// TODO: compile queries
// TODO: better model abstraction
// TODO: with fracking cache
module.exports = {
  getAll: function(lang, callback) {

    // Executing query
    db.rows(queries.vocabulary, {lang: lang}, function(err, response) {

      // On typical error
      if (err) return callback(err);

      // On REST error
      if (response.errors.length) return callback(response.errors[0]);

      // Treating incoming data
      var data = _(response.results[0].data)
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
