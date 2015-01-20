/**
 * AIME-core migration contributions rule
 * =======================================
 *
 * Rules concerning the migration of contributions items from the mysql database.
 *
 * Notes: STATUS: 0/private 1/moderation 2/public
 */
var async = require('async'),
    _ = require('lodash');

const STATUS = ['private', 'moderation', 'public'];

module.exports = function(mysql, neo4j) {
  return function(topNext) {
    async.waterfall([
      function batch(next) {
        var fields = [
          '`tbl_contributionItems`.id AS id',
          'content_fr',
          'content_en',
          '`tbl_contributionItems`.type AS type',
          '`tbl_contributionItems`.root AS root',
          '`tbl_contributionItems`.create_user_id AS create_user_id',
          'lft',
          'rgt',
          'from_start_fr',
          'from_stop_fr',
          'from_start_en',
          'from_stop_en',
          '`tbl_contributionItems`.private AS private'
        ];

        mysql.query(
          'SELECT ' + fields.join(',') + ' FROM `tbl_contributionItems` ' +
          'LEFT JOIN `tbl_bookmarks` ON ' +
          '`tbl_contributionItems`.root = `tbl_bookmarks`.to_root',
          function(err, rows) {

            if (err) return next(err);

            var batch = neo4j.db.batch();

            // Subfilters
            var elements = _.filter(rows, function(row) {
              return ~[2, 4, 5].indexOf(row.type);
            });

            // Updating rows to track lang
            var titles = _(rows)
              .filter({type: 0})
              .sortBy('lft')
              .map(function(row) {
                return _.merge(row, {
                  lang: row.from_start_fr !== null ? 'fr' : 'en',
                  status: STATUS[row.private]
                });
              })
              .value();

            // Saving contributions
            titles.forEach(function(title) {
              var contributionNode = batch.save({
                type: 'contribution',
                lang: title.lang,
                status: title.status,
                source_platform: 'inquiry',
                title: title.lang === 'fr' ? title.content_fr : title.content_en,
                user_mysql_id: title.create_user_id,
                mysql_id: title.id,
                mysql_model: 4
              });

              // Retrieving slides
              var slides = _(rows)
                .filter({type: 1, root: title.id})
                .value();

              slides.forEach(function(slide, i) {
                var slideNode = batch.save({
                  lang: title.lang,
                  type: 'slide'
                });

                batch.relate(contributionNode, 'HAS', slideNode, {order: i});

                // Retrieving elements
                var slideElements = _(elements)
                  .filter({root: title.id})
                  .filter(function(e) {
                    return e.lft > slide.lft && e.rgt < slide.rgt;
                  })
                  .sortBy('lft')
                  .value();

                slideElements.forEach(function(e, i) {
                  var data,
                      eNode;

                  if (e.type === 4) {
                    var data = JSON.parse(e.content_fr || e.content_en);

                    // Dealing with external media
                    eNode = batch.save({
                      type: 'media',
                      internal: false,
                      html: data.html,
                      kind: data.type === 'photo' ? 'image' : data.type,
                      url: data.url
                    });
                  }
                  else if (e.type === 2) {

                    eNode = batch.save({
                      type: 'paragraph',
                      lang: title.lang,
                      text: title.lang === 'fr' ? e.content_fr : e.content_en
                    });
                  }
                  else if (e.type === 5) {
                    eNode = batch.save({
                      type: 'reference',
                      lang: title.lang,
                      text: title.lang === 'fr' ? e.content_fr : e.content_en
                    });
                  }

                  batch.relate(slideNode, 'HAS', eNode, {order: i});
                });
              });
            });

            console.log('Saving contributions...');
            batch.commit(next);
          }
        );
      },
      function labels(results, next) {

        // Labels
        async.parallel({
          contributions: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'contribution'}).map('id').value(),
              'Contribution',
              n
            );
          },
          slides: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'slide'}).map('id').value(),
              'Slide',
              n
            );
          },
          paragraphs: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'paragraph'}).map('id').value(),
              'Paragraph',
              n
            );
          },
          references: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'reference'}).map('id').value(),
              'Reference',
              n
            );
          },
          media: function(n) {
            neo4j.db.label(
              _(results).filter({type: 'media'}).map('id').value(),
              'Media',
              n
            );
          }
        }, next);
      }
    ], topNext);
  };
};
