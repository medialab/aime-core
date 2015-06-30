/**
 * AIME-core migration vocabulary rule
 * ====================================
 *
 * Rules concerning the migration of vocabulary items from the mysql database.
 */
var _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function(next) {
    mysql.query('SELECT * FROM tbl_vocabItems', function(err, rows) {

      if (err) return next(err);

      var paragraphs = _.filter(rows, {type: 6}),
          shortDefs = _.filter(rows, {type: 3}),
          longDefs = _.filter(rows, {type: 4});

      var voc = _(rows)
        .filter({type: 1})
        .reject(function(row) {

          // Rejecting wrong data
          return row.content_fr === 'frenchContent' && row.content_en === 'englishContent';
        })
        .map(function(v) {
          var shortDef = _.find(shortDefs, {root: v.id}),
              longDef = _.find(longDefs, {root: v.id});

          var shortParagraphs = _(paragraphs)
            .filter({root: v.id})
            .filter(function(e) {
              return e.lft > shortDef.lft && e.rgt < shortDef.rgt;
            })
            .filter(function(e) {
              return e.content_fr && e.content_en;
            })
            .sortBy('lft')
            .value();

          var longParagraphs = _(paragraphs)
            .filter({root: v.id})
            .filter(function(e) {
              return e.lft > longDef.lft && e.rgt < longDef.rgt;
            })
            .filter(function(e) {
              return e.content_fr && e.content_en;
            })
            .sortBy('lft')
            .value();

          return {
            id: v.id,
            fr: {
              title: v.content_fr,
              long: longParagraphs,
              short: shortParagraphs
            },
            en: {
              title: v.content_en,
              long: longParagraphs,
              short: shortParagraphs
            }
          };
        })
        .value();

      var batch = neo4j.db.batch();

      voc.forEach(function(v) {

        var fr = batch.save({
          type: 'vocabulary',
          title: v.fr.title,
          lang: 'fr',
          mysql_id: v.id,
          mysql_model: 3
        });

        var en = batch.save({
          type: 'vocabulary',
          title: v.en.title,
          lang: 'en',
          mysql_id: v.id,
          mysql_model: 3
        });

        batch.relate(en, 'TRANSLATES', fr);

        var parents = {
          fr: fr,
          en: en
        };

        var cache = {};

        // Paragraphs
        var I = 0;
        function saveParagraph(lang, kind) {
          return function(p) {
            var txt = p['content_' + lang];

            if (txt === 'frenchContent' || txt === 'englishContent')
              return;

            var node = batch.save({
              type: 'paragraph',
              mysql_id: p.id,
              lang: lang,
              text: txt,
              // kind: kind,
              mysql_model: 3
            });

            batch.relate(parents[lang], 'HAS', node, {order: I});
            I++;

            if (lang === 'fr')
              cache[p.id] = node;
            else
              batch.relate(node, 'TRANSLATES', cache[p.id]);
          }
        }

        v.fr.short.forEach(saveParagraph('fr', 'short'));
        v.fr.long.forEach(saveParagraph('fr', 'long'));
        I = 0;
        v.en.short.forEach(saveParagraph('en', 'short'));
        v.en.long.forEach(saveParagraph('en', 'long'));
      });

      console.log('Saving ' + voc.length + ' vocabulary items...');
      batch.commit(function(err, results) {
        if (err) return next(err);

        neo4j.db.label(_(results).filter({type: 'vocabulary'}).map('id').value(), 'Vocabulary', function(err, res) {
          if (err) return next(err);

          neo4j.db.label(_(results).filter({type: 'paragraph'}).map('id').value(), 'Paragraph', next);
        });
      });
    });
  }
};
