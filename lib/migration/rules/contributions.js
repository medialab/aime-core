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
          'content_fr',
          'content_en',
          '`tbl_contributionItems`.type AS type',
          '`tbl_contributionItems`.root AS root',
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

            // Updating rows to track lang
            var titles = _(rows)
              .filter({type: 0})
              .map(function(row) {
                return _.merge(row, {
                  lang: row.from_start_fr !== null ? 'fr' : 'en',
                  status: STATUS[row.private]
                });
              })
              .value();

            // Saving contributions
            titles.forEach(function(title) {
              var contribution = batch.save({
                type: 'contribution',
                lang: title.lang,
                status: title.status,
                text: title.lang === 'fr' ? title.content_fr : title.content_en
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
          }
        }, next);
      }
    ], topNext);
  };
};
