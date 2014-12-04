/**
 * AIME-core migration vocabulary rule
 * ====================================
 *
 * Rules concerning the migration of vocabulary items from the mysql database.
 */
var _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function(next) {
    mysql.query('SELECT * FROM tbl_vocabItems WHERE type IN (1,6)', function(err, rows) {

      var voc = _(rows)
        .filter({type: 1})
        .map(function(v) {
          var text = _.find(rows, function(item) {
            return item.root === v.id && item.id !== v.id;
          });

          return {
            fr: {
              title: v.content_fr,
              text: text.content_fr
            },
            en: {
              title: v.content_en,
              text: text.content_en
            }
          };
        })
        .value();

      var batch = neo4j.db.batch();

      voc.forEach(function(v) {

        var fr = batch.save({
          type: 'vocabulary',
          title: v.fr.title,
          text: v.fr.text,
          lang: 'fr',
          mysql_id: v.id
        });

        var en = batch.save({
          type: 'vocabulary',
          title: v.en.title,
          text: v.en.text,
          lang: 'en',
          mysql_id: v.id
        });

        batch.relate(en, 'TRANSLATES', fr);
      });

      console.log('Saving ' + voc.length + ' vocabulary items...');
      batch.commit(function(err, results) {
        if (err) return next(err);

        neo4j.db.label(_(results).filter({type: 'vocabulary'}).map('id').value(), 'Vocabulary', next);
      });
    });
  }
};
