/**
 * AIME-core migration documents rule
 * ===================================
 *
 * Rules concerning the migration of document items from the mysql database.
 *
 * Notes: image will have to be linked afterwards.
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function(next) {
    mysql.query('SELECT * from tbl_documentItems', function(err, rows) {

      var batch = neo4j.db.batch();

      // Subfilters
      var titles     = _.filter(rows, {type: 0}),
          slides     = _.filter(rows, {type: 1}),
          texts      = _.filter(rows, {type: 2}),
          quotes     = _.filter(rows, {type: 3}),
          images     = _.filter(rows, {type: 4}),
          videos     = _.filter(rows, {type: 5}),
          pdfs       = _.filter(rows, {type: 6}),
          references = _.filter(rows, {type: 7});


      // Dealing with biblib references
      var biblib = {};
      references.forEach(function(ref) {
        var fr, en;

        if (!isNaN(+ref.content_fr)) {
          fr = batch.save({
            type: 'reference',
            biblib_id: +ref.content_fr,
            lang: 'fr'
          });

          biblib[+ref.content_fr] = fr;
        }

        if (!isNaN(+ref.content_en)) {
          en = batch.save({
            type: 'reference',
            biblib_id: +ref.content_en,
            lang: 'en'
          });

          biblib[+ref.content_en] = en;
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

      // Dealing with documents
      // TODO: continue here...

      // Committing
      console.log('Saving document items...');
      batch.commit(function(err, results) {

        // Labels
        async.parallel({
          references: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'reference'}).map('id').value(),
              'Reference',
              n
            );
          }
        }, next);
      });
    });
  };
};
