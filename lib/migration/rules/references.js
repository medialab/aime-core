/**
 * AIME-core migration references rule
 * ====================================
 *
 * Rules concerning the linking of references and quotes to what they are
 * pointing at.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(neo4j) {
  return function users(topNext) {

    async.waterfall([
      function fetchContributions(next) {
        neo4j.db.query('MATCH (n:Slide)-[r:HAS]-(e) RETURN n,r,e;', next);
      },
      function users(entities, next) {

        var edgeIndex = {},
            batch = neo4j.db.batch();

        function hash(a, b) {
          return a + '||' + b;
        }

        // Sorting
        var slides = _(entities)
          .groupBy(function(row) {
            return row.n.id;
          })
          .map(function(rows) {
            return rows.map(function(row) {
              return row.e;
            });
          })
          .value();

        // Each slides
        slides.forEach(function(elements) {

          // Each elements
          var last;
          elements.forEach(function(e) {

            if (last &&
                e.type === 'reference' &&
                (e.lang && last.lang ? e.lang === last.lang : true) &&
                !edgeIndex[hash(e.id, last.id)]) {
              batch.relate(e.id, 'REFERS_TO', last.id);
              edgeIndex[hash(e.id, last.id)];
            }

            if (last &&
                e.type === 'quote' &&
                (e.lang && last.lang ? e.lang === last.lang : true) &&
                !edgeIndex[hash(e.id, last.id)]) {
              batch.relate(e.id, 'QUOTES', last.id);
              edgeIndex[hash(e.id, last.id)];
            }

            last = e;
          });
        });

        console.log('Saving references links...');
        batch.commit(next);
      }
    ], topNext);
  }
};
