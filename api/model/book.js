/**
 * AIME-core Book Model
 * =====================
 *
 */
var db = require('../connection.js'),
    queries = require('../queries.js').book,
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
          var c = line.row[0].chapter,
              rc = _.extend({id: c.id}, c.properties);

          rc.children = line.row[0].subheadings.map(function(sub) {
            var s = sub.subheading,
                rs = _.extend({id: s.id}, s.properties);

            rs.children = sub.paragraphs.map(function(p) {
              return _.extend({id: p.id}, p.properties);
            });

            return rs;
          });

          return rc;
        })
        .value();

      // Returning
      return callback(null, data);
    });
  }
};
