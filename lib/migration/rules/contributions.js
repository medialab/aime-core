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

module.exports = function(mysql, neo4j) {
  return function(next) {
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
      'from_stop_en'
    ];

    mysql.query(
      'SELECT ' + fields.join(',') + ' FROM `tbl_contributionItems` ' +
      'LEFT JOIN `tbl_bookmarks` ON ' +
      '`tbl_contributionItems`.root = `tbl_bookmarks`.to_root',
      function(err, rows) {

        var batch = neo4j.db.batch();

        var titles = _.filter(rows, {type: 0});

        console.log(titles);

        next();
      }
    );
  };
};
