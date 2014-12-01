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
      var referenceNodes = {};
      references.forEach(function(ref) {
        var fr, en;

        if (!isNaN(+ref.content_fr)) {
          fr = batch.save({
            type: 'reference',
            biblib_id: +ref.content_fr,
            lang: 'fr'
          });

          referenceNodes[ref.id] = fr;
        }

        if (!isNaN(+ref.content_en)) {
          en = batch.save({
            type: 'reference',
            biblib_id: +ref.content_en,
            lang: 'en'
          });

          referenceNodes[ref.id] = en;
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

      // Dealing with text nodes
      var textNodes = {};
      texts.forEach(function(t) {
        var fr, en;

        if (t.content_fr && t.content_fr !== 'frenchContent') {
          fr = batch.save({
            type: 'text',
            text: t.content_fr,
            lang: 'fr'
          });

          textNodes[t.id] = fr;
        }

        if (t.content_en && t.content_en !== 'englishContent') {
          en = batch.save({
            type: 'text',
            text: t.content_en,
            lang: 'en'
          });

          textNodes[t.id] = en;
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

      // Dealing with quote nodes
      var quoteNodes = {};
      quotes.forEach(function(t) {
        var fr, en;

        if (t.content_fr && t.content_fr !== 'frenchContent') {
          fr = batch.save({
            type: 'quote',
            text: t.content_fr,
            lang: 'fr'
          });

          quoteNodes[t.id] = fr;
        }

        if (t.content_en && t.content_en !== 'englishContent') {
          en = batch.save({
            type: 'quote',
            text: t.content_en,
            lang: 'en'
          });

          quoteNodes[t.id] = en;
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

      // Dealing with video nodes
      var videoNodes = {};
      videos.forEach(function(t) {
        var node = batch.save({
          host: 'vimeo',
          identifier: t.content_fr,
          type: 'video'
        });

        videoNodes[t.id] = node;
      });

      // Dealing with pdfs
      var pdfNodes = {};
      pdfs.forEach(function(t) {
        var fr, en;

        if (t.content_fr && t.content_fr !== 'frenchContent') {
          fr = batch.save({
            type: 'pdf',
            title: t.content_fr,
            lang: 'fr'
          });

          pdfNodes[t.id] = fr;
        }

        if (t.content_en && t.content_en !== 'englishContent') {
          en = batch.save({
            type: 'pdf',
            title: t.content_en,
            lang: 'en'
          });

          pdfNodes[t.id] = en;
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

      // Dealing with documents
      titles.forEach(function(root) {
        var fr, en;

        if (root.content_fr && root.content_fr !== 'frenchContent') {
          fr = batch.save({
            title: root.content_fr,
            type: 'document',
            lang: 'fr'
          });
        }

        if (root.content_en && root.content_en !== 'englishContent') {
          en = batch.save({
            title: root.content_en,
            type: 'document',
            lang: 'en'
          });
        }

        if (fr && en)
          batch.relate(en, 'TRANSLATES', fr);
      });

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
          },
          documents: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'document'}).map('id').value(),
              'Document',
              n
            );
          },
          text: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'text'}).map('id').value(),
              'Text',
              n
            );
          },
          quote: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'quote'}).map('id').value(),
              'Quote',
              n
            );
          },
          video: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'video'}).map('id').value(),
              'Video',
              n
            );
          },
          pdf: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'pdf'}).map('id').value(),
              'PDF',
              n
            );
          }
        }, next);
      });
    });
  };
};
