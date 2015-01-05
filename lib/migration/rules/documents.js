/**
 * AIME-core migration documents rule
 * ===================================
 *
 * Rules concerning the migration of document items from the mysql database.
 *
 * Notes: Images linking need to import the images before (obviously...)
 */
var async = require('async'),
    _ = require('lodash');

module.exports = function(mysql, neo4j) {
  return function(topNext) {
    async.waterfall([
      function fetchImages(next) {
        neo4j.db.query('MATCH (n:`Resource`) RETURN n;', function(err, results) {
          var imagesIndex = {};

          results.forEach(function(img) {
            imagesIndex[img.mysql_id] = img;
          });

          next(null, imagesIndex);
        });
      },
      function saveDocument(imagesIndex, next) {
        mysql.query('SELECT * from tbl_documentItems', function(err, rows) {

          var batch = neo4j.db.batch(),
              nodeIndex = {};

          // Subfilters
          var titles     = _.filter(rows, {type: 0}),
              slides     = _.filter(rows, {type: 1}),
              texts      = _.filter(rows, {type: 2}),
              quotes     = _.filter(rows, {type: 3}),
              images     = _.filter(rows, {type: 4}),
              videos     = _.filter(rows, {type: 5}),
              pdfs       = _.filter(rows, {type: 6}),
              references = _.filter(rows, {type: 7}),
              elements   = _.filter(rows, function(row) {
                return row.type > 1;
              });

          // Dealing with biblib references
          // NOTE: possible loss of translation edge if source data is corrupt
          var referencesIndex = {};
          references.forEach(function(ref) {
            var fr, en;

            if (!isNaN(+ref.content_fr) && !referencesIndex[+ref.content_fr]) {
              fr = batch.save({
                type: 'reference',
                biblib_id: +ref.content_fr,
                lang: 'fr'
              });

              referencesIndex[+ref.content_fr] = fr;
            }

            if (!isNaN(+ref.content_en) && !referencesIndex[+ref.content_en]) {
              en = batch.save({
                type: 'reference',
                biblib_id: +ref.content_en,
                lang: 'en'
              });

              referencesIndex[+ref.content_en] = en;
            }

            if (fr && en)
              batch.relate(en, 'TRANSLATES', fr);
          });

          // Dealing with text nodes
          texts.forEach(function(t) {
            var fr, en;
            nodeIndex[t.id] = {};

            if (t.content_fr && t.content_fr !== 'frenchContent') {
              fr = batch.save({
                type: 'paragraph',
                text: t.content_fr,
                lang: 'fr'
              });

              nodeIndex[t.id].fr = fr;
            }

            if (t.content_en && t.content_en !== 'englishContent') {
              en = batch.save({
                type: 'paragraph',
                text: t.content_en,
                lang: 'en'
              });

              nodeIndex[t.id].en = en;
            }

            if (fr && en)
              batch.relate(en, 'TRANSLATES', fr);
          });

          // Dealing with quote nodes
          quotes.forEach(function(t) {
            var fr, en;
            nodeIndex[t.id] = {};

            if (t.content_fr && t.content_fr !== 'frenchContent') {
              fr = batch.save({
                type: 'resource',
                kind: 'quote',
                text: t.content_fr,
                lang: 'fr'
              });

              nodeIndex[t.id].fr = fr;
            }

            if (t.content_en && t.content_en !== 'englishContent') {
              en = batch.save({
                type: 'resource',
                kind: 'quote',
                text: t.content_en,
                lang: 'en'
              });

              nodeIndex[t.id].en = en;
            }

            if (fr && en)
              batch.relate(en, 'TRANSLATES', fr);
          });

          // Dealing with video nodes
          videos.forEach(function(t) {
            var node = batch.save({
              source: 'external',
              kind: 'video',
              host: 'vimeo',
              iframe: '<iframe class="vimeo" data-src="http://player.vimeo.com/video/' + t.content_fr + '?title=0&byline=0&portrait=0&color=ffffff" frameborder="0" webkitallowfullscreen="" mozallowfullscreen="" allowfullscreen="" src="http://player.vimeo.com/video/72195431?title=0&byline=0&portrait=0&color=ffffff"></iframe>',
              url: 'http://player.vimeo.com/video/' + t.content_fr,
              identifier: t.content_fr,
              type: 'resource'
            });

            nodeIndex[t.id] = node;
          });

          // Dealing with pdfs
          var pdfsIndex = {};
          pdfs.forEach(function(t) {
            var fr, en;

            if (t.content_fr && t.content_fr !== 'frenchContent' && !pdfsIndex[t.content_fr]) {
              fr = batch.save({
                source: 'internal',
                type: 'resource',
                kind: 'pdf',
                title: t.content_fr,
                lang: 'fr'
              });

              pdfsIndex[t.content_fr] = fr;
            }

            if (t.content_en && t.content_en !== 'englishContent' && !pdfsIndex[t.content_en]) {
              en = batch.save({
                source: 'internal',
                type: 'resource',
                kind: 'pdf',
                title: t.content_en,
                lang: 'en'
              });

              pdfsIndex[t.content_en] = en;
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
                lang: 'fr',
                mysql_id: root.id,
                mysql_model: 2
              });
            }

            if (root.content_en && root.content_en !== 'englishContent') {
              en = batch.save({
                title: root.content_en,
                type: 'document',
                lang: 'en',
                mysql_id: root.id,
                mysql_model: 2
              });
            }

            if (fr && en)
              batch.relate(en, 'TRANSLATES', fr);

            // Dealing with the current document slides
            var docSlides = _(slides)
              .filter({root: root.id})
              .sortBy('lft')
              .value();

            docSlides.forEach(function(ds, i) {
              var dsNodeFr, dsNodeEn;

              if (fr) {
                dsNodeFr = batch.save({
                  type: 'slide',
                  lang: 'fr'
                });

                batch.relate(fr, 'HAS', dsNodeFr, {order: i});
              }

              if (en) {
                dsNodeEn = batch.save({
                  type: 'slide',
                  lang: 'en'
                });

                batch.relate(en, 'HAS', dsNodeEn, {order: i});
              }

              // Dealing with elements attached to the current slide
              var slideElements = _(elements)
                .filter({root: root.id})
                .filter(function(e) {
                  return e.lft > ds.lft && e.rgt < ds.rgt;
                })
                .sortBy('lft')
                .value();

              slideElements.forEach(function(e, i) {

                if (~[2, 3].indexOf(e.type)) {

                  // Targeting node index and is language relevant
                  if (nodeIndex[e.id].fr && dsNodeFr)
                    batch.relate(dsNodeFr, 'HAS', nodeIndex[e.id].fr, {order: i});
                  if (nodeIndex[e.id].en && dsNodeEn)
                    batch.relate(dsNodeEn, 'HAS', nodeIndex[e.id].en, {order: i});
                }
                else if (e.type === 6) {

                  // Dealing with pdfs
                  if (dsNodeFr && pdfsIndex[e.content_fr])
                    batch.relate(dsNodeFr, 'HAS', pdfsIndex[e.content_fr], {order: i});
                  if (dsNodeEn && pdfsIndex[e.content_en])
                    batch.relate(dsNodeEn, 'HAS', pdfsIndex[e.content_en], {order: i});
                }
                else if (e.type === 7) {

                  // Dealing with references
                  if (dsNodeFr && !isNaN(+e.content_fr))
                    batch.relate(dsNodeFr, 'HAS', referencesIndex[+e.content_fr], {order: i});
                  if (dsNodeEn && !isNaN(+e.content_en))
                    batch.relate(dsNodeEn, 'HAS', referencesIndex[+e.content_en], {order: i});
                }
                else if (e.type === 4) {

                  // Targeting images
                  if (dsNodeFr)
                    batch.relate(dsNodeFr, 'HAS', imagesIndex[+e.content_fr || +e.content_en].id, {order: i});
                  if (dsNodeEn)
                    batch.relate(dsNodeEn, 'HAS', imagesIndex[+e.content_fr || +e.content_en].id, {order: i});
                }
                else if (e.type === 5) {

                  // Targeting videos (lang is irrelevant)
                  if (dsNodeFr)
                    batch.relate(dsNodeFr, 'HAS', nodeIndex[e.id], {order: i});
                  if (dsNodeEn)
                    batch.relate(dsNodeEn, 'HAS', nodeIndex[e.id], {order: i});
                }
              });
            });
          });

          next(null, batch);
        });
      },
      function commit(batch, next) {

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
                _(results).filter({type: 'paragraph'}).map('id').value(),
                'Paragraph',
                n
              );
            },
            resource: function(n) {
              neo4j.db.label(
                _(results).filter({type: 'resource'}).map('id').value(),
                'Resource',
                n
              );
            },
            slide: function(n) {
              neo4j.db.label(
                _(results).filter({type: 'slide'}).map('id').value(),
                'Slide',
                n
              );
            }
          }, next);
        });
      }
    ], topNext);
  };
};
