/**
 * AIME-core Model
 * ================
 *
 * Model in charge of data-retrieval from the Neo4j database.
 */
var db = require('../connection.js'),
    cache = require('../cache.js'),
    queries = require('../queries.js'),
    getIn = require('../../lib/helpers.js').getIn,
    _ = require('lodash');

module.exports = {
  book: function(lang, callback) {

    // Checking cache
    var book = getIn(cache, ['book', lang]);
    if (book)
      return callback(null, book);

    // Executing query
    db.rows(queries.book, {lang: lang}, function(err, response) {

      // On typical error
      if (err) return callback(err);

      // On REST error
      if (response.errors.length) return callback(response.errors[0]);

      // Treating incoming data
      var data = _(response.results[0].data)
        .map(function(line) {
          var c = line.row[0].chapter,
              rc = _.merge({id: c.id}, c.properties);

          rc.children = line.row[0].subheadings.map(function(sub) {
            var s = sub.subheading,
                rs = _.merge({id: s.id}, s.properties);

            rs.children = sub.paragraphs.map(function(p) {
              return _.merge({id: p.id}, p.properties);
            });

            return rs;
          });

          return rc;
        })
        .value();

      // Caching
      cache.book[lang] = data;

      // Returning
      return callback(null, data);
    });
  },
  follow: function(lang, callback) {

    // Checking cache
    var book = getIn(cache, ['book', lang]);
    if (book)
      return callback(null, book);

    // Executing query
    db.rows(queries.follow, {lang: lang}, function(err, response) {

      // On typical error
      if (err) return callback(err);

      // On REST error
      if (response.errors.length) return callback(response.errors[0]);

      // Treating incoming data
      var data = _(response.results[0].data)
        .map(function(line) {
          var c = line.row[0].chapter,
              rc = _.merge({id: c.id}, c.properties);

          rc.children = line.row[0].subheadings.map(function(sub) {
            var s = sub.subheading,
                rs = _.merge({id: s.id}, s.properties);

            rs.children = sub.paragraphs.map(function(p) {
              return _.merge({id: p.id}, p.properties);
            });

            return rs;
          });

          return rc;
        })
        .value();

      // Caching
      cache.book[lang] = data;

      // Returning
      return callback(null, data);
    });
  }
};