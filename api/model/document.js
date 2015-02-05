/**
 * AIME-core Document Model
 * =========================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').document,
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
          var d = line.row[0],
              rd = _.extend({id: d.id}, d.properties);

          rd.children = line.row[1].map(function(s) {
            var rs = _.extend({id: s.slide.id}, s.slide.properties);

            rs.children = s.children.map(function(e) {
              return _.extend({id: e.id}, e.properties);
            });

            return rs;
          });

          return rd;
        })
        .value();

      return callback(null, data);
    });
  }
};
